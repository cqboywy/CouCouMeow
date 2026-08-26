from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from coucoumeow_api.api.errors import ApiError, api_error_handler
from coucoumeow_api.api.router import router as api_router
from coucoumeow_api.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=settings.version)
    allowed_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_exception_handler(ApiError, api_error_handler)
    app.include_router(api_router, prefix="/api/v1")
    return app
