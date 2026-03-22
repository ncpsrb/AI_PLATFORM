from fastapi import APIRouter

from app.api.routes import admin, agents, auth, chats, notifications

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(agents.router)
api_router.include_router(chats.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
