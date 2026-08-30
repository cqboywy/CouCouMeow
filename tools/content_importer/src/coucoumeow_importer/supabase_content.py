from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx

from .content_packages import ContentPackage, ExtraEpisodePackage


class ContentImportError(RuntimeError):
    """A redacted management API failure safe to print in a terminal."""


@dataclass(frozen=True)
class ImportResult:
    content_key: str
    content_hash: str
    status: str
    skipped: bool
    counts: dict[str, int]


class SupabaseContentClient:
    def __init__(
        self,
        url: str,
        service_role_key: str,
        *,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self._client = httpx.Client(
            base_url=url.rstrip("/"),
            headers={
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json",
            },
            transport=transport,
            timeout=30,
        )

    def find_content(self, package: ContentPackage) -> dict[str, Any] | None:
        table = "lf_episodes" if isinstance(package, ExtraEpisodePackage) else "school_textbooks"
        key = package.episode.content_key if isinstance(package, ExtraEpisodePackage) else package.textbook.content_key
        response = self._request(
            "GET",
            f"/rest/v1/{table}",
            params={
                "select": "content_hash,content_status",
                "content_key": f"eq.{key}",
                "limit": "1",
            },
        )
        rows = response.json()
        return rows[0] if rows else None

    def call_rpc(self, function: str, payload: dict[str, Any]) -> None:
        self._request("POST", f"/rest/v1/rpc/{function}", json=payload)

    def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        try:
            response = self._client.request(method, path, **kwargs)
        except httpx.HTTPError as error:
            raise ContentImportError("Supabase request failed before receiving a response") from error
        if response.is_error:
            raise ContentImportError(f"Supabase request failed ({response.status_code})")
        return response


def import_package(
    package: ContentPackage,
    client: SupabaseContentClient,
    *,
    publish: bool,
) -> ImportResult:
    is_extra = isinstance(package, ExtraEpisodePackage)
    content_key = package.episode.content_key if is_extra else package.textbook.content_key
    counts = (
        {
            "sentences": len(package.sentences),
            "vocab": len(package.vocab),
            "knowledge": len(package.knowledge),
        }
        if is_extra
        else {
            "units": len(package.units),
            "lessons": len(package.lessons),
            "pages": len(package.pages),
            "items": len(package.items),
            "lesson_items": len(package.lesson_items),
            "exercises": len(package.exercises),
        }
    )
    existing = client.find_content(package)
    if existing and existing.get("content_hash") == package.content_hash:
        if publish and existing.get("content_status") != "published":
            client.call_rpc(
                "publish_content",
                {"p_kind": "extra" if is_extra else "school", "p_content_key": content_key},
            )
            return ImportResult(content_key, package.content_hash, "published", False, counts)
        return ImportResult(content_key, package.content_hash, "skipped", True, counts)

    client.call_rpc(
        "import_extra_episode" if is_extra else "import_school_textbook",
        {"p_package": package.model_dump(mode="json")},
    )
    status = "draft"
    if publish:
        client.call_rpc(
            "publish_content",
            {"p_kind": "extra" if is_extra else "school", "p_content_key": content_key},
        )
        status = "published"
    return ImportResult(content_key, package.content_hash, status, False, counts)
