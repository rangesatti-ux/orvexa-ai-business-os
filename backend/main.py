from fastapi import FastAPI

from app.database.connection import Base, engine
from app.models.user import User
from app.models.employee import Employee
from app.routes.auth import router as auth_router
from app.routes.employee import router as employee_router
from app.routes import dashboard

app = FastAPI(
    title="Orvexa AI Business OS",
    version="1.0.0"
)
Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(dashboard.router)

@app.get("/")
def home():
    return {
        "message": "Welcome to Orvexa AI Business OS 🚀"
    }