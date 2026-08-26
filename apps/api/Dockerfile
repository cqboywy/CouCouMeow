FROM python:3.12-slim AS runtime
WORKDIR /app
RUN pip install --no-cache-dir uv && useradd --create-home appuser
COPY pyproject.toml uv.lock ./
COPY apps/api ./apps/api
COPY tools/content_importer ./tools/content_importer
RUN uv sync --package coucoumeow-api --no-dev --frozen
USER appuser
EXPOSE 8000
CMD ["uv", "run", "--package", "coucoumeow-api", "uvicorn", "coucoumeow_api.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]

