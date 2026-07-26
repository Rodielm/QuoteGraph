from pydantic import BaseModel


class AuthorSummary(BaseModel):
    name: str
    slug: str


class QuotePublic(BaseModel):
    id: str
    text: str
    author: AuthorSummary
    tags: list[str]


class QuoteListResponse(BaseModel):
    items: list[QuotePublic]
    page: int
    limit: int
    totalCount: int
    totalPages: int


class FavoriteStatus(BaseModel):
    isFavorited: bool
