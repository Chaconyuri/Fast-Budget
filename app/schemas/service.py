from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    unit_price: float = Field(gt=0)
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    unit_price: float | None = Field(default=None, gt=0)
    is_active: bool | None = None


class ServiceRead(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime