from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.database import close_driver, get_driver


@asynccontextmanager
async def lifespan(app: FastAPI):
    with get_driver().session() as session:
        session.run("CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE")
    yield
    close_driver()


app = FastAPI(title="QuoteGraph API", lifespan=lifespan)
app.include_router(api_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
