# WebSocket routes for log events
from fastapi import APIRouter, WebSocket
from app.controllers.log_controller import process_log

router = APIRouter(prefix="/ws", tags=["Log Books"])


@router.websocket("/log-laptop")
async def log_laptop_ws(websocket: WebSocket):
    await websocket.accept()
    await process_log(websocket, tipe="LAPTOP")


@router.websocket("/log-hp")
async def log_hp_ws(websocket: WebSocket):
    await websocket.accept()
    await process_log(websocket, tipe="HP")