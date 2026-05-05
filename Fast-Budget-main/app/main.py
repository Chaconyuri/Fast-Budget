from fastapi import FastAPI

from app.api.routers import auth, items, quotes, services
from app.common.config import settings
from app.db.base import Base
from app.db.session import engine


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="API para gestão de orçamento de serviços com autenticação JWT.",
    openapi_tags=[
        {"name": "auth", "description": "Autenticação e perfil do usuário."},
        {"name": "services", "description": "Cadastro e manutenção de serviços."},
        {"name": "items", "description": "Cadastro e manutenção de itens."},
        {"name": "quotes", "description": "Geração e consulta de orçamentos."},
    ],
)


@app.get("/", tags=["auth"])
def root() -> dict[str, str]:
    return {"message": "API de orçamento ativa"}


app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(services.router, prefix=f"{settings.API_V1_STR}/services", tags=["services"])
app.include_router(items.router, prefix=f"{settings.API_V1_STR}/items", tags=["items"])
app.include_router(quotes.router, prefix=f"{settings.API_V1_STR}/quotes", tags=["quotes"])
