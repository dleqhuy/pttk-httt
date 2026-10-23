import uuid
from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import EmailStr, field_validator
from sqlalchemy import JSON, Column, UniqueConstraint
from sqlmodel import Field, SQLModel


class Role(StrEnum):
    CORPORATE_HR = "corporate_hr"
    CAMPUS_HR = "campus_hr"
    MANAGER = "manager"
    EMPLOYEE = "employee"


class CampusInput(SQLModel):
    code: str = Field(min_length=1, max_length=40)
    name: str = Field(min_length=1, max_length=160)

    @field_validator("code", "name")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Không được để trống")
        return value.strip()


class Campus(CampusInput, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    __table_args__ = (UniqueConstraint("code"),)


class Designation(CampusInput, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    __table_args__ = (UniqueConstraint("code"),)


class EmployeeInput(SQLModel):
    code: str = Field(min_length=1, max_length=40)
    full_name: str = Field(min_length=1, max_length=160)
    email: EmailStr
    campus_id: uuid.UUID
    designation_id: uuid.UUID
    manager_id: uuid.UUID | None = None
    user_id: uuid.UUID | None = None
    role: Role = Role.EMPLOYEE

    @field_validator("code", "full_name")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Không được để trống")
        return value.strip()


class Employee(EmployeeInput, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    campus_id: uuid.UUID = Field(foreign_key="campus.id")
    designation_id: uuid.UUID = Field(foreign_key="designation.id")
    manager_id: uuid.UUID | None = Field(default=None, foreign_key="employee.id")
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", unique=True)
    __table_args__ = (UniqueConstraint("code"), UniqueConstraint("email"))


class KraInput(CampusInput):
    description: str = Field(default="", max_length=2000)
    active: bool = True


class Kra(KraInput, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    __table_args__ = (UniqueConstraint("code"),)


class KpiInput(KraInput):
    kra_id: uuid.UUID
    unit: str = Field(default="", max_length=40)


class Kpi(KpiInput, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    kra_id: uuid.UUID = Field(foreign_key="kra.id")
    __table_args__ = (UniqueConstraint("code"),)


class TemplateInput(CampusInput):
    designation_id: uuid.UUID
    kpi_ids: list[uuid.UUID] = Field(min_length=1, max_length=100)
    rubric: str = Field(min_length=1, max_length=4000)

    @field_validator("rubric")
    @classmethod
    def nonblank_rubric(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Rubric không được để trống")
        return value.strip()


class GoalTemplate(CampusInput, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    designation_id: uuid.UUID = Field(foreign_key="designation.id")
    rubric: str = Field(max_length=4000)
    status: str = Field(default="DRAFT", max_length=30)
    __table_args__ = (UniqueConstraint("code"),)


class TemplateKpi(SQLModel, table=True):
    template_id: uuid.UUID = Field(foreign_key="goaltemplate.id", primary_key=True)
    kpi_id: uuid.UUID = Field(foreign_key="kpi.id", primary_key=True)


class CycleInput(CampusInput):
    campus_id: uuid.UUID
    year: int = Field(ge=2000, le=2200)


class AppraisalCycle(CycleInput, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    campus_id: uuid.UUID = Field(foreign_key="campus.id")
    status: str = Field(default="DRAFT", max_length=30)
    __table_args__ = (UniqueConstraint("code"),)


class Goal(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    cycle_id: uuid.UUID = Field(foreign_key="appraisalcycle.id")
    employee_id: uuid.UUID = Field(foreign_key="employee.id")
    template_id: uuid.UUID = Field(foreign_key="goaltemplate.id")
    kpi_id: uuid.UUID = Field(foreign_key="kpi.id")
    snapshot: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
    status: str = Field(default="ASSIGNED", max_length=30)
    submitted_at: datetime | None = None
    __table_args__ = (UniqueConstraint("cycle_id", "employee_id", "kpi_id"),)
