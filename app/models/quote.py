from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_name: Mapped[str] = mapped_column(String(150), nullable=False)
    client_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    created_by = relationship("User", back_populates="quotes")
    services = relationship("QuoteService", back_populates="quote", cascade="all, delete-orphan")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")


class QuoteService(Base):
    __tablename__ = "quote_services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    quote_id: Mapped[int] = mapped_column(ForeignKey("quotes.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    line_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    quote = relationship("Quote", back_populates="services")


class QuoteItem(Base):
    __tablename__ = "quote_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    quote_id: Mapped[int] = mapped_column(ForeignKey("quotes.id"), nullable=False)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    line_total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    quote = relationship("Quote", back_populates="items")