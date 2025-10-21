from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..core.manager import NodeAppManager

manager = NodeAppManager()

class AppStartRequest(BaseModel):
    name: str
    image: str = "node:18-alpine"
    target_port: int
    env_vars: dict = {}

router = APIRouter()

@router.post("/", status_code=201)
async def start_new_app(request: AppStartRequest):
    try:
        container_id = manager.start_app(
            app_name=request.name,
            image_name=request.image,
            port=request.target_port,
            env_vars=request.env_vars
        )
        return {"message": "Application started", "container_id": container_id, "name": request.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application start error: {e}")

@router.delete("/{app_name_or_id}")
async def stop_app(app_name_or_id: str):
    try:
        if manager.stop_app(app_name_or_id):
            return {"message": "Application succesfully stopped and deleted."}
        else:
            raise HTTPException(status_code=404, detail="No such application.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application stop error: {e}")