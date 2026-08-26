from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: Literal["凑凑喵英语乐园 / CouCouMeow English Land"] = "凑凑喵英语乐园 / CouCouMeow English Land"
    version: str = "0.1.0"
    app_env: Literal["development", "test", "production"] = "development"
    cors_origins: str = "http://localhost:5173"
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    deepseek_api_key: str | None = None
    deepseek_model: str = "deepseek-v4-flash"
    speech_provider: str = "fake"

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.app_env == "production" and not self.supabase_service_role_key:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY is required in production")
        return self


settings = Settings()
