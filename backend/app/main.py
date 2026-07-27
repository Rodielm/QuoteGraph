from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import close_driver, get_driver


@asynccontextmanager
async def lifespan(app: FastAPI):
    with get_driver().session() as session:
        session.run("CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE")
        session.run("CREATE CONSTRAINT quote_external_id_unique IF NOT EXISTS FOR (q:Quote) REQUIRE q.externalId IS UNIQUE")
        session.run("CREATE CONSTRAINT author_slug_unique IF NOT EXISTS FOR (a:Author) REQUIRE a.slug IS UNIQUE")
        session.run("CREATE CONSTRAINT topic_name_unique IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE")
        session.run("CREATE CONSTRAINT collection_id_unique IF NOT EXISTS FOR (c:Collection) REQUIRE c.id IS UNIQUE")
    yield
    close_driver()


app = FastAPI(title="QuoteGraph API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
