from fastapi.testclient import TestClient

from coucoumeow_api.main import create_app


def test_openapi_uses_official_product_name() -> None:
    assert create_app().openapi()["info"]["title"] == "凑凑喵英语乐园 / CouCouMeow English Land"


def test_health_check_returns_service_status() -> None:
    response = TestClient(create_app()).get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "coucoumeow-api",
        "version": "0.1.0",
    }
