from pydantic import BaseModel

from app.modules.quotes.models import QuotePublic


class ReflectionCreate(BaseModel):
    text: str


class ReflectionPublic(BaseModel):
    text: str
    createdAt: str
    updatedAt: str


class ReflectedQuote(BaseModel):
    quote: QuotePublic
    reflection: ReflectionPublic
