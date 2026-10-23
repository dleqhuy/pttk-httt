"""Explicit local setup. Production uses Alembic, never create_all at startup."""

import argparse

from sqlmodel import Session, SQLModel, select

from app import crud
from app.core.config import settings
from app.core.db import engine, init_db
from app.models import UserCreate
from app.pms.models import (
    AppraisalCycle,
    Campus,
    Designation,
    Employee,
    GoalTemplate,
    Kpi,
    Kra,
    Role,
    TemplateKpi,
)


def seed_demo(session: Session) -> None:
    if session.exec(select(Campus)).first():
        return
    campus = Campus(code="HCM", name="Campus Hồ Chí Minh")
    designation = Designation(code="SPECIALIST", name="Chuyên viên")
    kra = Kra(
        code="DELIVERY",
        name="Hiệu quả công việc",
        description="Nhóm tiêu chí minh họa; cần chốt trước sử dụng thật",
    )
    session.add_all([campus, designation, kra])
    session.flush()
    kpi = Kpi(
        code="KPI-001",
        name="Hoàn thành kế hoạch",
        description="KPI mẫu để kiểm tra luồng phân bổ",
        kra_id=kra.id,
        unit="%",
    )
    manager = Employee(
        code="NV001",
        full_name="Nguyễn Minh Anh",
        email="minhanh@example.com",
        campus_id=campus.id,
        designation_id=designation.id,
        role=Role.MANAGER,
    )
    session.add_all([kpi, manager])
    session.flush()
    employee = Employee(
        code="NV002",
        full_name="Trần Hoàng Nam",
        email="hoangnam@example.com",
        campus_id=campus.id,
        designation_id=designation.id,
        manager_id=manager.id,
    )
    template = GoalTemplate(
        code="TPL-SPECIALIST-01",
        name="Mục tiêu chuyên viên · bản mẫu",
        designation_id=designation.id,
        rubric="Rubric mẫu: mô tả mức đạt sẽ được cấu hình sau khi chốt thang điểm. Chưa dùng để tính điểm chính thức.",
        status="PUBLISHED",
    )
    cycle = AppraisalCycle(
        code="PMS-2026-HCM",
        name="Đánh giá hiệu suất 2026",
        campus_id=campus.id,
        year=2026,
    )
    session.add_all([employee, template, cycle])
    session.flush()
    session.add(TemplateKpi(template_id=template.id, kpi_id=kpi.id))
    session.commit()


def seed_demo_accounts(session: Session) -> None:
    if not settings.PMS_DEMO_PASSWORD:
        return
    campus = session.exec(select(Campus).where(Campus.code == "HCM")).first()
    designation = session.exec(
        select(Designation).where(Designation.code == "SPECIALIST")
    ).first()
    if not campus or not designation:
        return
    # Only the explicit sample records are linked; reruns preserve passwords.
    samples = [
        ("NV001", "minhanh@example.com", "Nguyễn Minh Anh", Role.MANAGER),
        ("NV002", "hoangnam@example.com", "Trần Hoàng Nam", Role.EMPLOYEE),
        ("NV003", "campus.hr@example.com", "Lê Thu Hà", Role.CAMPUS_HR),
    ]
    for code, email, name, role in samples:
        employee = session.exec(select(Employee).where(Employee.code == code)).first()
        if employee and (employee.email != email or employee.user_id):
            continue
        user = crud.get_user_by_email(session=session, email=email)
        if user:
            continue  # Never attach a pre-existing unrelated account.
        user = crud.create_user(
            session=session,
            user_create=UserCreate(
                email=email, full_name=name, password=settings.PMS_DEMO_PASSWORD
            ),
        )
        if not employee:
            employee = Employee(
                code=code,
                full_name=name,
                email=email,
                role=role,
                campus_id=campus.id,
                designation_id=designation.id,
            )
        employee.user_id = user.id
        session.add(employee)
        session.commit()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Add illustrative PMS data and accounts when PMS_DEMO_PASSWORD is set",
    )
    args = parser.parse_args()
    if settings.FASTAPI_ENV != "development":
        raise SystemExit("Bootstrap chỉ dành cho development. Production dùng Alembic.")
    if settings.DATABASE_URL.startswith("sqlite://"):
        SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        init_db(session)
        if args.demo:
            seed_demo(session)
            seed_demo_accounts(session)


if __name__ == "__main__":
    main()
