import asyncio
from pathlib import Path
from typing import Annotated

import typer
from coucoumeow_api.domain.content import GeneratedEpisodeContent

from .discovery import discover_pairs
from .models import MediaPair
from .repository import InMemoryContentRepository
from .runner import run_batch, run_single

app = typer.Typer(help="凑凑喵英语乐园本地字幕预处理工具")


class _UnavailableGenerator:
    async def generate(self, request: object) -> GeneratedEpisodeContent:
        raise RuntimeError("阶段 0 仅支持 --dry-run；真实 AI 生成将在阶段 1 配置。")


def _check_level(level: int) -> None:
    if level not in range(1, 10):
        raise typer.BadParameter("Level 必须为 1–9")


@app.command()
def single(
    level: Annotated[int, typer.Option()],
    srt: Annotated[Path, typer.Option(exists=True, dir_okay=False)],
    video_file: Annotated[Path, typer.Option(exists=True, dir_okay=False)],
    dry_run: Annotated[bool, typer.Option()] = True,
) -> None:
    """解析一个剧集；阶段 0 默认且仅允许安全预检。"""
    _check_level(level)
    if not dry_run:
        raise typer.BadParameter("阶段 0 请使用 --dry-run")
    result = asyncio.run(
        run_single(
            level=level,
            pair=MediaPair(srt.stem, srt, video_file),
            dry_run=True,
            generator=_UnavailableGenerator(),
            repository=InMemoryContentRepository(),
        )
    )
    typer.echo(f"{result.stem}: {result.sentence_count} 句，预检完成")


@app.command()
def batch(
    level: Annotated[int, typer.Option()],
    directory: Annotated[Path, typer.Option(exists=True, file_okay=False)],
    dry_run: Annotated[bool, typer.Option()] = True,
) -> None:
    """按文件名配对并预检指定目录内的所有剧集。"""
    _check_level(level)
    if not dry_run:
        raise typer.BadParameter("阶段 0 请使用 --dry-run")
    discovery = discover_pairs(directory)
    result = asyncio.run(
        run_batch(
            level=level,
            directory=directory,
            dry_run=True,
            generator=_UnavailableGenerator(),
            repository=InMemoryContentRepository(),
        )
    )
    typer.echo(f"{len(result.results)} 集预检完成，{len(discovery.errors)} 个配对问题")
