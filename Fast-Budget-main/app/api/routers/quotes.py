from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.crud.quote import create_quote, get_quote, list_quotes
from app.schemas.quote import QuoteCreate, QuoteRead

router = APIRouter()


@router.post("/", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
def create(
    quote_in: QuoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_active_user),
) -> QuoteRead:
    try:
        return create_quote(db, current_user.id, quote_in)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/", response_model=list[QuoteRead])
def read_many(db: Session = Depends(get_db), skip: int = 0, limit: int = 100) -> list[QuoteRead]:
    return list_quotes(db, skip=skip, limit=limit)


@router.get("/{quote_id}", response_model=QuoteRead)
def read_one(quote_id: int, db: Session = Depends(get_db)) -> QuoteRead:
    quote = get_quote(db, quote_id)
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orçamento não encontrado")
    return quote