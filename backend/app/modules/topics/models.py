from pydantic import BaseModel


class TopicPublic(BaseModel):
    name: str
    quoteCount: int
