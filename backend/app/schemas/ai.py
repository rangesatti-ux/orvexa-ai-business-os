from pydantic import BaseModel, Field, ConfigDict


class AIChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The prompt message submitted by the user.",
    )


class AIChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    response: str = Field(
        ...,
        description="The generated text response from the AI assistant.",
    )


class AIInsightsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    insights: str = Field(
        ...,
        description="AI-generated business insights derived from organization metrics.",
    )