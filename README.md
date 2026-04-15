# Sistema de Orçamento com FastAPI

API para cadastro de usuários, serviços, itens e geração de orçamentos com autenticação JWT.

## Tecnologias

- FastAPI
- SQLAlchemy 2
- SQLite por padrão
- JWT com `python-jose`
- Hash de senha com `passlib`

## Estrutura

- `app/api` rotas e dependências
- `app/common` configuração e segurança
- `app/crud` regras de acesso a dados
- `app/models` tabelas do banco
- `app/schemas` contratos de entrada e saída

## Configuração

1. Crie um arquivo `.env` com base em `.env.example`.
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

## Executar

```bash
uvicorn app.main:app --reload
```

## Swagger

A documentação interativa fica disponível em:

- Swagger UI: `/docs`
- ReDoc: `/redoc`

## Fluxo de uso

1. Cadastre um usuário em `/api/v1/auth/register`.
2. Faça login em `/api/v1/auth/login` e receba o token JWT.
3. Use o token no botão Authorize do Swagger com o esquema Bearer.
4. Cadastre serviços em `/api/v1/services`.
5. Cadastre itens em `/api/v1/items`.
6. Gere um orçamento em `/api/v1/quotes` enviando os serviços e itens selecionados.

## Rotas principais

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Serviços

- `POST /api/v1/services`
- `GET /api/v1/services`
- `GET /api/v1/services/{service_id}`
- `PUT /api/v1/services/{service_id}`
- `DELETE /api/v1/services/{service_id}`

### Itens

- `POST /api/v1/items`
- `GET /api/v1/items`
- `GET /api/v1/items/{item_id}`
- `PUT /api/v1/items/{item_id}`
- `DELETE /api/v1/items/{item_id}`

### Orçamentos

- `POST /api/v1/quotes`
- `GET /api/v1/quotes`
- `GET /api/v1/quotes/{quote_id}`

## Exemplo de login

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=admin@email.com&password=SenhaForte123"
```

## Exemplo de orçamento

```json
{
  "client_name": "Cliente Exemplo",
  "client_email": "cliente@exemplo.com",
  "notes": "Orçamento inicial",
  "services": [
    { "service_id": 1, "quantity": 2 }
  ],
  "items": [
    { "item_id": 3, "quantity": 4 }
  ]
}
```

## Observações

- O banco SQLite é criado automaticamente ao iniciar a aplicação.
- Em produção, use um banco relacional dedicado e gere uma `SECRET_KEY` forte.