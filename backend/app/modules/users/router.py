from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.modules.users.models import UserPublic

router = APIRouter(prefix="/users", tags=["users"])
DependsCurrentUser = Depends(get_current_user)


@router.get("/me", response_model=UserPublic)
def read_current_user(current_user: UserPublic = DependsCurrentUser) -> UserPublic:
    return current_user
