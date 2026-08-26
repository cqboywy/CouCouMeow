from fastapi.testclient import TestClient

from coucoumeow_api.api.errors import ApiError


def test_api_error_contains_safe_message_and_trace_id(client: TestClient) -> None:
    @client.app.get("/api/v1/testing/error")
    def raise_service_unavailable() -> None:
        raise ApiError(
            status_code=503,
            code="SERVICE_UNAVAILABLE",
            message="小鱼干暂时迷路啦，我们稍后再试。",
        )

    response = client.get("/api/v1/testing/error")
    body = response.json()

    assert response.status_code == 503
    assert body["code"] == "SERVICE_UNAVAILABLE"
    assert body["message"] == "小鱼干暂时迷路啦，我们稍后再试。"
    assert len(body["trace_id"]) >= 16
