from pydantic import BaseModel

from app.modules.quotes.models import QuotePublic


class CollectionCreate(BaseModel):
    name: str


class CollectionUpdate(BaseModel):
    name: str


class CollectionPublic(BaseModel):
    id: str
    name: str
    quoteCount: int


class CollectionDetail(BaseModel):
    id: str
    name: str
    quotes: list[QuotePublic]
