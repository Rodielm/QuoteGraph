from pydantic import BaseModel


class ReflectionCreate(BaseModel):
    text: str


class ReflectionPublic(BaseModel):
    text: str
    createdAt: str
    updatedAt: str
