from sqlalchemy.orm import Session

from app.models.item import Item
from app.models.quote import Quote, QuoteItem, QuoteService
from app.models.service import Service
from app.schemas.quote import QuoteCreate


def create_quote(db: Session, user_id: int, quote_in: QuoteCreate) -> Quote:
    quote = Quote(
        client_name=quote_in.client_name,
        client_email=quote_in.client_email,
        notes=quote_in.notes,
        created_by_id=user_id,
    )

    total_amount = 0.0

    for line in quote_in.services:
        service = db.query(Service).filter(Service.id == line.service_id).first()
        if not service:
            raise ValueError(f"Serviço {line.service_id} não encontrado")
        unit_price = float(service.unit_price)
        line_total = unit_price * line.quantity
        quote.services.append(
            QuoteService(service_id=service.id, quantity=line.quantity, unit_price=unit_price, line_total=line_total)
        )
        total_amount += line_total

    for line in quote_in.items:
        item = db.query(Item).filter(Item.id == line.item_id).first()
        if not item:
            raise ValueError(f"Item {line.item_id} não encontrado")
        unit_price = float(item.unit_price)
        line_total = unit_price * line.quantity
        quote.items.append(QuoteItem(item_id=item.id, quantity=line.quantity, unit_price=unit_price, line_total=line_total))
        total_amount += line_total

    quote.total_amount = total_amount
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote


def list_quotes(db: Session, skip: int = 0, limit: int = 100) -> list[Quote]:
    return db.query(Quote).offset(skip).limit(limit).all()


def get_quote(db: Session, quote_id: int) -> Quote | None:
    return db.query(Quote).filter(Quote.id == quote_id).first()