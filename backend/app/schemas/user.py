from typing import Literal

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
)


class UserCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name of the user.",
    )

    email: EmailStr = Field(
        ...,
        description="Unique corporate email address for authentication.",
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User account password (minimum 8 characters).",
    )

    role: Literal[
        "Admin",
        "HR",
        "Manager",
        "Employee",
    ] = Field(
        default="Employee",
        description="Assigned role for authorization and role-based access control.",
    )


class UserLogin(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr = Field(
        ...,
        description="Registered user email address.",
    )
    password: str = Field(
        ...,
        description="User account password.",
    )


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int = Field(..., description="Unique user database ID.")
    full_name: str = Field(..., description="User full name.")
    email: EmailStr = Field(..., description="User email address.")
    role: str = Field(..., description="Assigned role.")
    is_active: bool = Field(..., description="Indicates whether the user account is active.")


class Token(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    access_token: str = Field(..., description="JWT access token string.")
    token_type: str = Field(default="bearer", description="Token type (bearer).")