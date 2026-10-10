from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.services.ai_service import generate_ai_response


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post("/chat", response_model=AIChatResponse)
def ai_chat(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    response = generate_ai_response(
        db=db,
        user_message=request.message,
    )

    return {
        "response": response
    }
