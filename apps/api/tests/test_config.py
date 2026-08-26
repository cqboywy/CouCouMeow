import pytest
from pydantic import ValidationError

from coucoumeow_api.config import Settings


def test_production_requires_supabase_service_key() -> None:
    with pytest.raises(ValidationError, match="SUPABASE_SERVICE_ROLE_KEY"):
        Settings(app_env="production", supabase_service_role_key=None)


def test_development_runs_without_external_keys() -> None:
    settings = Settings(app_env="development")
    assert settings.supabase_service_role_key is None
    assert settings.deepseek_api_key is None
