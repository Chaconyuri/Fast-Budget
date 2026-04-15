from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.crud.service import create_service, delete_service, get_service, list_services, update_service
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter()


@router.post("/", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_active_user),
) -> ServiceRead:
    return create_service(db, current_user.id, service_in)


@router.get("/", response_model=list[ServiceRead])
def read_many(db: Session = Depends(get_db), skip: int = 0, limit: int = 100) -> list[ServiceRead]:
    return list_services(db, skip=skip, limit=limit)


@router.get("/{service_id}", response_model=ServiceRead)
def read_one(service_id: int, db: Session = Depends(get_db)) -> ServiceRead:
    service = get_service(db, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")
    return service


@router.put("/{service_id}", response_model=ServiceRead)
def update(
    service_id: int,
    service_in: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_active_user),
) -> ServiceRead:
    service = get_service(db, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")
    if service.created_by_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para alterar este serviço")
    return update_service(db, service, service_in)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove(
    service_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_active_user),
) -> None:
    service = get_service(db, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serviço não encontrado")
    if service.created_by_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para excluir este serviço")
    delete_service(db, service)