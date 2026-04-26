from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.core.manager import node_manager as manager

router = APIRouter()

@router.websocket("/{app_id}/stats/ws")
async def stats_websocket(websocket: WebSocket, app_id: str):
    await websocket.accept()
    try:
        while True:
            stats = await asyncio.to_thread(manager.get_container_stats, app_id)
            if "error" in stats:
                await websocket.send_json({"error": stats["error"]})
                break
            
            await websocket.send_json(stats)
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        print(f"Client disconnected from the stats stream: {app_id}")


@router.websocket("/{app_id}/logs/ws")
async def logs_websocket(websocket: WebSocket, app_id: str, tail: int = 100):
    await websocket.accept()
    try:
        while True:
            logs = await asyncio.to_thread(manager.get_container_logs, app_id, tail=tail)
            await websocket.send_json({"id": app_id, "logs": logs})
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        print(f"Client disconnected from the logs stream: {app_id}")