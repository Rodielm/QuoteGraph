from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.collections.router import router as collections_router
from app.modules.graph.router import router as graph_router
from app.modules.quotes.router import router as quotes_router
from app.modules.topics.router import router as topics_router
from app.modules.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(quotes_router)
api_router.include_router(graph_router)
api_router.include_router(collections_router)
api_router.include_router(topics_router)
