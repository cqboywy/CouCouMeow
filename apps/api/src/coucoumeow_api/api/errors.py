import secrets
from typing import cast

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    code: str
    message: str
    trace_id: str


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message


async def api_error_handler(_: Request, exc: Exception) -> JSONResponse:
    api_error = cast(ApiError, exc)
    response = ErrorResponse(
        code=api_error.code,
        message=api_error.message,
        trace_id=secrets.token_hex(8),
    )
    return JSONResponse(status_code=api_error.status_code, content=response.model_dump())
