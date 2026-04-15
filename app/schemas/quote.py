from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class QuoteLineService(BaseModel):
    service_id: int
    quantity: int = Field(default=1, ge=1)


class QuoteLineItem(BaseModel):
    item_id: int
    quantity: int = Field(default=1, ge=1)


class QuoteCreate(BaseModel):
    client_name: str = Field(min_length=2, max_length=150)
    client_email: str | None = None
    notes: str | None = None
    services: list[QuoteLineService] = Field(default_factory=list)
    items: list[QuoteLineItem] = Field(default_factory=list)


class QuoteLineServiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    service_id: int
    quantity: int
    unit_price: float
    line_total: float


class QuoteLineItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    item_id: int
    quantity: int
    unit_price: float
    line_total: float


class QuoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_name: str
    client_email: str | None
    notes: str | None
    total_amount: float
    created_by_id: int
    created_at: datetime
    services: list[QuoteLineServiceRead] = Field(default_factory=list)
    items: list[QuoteLineItemRead] = Field(default_factory=list)