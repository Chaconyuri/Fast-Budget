from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.crud.item import create_item, delete_item, get_item, list_items, update_item
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate

router = APIRouter()


@router.post("/", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create(
    item_in: ItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_active_user),
) -> ItemRead:
    return create_item(db, current_user.id, item_in)


@router.get("/", response_model=list[ItemRead])
def read_many(db: Session = Depends(get_db), skip: int = 0, limit: int = 100) -> list[ItemRead]:
    return list_items(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ItemRead)
def read_one(item_id: int, db: Session = Depends(get_db)) -> ItemRead:
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado")
    return item


@router.put("/{item_id}", response_model=ItemRead)
def update(
    item_id: int,
    item_in: ItemUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_active_user),
) -> ItemRead:
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado")
    if item.created_by_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para alterar este item")
    return update_item(db, item, item_in)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_active_user),
) -> None:
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado")
    if item.created_by_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para excluir este item")
    delete_item(db, item)