from __future__ import annotations

import json
from pathlib import Path

import httpx
import pytest
from coucoumeow_importer.content_packages import load_content_package
from coucoumeow_importer.supabase_content import (
    ContentImportError,
    SupabaseContentClient,
    import_package,
)

ROOT = Path(__file__).resolve().parents[3]
SCHOOL = ROOT / "content/school/pep-grade4-upper/manifest.json"
EXTRA = ROOT / "content/extra/l1-001-dino-buddies-the-park/manifest.json"


def test_school_import_calls_rpc_then_publish() -> None:
    requests: list[tuple[str, str, dict | None]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content) if request.content else None
        requests.append((request.method, request.url.path, body))
        if request.method == "GET":
            return httpx.Response(200, json=[])
        return httpx.Response(204)

    client = SupabaseContentClient(
        "https://project.supabase.co",
        "service-role-test-key",
        transport=httpx.MockTransport(handler),
    )
    result = import_package(load_content_package(SCHOOL), client, publish=True)

    assert result.status == "published"
    assert [item[1] for item in requests] == [
        "/rest/v1/school_textbooks",
        "/rest/v1/rpc/import_school_textbook",
        "/rest/v1/rpc/publish_content",
    ]
    assert requests[1][2] == {"p_package": json.loads(SCHOOL.read_text())}
    assert requests[2][2] == {
        "p_kind": "school",
        "p_content_key": "pep-grade4-upper",
    }


def test_matching_hash_is_skipped_without_mutation() -> None:
    package = load_content_package(EXTRA)
    paths: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        paths.append(request.url.path)
        return httpx.Response(
            200,
            json=[{"content_hash": package.content_hash, "content_status": "published"}],
        )

    client = SupabaseContentClient(
        "https://project.supabase.co",
        "service-role-test-key",
        transport=httpx.MockTransport(handler),
    )
    result = import_package(package, client, publish=True)

    assert result.status == "skipped"
    assert result.skipped is True
    assert paths == ["/rest/v1/lf_episodes"]


def test_failed_request_never_exposes_service_key() -> None:
    secret = "service-role-sensitive-value"
    client = SupabaseContentClient(
        "https://project.supabase.co",
        secret,
        transport=httpx.MockTransport(
            lambda request: httpx.Response(500, text=f"backend echoed {secret}")
        ),
    )

    with pytest.raises(ContentImportError) as caught:
        import_package(load_content_package(EXTRA), client, publish=False)

    assert secret not in str(caught.value)
    assert "500" in str(caught.value)
