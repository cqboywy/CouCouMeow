from fastapi import APIRouter

from coucoumeow_api.api.routes.health import router as health_router
from coucoumeow_api.api.routes.learning import router as learning_router

router = APIRouter()
router.include_router(health_router)
router.include_router(learning_router)
