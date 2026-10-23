"""PMS integration tests use isolated in-memory DBs, never the local demo DB."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select

from app import crud
from app.api.deps import get_db
from app.main import app
from app.models import UserCreate
from app.pms.models import (
    AppraisalCycle,
    Campus,
    Designation,
    Employee,
    Goal,
    GoalTemplate,
    Kpi,
    Kra,
    Role,
)


@pytest.fixture
def setup():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )

    @event.listens_for(engine, "connect")
    def foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")

    SQLModel.metadata.create_all(engine)

    def db_override():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = db_override
    with Session(engine) as session:
        crud.create_user(
            session=session,
            user_create=UserCreate(
                email="admin@example.com",
                password="test-password-123",
                is_superuser=True,
            ),
        )
        campus = Campus(code="HCM", name="HCM")
        other_campus = Campus(code="HN", name="Hà Nội")
        designation = Designation(code="DEV", name="Developer")
        kra = Kra(code="KRA", name="Delivery")
        session.add_all([campus, other_campus, designation, kra])
        session.commit()
        kpi = Kpi(code="KPI", name="Delivery KPI", kra_id=kra.id, unit="%")
        session.add(kpi)
        session.commit()
        ids = {
            "campus": str(campus.id),
            "other_campus": str(other_campus.id),
            "designation": str(designation.id),
            "kpi": str(kpi.id),
            "kra": str(kra.id),
        }
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/login/access-token",
            data={"username": "admin@example.com", "password": "test-password-123"},
        )
        assert response.status_code == 200
        headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        yield client, headers, engine, ids
    app.dependency_overrides.clear()
    engine.dispose()


def account(client, engine, ids, email, role=Role.EMPLOYEE, other=False):
    with Session(engine) as session:
        user = crud.create_user(
            session=session,
            user_create=UserCreate(email=email, password="test-password-123"),
        )
        employee = Employee(
            code=email,
            full_name=email,
            email=email,
            role=role,
            user_id=user.id,
            campus_id=uuid.UUID(ids["other_campus"] if other else ids["campus"]),
            designation_id=uuid.UUID(ids["designation"]),
        )
        session.add(employee)
        session.commit()
        session.refresh(employee)
        employee_id = employee.id
        user_id = user.id
    response = client.post(
        "/api/v1/login/access-token",
        data={"username": email, "password": "test-password-123"},
    )
    assert response.status_code == 200
    return (
        {"Authorization": f"Bearer {response.json()['access_token']}"},
        employee_id,
        user_id,
    )


def cycle(client, headers, ids):
    response = client.post(
        "/api/v1/pms/cycles",
        headers=headers,
        json={
            "code": "CYCLE",
            "name": "Cycle",
            "year": 2026,
            "campus_id": ids["campus"],
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]


def template(client, headers, ids, code="TPL"):
    response = client.post(
        "/api/v1/pms/templates",
        headers=headers,
        json={
            "code": code,
            "name": "Template",
            "designation_id": ids["designation"],
            "kpi_ids": [ids["kpi"]],
            "rubric": "Rubric snapshot",
        },
    )
    assert response.status_code == 201, response.text
    id = response.json()["id"]
    assert (
        client.post(f"/api/v1/pms/templates/{id}/publish", headers=headers).status_code
        == 200
    )
    return id


def test_full_assignment_submit_and_snapshot(setup):
    client, hr, engine, ids = setup
    employee_headers, employee_id, _ = account(
        client, engine, ids, "employee@example.com"
    )
    template_id = template(client, hr, ids)
    cycle_id = cycle(client, hr, ids)
    result = client.post(f"/api/v1/pms/cycles/{cycle_id}/assign", headers=hr)
    assert result.json()["assigned"] == 1
    assert (
        client.post(f"/api/v1/pms/cycles/{cycle_id}/assign", headers=hr).json()[
            "assigned"
        ]
        == 0
    )
    with Session(engine) as session:
        t = session.get(GoalTemplate, uuid.UUID(template_id))
        t.rubric = "Changed later"
        session.add(t)
        session.commit()
    workspace = client.get("/api/v1/pms/workspace", headers=employee_headers).json()
    assert workspace["goals"][0]["snapshot"]["rubric"] == "Rubric snapshot"
    assert len(workspace["employees"]) == 1
    for _ in range(2):
        assert (
            client.post(
                f"/api/v1/pms/cycles/{cycle_id}/submit-goals", headers=employee_headers
            ).status_code
            == 200
        )
    with Session(engine) as session:
        goals = session.exec(select(Goal)).all()
        assert (
            len(goals) == 1
            and goals[0].status == "SUBMITTED"
            and goals[0].submitted_at is not None
        )
        assert goals[0].employee_id == employee_id


def test_missing_and_duplicate_templates_do_not_assign(setup):
    client, hr, engine, ids = setup
    account(client, engine, ids, "employee@example.com")
    cycle_id = cycle(client, hr, ids)
    missing = client.post(f"/api/v1/pms/cycles/{cycle_id}/assign", headers=hr).json()
    assert missing["issues"][0]["code"] == "MISSING_TEMPLATE"
    template(client, hr, ids)
    template(client, hr, ids, code="TPL2")
    duplicate = client.post(f"/api/v1/pms/cycles/{cycle_id}/assign", headers=hr).json()
    assert duplicate["issues"][0]["code"] == "DUPLICATE_TEMPLATE"
    with Session(engine) as session:
        assert not session.exec(select(Goal)).all()
        assert session.get(AppraisalCycle, uuid.UUID(cycle_id)).status == "DRAFT"


def test_scope_and_campus_hr_permissions(setup):
    client, hr, engine, ids = setup
    campus_hr, _, _ = account(
        client, engine, ids, "campus@example.com", role=Role.CAMPUS_HR
    )
    own, own_id, _ = account(client, engine, ids, "employee@example.com")
    account(client, engine, ids, "other@example.com", other=True)
    assert (
        client.post(
            "/api/v1/pms/kras", headers=own, json={"code": "X", "name": "X"}
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/api/v1/pms/cycles",
            headers=campus_hr,
            json={
                "code": "OTHER",
                "name": "Other",
                "year": 2026,
                "campus_id": ids["other_campus"],
            },
        ).status_code
        == 403
    )
    workspace = client.get("/api/v1/pms/workspace", headers=own).json()
    assert [e["id"] for e in workspace["employees"]] == [str(own_id)]
    workspace = client.get("/api/v1/pms/workspace", headers=campus_hr).json()
    assert len(workspace["employees"]) == 2
    assert len(workspace["campuses"]) == 1
    cycle_id = cycle(client, campus_hr, ids)
    assert (
        client.post(f"/api/v1/pms/cycles/{cycle_id}/assign", headers=own).status_code
        == 403
    )
    assert (
        client.post(
            f"/api/v1/pms/cycles/{cycle_id}/submit-goals", headers=own
        ).status_code
        == 409
    )
    assert client.get("/api/v1/pms/workspace").status_code == 401


def test_inactive_kpi_duplicate_codes_and_invalid_fk(setup):
    client, hr, engine, ids = setup
    with Session(engine) as session:
        kpi = session.get(Kpi, uuid.UUID(ids["kpi"]))
        kpi.active = False
        session.add(kpi)
        session.commit()
    payload = {
        "code": "TPL",
        "name": "Template",
        "designation_id": ids["designation"],
        "kpi_ids": [ids["kpi"]],
        "rubric": "rubric",
    }
    assert (
        client.post("/api/v1/pms/templates", headers=hr, json=payload).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/pms/campuses",
            headers=hr,
            json={"code": "HCM", "name": "duplicate"},
        ).status_code
        == 409
    )
    assert (
        client.post(
            "/api/v1/pms/kpis",
            headers=hr,
            json={"code": "NEW", "name": "New", "kra_id": str(uuid.uuid4())},
        ).status_code
        == 404
    )
    assert (
        client.post(
            "/api/v1/pms/campuses", headers=hr, json={"code": " ", "name": "blank"}
        ).status_code
        == 422
    )


def test_duplicate_template_code_returns_conflict(setup):
    client, hr, _, ids = setup
    template(client, hr, ids)
    response = client.post(
        "/api/v1/pms/templates",
        headers=hr,
        json={
            "code": "TPL",
            "name": "Duplicate",
            "designation_id": ids["designation"],
            "kpi_ids": [ids["kpi"]],
            "rubric": "rubric",
        },
    )
    assert response.status_code == 409


def test_linked_account_cannot_be_deleted(setup):
    client, hr, engine, ids = setup
    own, _, user_id = account(client, engine, ids, "employee@example.com")
    assert client.delete(f"/api/v1/users/{user_id}", headers=hr).status_code == 409
    assert client.delete("/api/v1/users/me", headers=own).status_code == 409
