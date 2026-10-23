import uuid
from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel, col, select

from app.api.deps import CurrentUser, SessionDep
from app.models import User
from app.pms.models import (
    AppraisalCycle,
    Campus,
    CampusInput,
    CycleInput,
    Designation,
    Employee,
    EmployeeInput,
    Goal,
    GoalTemplate,
    Kpi,
    KpiInput,
    Kra,
    KraInput,
    Role,
    TemplateInput,
    TemplateKpi,
)

router = APIRouter(prefix="/pms", tags=["pms"])


class Actor:
    def __init__(self, user: User, employee: Employee | None):
        self.user = user
        self.employee = employee
        self.role = (
            Role.CORPORATE_HR
            if user.is_superuser
            else (employee.role if employee else Role.EMPLOYEE)
        )

    def corporate(self) -> None:
        if self.role != Role.CORPORATE_HR:
            raise HTTPException(403, "Chỉ Corporate HR được thực hiện thao tác này")

    def campus_hr(self, campus_id: uuid.UUID) -> None:
        if self.role == Role.CORPORATE_HR:
            return
        if (
            self.role != Role.CAMPUS_HR
            or not self.employee
            or self.employee.campus_id != campus_id
        ):
            raise HTTPException(403, "Không có quyền quản lý campus này")


def get_actor(session: SessionDep, user: CurrentUser) -> Actor:
    employee = session.exec(select(Employee).where(Employee.user_id == user.id)).first()
    return Actor(user, employee)


ActorDep = Annotated[Actor, Depends(get_actor)]


def require[T: SQLModel](session: Session, model: type[T], id: uuid.UUID) -> T:
    value = session.get(model, id)
    if value is None:
        raise HTTPException(404, "Không tìm thấy dữ liệu")
    return value


def commit(session: Session) -> None:
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            409, "Mã, email hoặc liên kết đã tồn tại; vui lòng tải lại dữ liệu"
        )


def save[T: SQLModel](session: Session, value: T) -> T:
    session.add(value)
    commit(session)
    session.refresh(value)
    return value


def visible_employees(session: Session, actor: Actor) -> list[Employee]:
    query = select(Employee).order_by(Employee.code)
    if actor.role == Role.CORPORATE_HR:
        return list(session.exec(query).all())
    if not actor.employee:
        return []
    if actor.role == Role.CAMPUS_HR:
        query = query.where(Employee.campus_id == actor.employee.campus_id)
    elif actor.role == Role.MANAGER:
        query = query.where(
            (Employee.manager_id == actor.employee.id)
            | (Employee.id == actor.employee.id)
        )
    else:
        query = query.where(Employee.id == actor.employee.id)
    return list(session.exec(query).all())


def visible_cycles(session: Session, actor: Actor) -> list[AppraisalCycle]:
    query = select(AppraisalCycle).order_by(col(AppraisalCycle.year).desc())
    if actor.role != Role.CORPORATE_HR:
        if not actor.employee:
            return []
        query = query.where(AppraisalCycle.campus_id == actor.employee.campus_id)
    return list(session.exec(query).all())


def visible_goals(session: Session, actor: Actor) -> list[Goal]:
    employees = visible_employees(session, actor)
    if not employees:
        return []
    return list(
        session.exec(
            select(Goal).where(col(Goal.employee_id).in_([e.id for e in employees]))
        ).all()
    )


@router.get("/workspace")
def workspace(session: SessionDep, actor: ActorDep) -> dict[str, Any]:
    employees = visible_employees(session, actor)
    goals = visible_goals(session, actor)
    campuses = list(session.exec(select(Campus).order_by(Campus.code)).all())
    if actor.role != Role.CORPORATE_HR:
        campuses = [
            c for c in campuses if actor.employee and c.id == actor.employee.campus_id
        ]
    templates = []
    for template in session.exec(
        select(GoalTemplate).order_by(GoalTemplate.code)
    ).all():
        if (
            actor.role not in (Role.CORPORATE_HR, Role.CAMPUS_HR)
            and template.status != "PUBLISHED"
        ):
            continue
        links = session.exec(
            select(TemplateKpi).where(TemplateKpi.template_id == template.id)
        ).all()
        templates.append(
            {**template.model_dump(), "kpi_ids": [link.kpi_id for link in links]}
        )
    return {
        "role": actor.role,
        "employee_id": actor.employee.id if actor.employee else None,
        "campuses": campuses,
        "designations": session.exec(
            select(Designation).order_by(Designation.code)
        ).all(),
        "employees": employees,
        "kras": session.exec(select(Kra).order_by(Kra.code)).all(),
        "kpis": session.exec(select(Kpi).order_by(Kpi.code)).all(),
        "templates": templates,
        "cycles": visible_cycles(session, actor),
        "goals": goals,
        "stats": {
            "employees": len(employees),
            "cycles": len(visible_cycles(session, actor)),
            "goals": len(goals),
            "submitted_goals": sum(g.status == "SUBMITTED" for g in goals),
        },
    }


@router.post("/campuses", response_model=Campus, status_code=201)
def create_campus(body: CampusInput, session: SessionDep, actor: ActorDep) -> Campus:
    actor.corporate()
    return save(session, Campus.model_validate(body))


@router.post("/designations", response_model=Designation, status_code=201)
def create_designation(
    body: CampusInput, session: SessionDep, actor: ActorDep
) -> Designation:
    actor.corporate()
    return save(session, Designation.model_validate(body))


@router.post("/employees", response_model=Employee, status_code=201)
def create_employee(
    body: EmployeeInput, session: SessionDep, actor: ActorDep
) -> Employee:
    actor.corporate()
    require(session, Campus, body.campus_id)
    require(session, Designation, body.designation_id)
    if body.manager_id:
        manager = require(session, Employee, body.manager_id)
        if manager.role not in (Role.MANAGER, Role.CORPORATE_HR, Role.CAMPUS_HR):
            raise HTTPException(422, "Nhân sự được chọn chưa có vai trò quản lý")
    if body.user_id:
        require(session, User, body.user_id)
    return save(session, Employee.model_validate(body))


@router.post("/kras", response_model=Kra, status_code=201)
def create_kra(body: KraInput, session: SessionDep, actor: ActorDep) -> Kra:
    actor.corporate()
    return save(session, Kra.model_validate(body))


@router.post("/kpis", response_model=Kpi, status_code=201)
def create_kpi(body: KpiInput, session: SessionDep, actor: ActorDep) -> Kpi:
    actor.corporate()
    require(session, Kra, body.kra_id)
    return save(session, Kpi.model_validate(body))


@router.post("/templates", status_code=201, response_model=GoalTemplate)
def create_template(
    body: TemplateInput, session: SessionDep, actor: ActorDep
) -> GoalTemplate:
    actor.corporate()
    require(session, Designation, body.designation_id)
    for kpi_id in set(body.kpi_ids):
        kpi = require(session, Kpi, kpi_id)
        if not kpi.active or not require(session, Kra, kpi.kra_id).active:
            raise HTTPException(422, "Template chỉ được dùng KRA/KPI Active")
    template = GoalTemplate.model_validate(body.model_dump(exclude={"kpi_ids"}))
    session.add(template)
    try:
        session.flush()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, "Mã template đã tồn tại")
    for kpi_id in set(body.kpi_ids):
        session.add(TemplateKpi(template_id=template.id, kpi_id=kpi_id))
    commit(session)
    session.refresh(template)
    return template


@router.post("/templates/{template_id}/publish", response_model=GoalTemplate)
def publish_template(
    template_id: uuid.UUID, session: SessionDep, actor: ActorDep
) -> GoalTemplate:
    actor.corporate()
    template = require(session, GoalTemplate, template_id)
    links = session.exec(
        select(TemplateKpi).where(TemplateKpi.template_id == template_id)
    ).all()
    if not links:
        raise HTTPException(422, "Template chưa có KPI")
    for link in links:
        kpi = require(session, Kpi, link.kpi_id)
        if not kpi.active or not require(session, Kra, kpi.kra_id).active:
            raise HTTPException(422, "KRA/KPI không còn Active")
    template.status = "PUBLISHED"
    return save(session, template)


@router.post("/cycles", response_model=AppraisalCycle, status_code=201)
def create_cycle(
    body: CycleInput, session: SessionDep, actor: ActorDep
) -> AppraisalCycle:
    actor.campus_hr(body.campus_id)
    require(session, Campus, body.campus_id)
    return save(session, AppraisalCycle.model_validate(body))


@router.post("/cycles/{cycle_id}/assign")
def assign_goals(
    cycle_id: uuid.UUID, session: SessionDep, actor: ActorDep
) -> dict[str, Any]:
    cycle = require(session, AppraisalCycle, cycle_id)
    actor.campus_hr(cycle.campus_id)
    if cycle.status not in ("DRAFT", "ACTIVE"):
        raise HTTPException(409, "Chu kỳ không cho phép phân bổ")
    employees = session.exec(
        select(Employee).where(Employee.campus_id == cycle.campus_id)
    ).all()
    if not employees:
        raise HTTPException(422, "Campus chưa có nhân sự")
    issues = []
    plan = []
    for employee in employees:
        existing = session.exec(
            select(Goal).where(
                Goal.cycle_id == cycle_id, Goal.employee_id == employee.id
            )
        ).first()
        if existing:
            continue  # Re-running must preserve previously assigned/submitted snapshots.
        templates = session.exec(
            select(GoalTemplate).where(
                GoalTemplate.designation_id == employee.designation_id,
                GoalTemplate.status == "PUBLISHED",
            )
        ).all()
        if len(templates) != 1:
            issues.append(
                {
                    "employee_id": employee.id,
                    "employee_name": employee.full_name,
                    "code": "MISSING_TEMPLATE"
                    if not templates
                    else "DUPLICATE_TEMPLATE",
                }
            )
            continue
        template = templates[0]
        links = session.exec(
            select(TemplateKpi).where(TemplateKpi.template_id == template.id)
        ).all()
        if not links:
            issues.append(
                {
                    "employee_id": employee.id,
                    "employee_name": employee.full_name,
                    "code": "EMPTY_TEMPLATE",
                }
            )
        for link in links:
            kpi = require(session, Kpi, link.kpi_id)
            kra = require(session, Kra, kpi.kra_id)
            plan.append(
                Goal(
                    cycle_id=cycle_id,
                    employee_id=employee.id,
                    template_id=template.id,
                    kpi_id=kpi.id,
                    snapshot={
                        "kpi_code": kpi.code,
                        "kpi_name": kpi.name,
                        "kra_name": kra.name,
                        "unit": kpi.unit,
                        "rubric": template.rubric,
                        "template_name": template.name,
                        "manager_id": str(employee.manager_id)
                        if employee.manager_id
                        else None,
                    },
                )
            )
    if issues:
        return {
            "assigned": 0,
            "issues": issues,
            "message": "Chưa phân bổ: cần xử lý toàn bộ lỗi mapping",
        }
    session.add_all(plan)
    cycle.status = "ACTIVE"
    session.add(cycle)
    commit(session)
    return {
        "assigned": len(plan),
        "issues": [],
        "message": "Phân bổ mục tiêu thành công",
    }


@router.post("/cycles/{cycle_id}/submit-goals")
def submit_goals(
    cycle_id: uuid.UUID, session: SessionDep, actor: ActorDep
) -> dict[str, str]:
    if not actor.employee:
        raise HTTPException(403, "Tài khoản chưa được liên kết hồ sơ nhân sự")
    cycle = require(session, AppraisalCycle, cycle_id)
    if cycle.status != "ACTIVE":
        raise HTTPException(409, "Chu kỳ chưa mở xác nhận mục tiêu")
    goals = session.exec(
        select(Goal).where(
            Goal.cycle_id == cycle_id, Goal.employee_id == actor.employee.id
        )
    ).all()
    if not goals:
        raise HTTPException(422, "Bạn chưa được phân bổ mục tiêu trong chu kỳ này")
    for goal in goals:
        if goal.status == "ASSIGNED":
            goal.status = "SUBMITTED"
            goal.submitted_at = datetime.now(UTC)
            session.add(goal)
    commit(session)
    return {"message": "Đã xác nhận bộ mục tiêu"}
