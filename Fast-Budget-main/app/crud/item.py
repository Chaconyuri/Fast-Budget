from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


def create_item(db: Session, user_id: int, item_in: ItemCreate) -> Item:
    item = Item(**item_in.model_dump(), created_by_id=user_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_items(db: Session, skip: int = 0, limit: int = 100) -> list[Item]:
    return db.query(Item).offset(skip).limit(limit).all()


def get_item(db: Session, item_id: int) -> Item | None:
    return db.query(Item).filter(Item.id == item_id).first()


def update_item(db: Session, item: Item, item_in: ItemUpdate) -> Item:
    for field, value in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item: Item) -> None:
    db.delete(item)
    db.commit()