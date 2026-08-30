from __future__ import annotations

import os
from pathlib import Path
from typing import Annotated

import typer

from .content_packages import ContentPackageError, load_content_package
from .supabase_content import ContentImportError, SupabaseContentClient, import_package


app = typer.Typer(help="校内与课外内容包校验和 Supabase 发布工具")


def _load(path: Path):
    try:
        return load_content_package(path)
    except ContentPackageError as error:
        raise typer.BadParameter(str(error), param_hint="manifest") from error


@app.command()
def validate(manifest: Annotated[Path, typer.Argument(exists=True, dir_okay=False)]) -> None:
    """只校验内容包；不会连接或修改 Supabase。"""
    package = _load(manifest)
    typer.echo(f"有效：{package.kind} · {package.content_hash}")


@app.command(name="import")
def import_command(
    manifest: Annotated[Path, typer.Argument(exists=True, dir_okay=False)],
    publish: Annotated[bool, typer.Option("--publish/--draft")] = False,
) -> None:
    """使用管理端密钥导入草稿，并可在校验成功后发布。"""
    package = _load(manifest)
    url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not service_key:
        raise typer.BadParameter(
            "导入需要 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量"
        )
    try:
        result = import_package(
            package,
            SupabaseContentClient(url, service_key),
            publish=publish,
        )
    except ContentImportError as error:
        typer.echo(f"导入失败：{error}", err=True)
        raise typer.Exit(1) from error
    counts = "，".join(f"{name}={count}" for name, count in result.counts.items())
    typer.echo(
        f"{result.content_key} · {result.status} · {result.content_hash} · {counts}"
    )
