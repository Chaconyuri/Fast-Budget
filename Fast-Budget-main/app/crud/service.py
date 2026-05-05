from sqlalchemy.orm import Session

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


def create_service(db: Session, user_id: int, service_in: ServiceCreate) -> Service:
    service = Service(**service_in.model_dump(), created_by_id=user_id)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def list_services(db: Session, skip: int = 0, limit: int = 100) -> list[Service]:
    return db.query(Service).offset(skip).limit(limit).all()


def get_service(db: Session, service_id: int) -> Service | None:
    return db.query(Service).filter(Service.id == service_id).first()


def update_service(db: Session, service: Service, service_in: ServiceUpdate) -> Service:
    for field, value in service_in.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


def delete_service(db: Session, service: Service) -> None:
    db.delete(service)
    db.commit()