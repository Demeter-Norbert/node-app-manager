from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.manager import node_manager as manager

class AppStartRequest(BaseModel):
    name: str
    image: str = "node:18-alpine"
    target_port: int
    env_vars: dict = {}

router = APIRouter()

@router.post("/", status_code=201)
async def start_new_app(request: AppStartRequest):
    if manager.is_name_taken(request.name):
        raise HTTPException(
            status_code=409,
            detail=f"A container named '{request.name}' already exists. Choose a different name."
        )
    if manager.is_port_taken(request.target_port):
        raise HTTPException(
            status_code=409,
            detail=f"Port {request.target_port} is already in use by another container. Choose a different port."
        )
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
    
@router.post("/{app_name_or_id}/stop")
async def stop_app(app_name_or_id: str):
    try:
        if manager.stop_app(app_name_or_id):
            return {"message": f"Application '{app_name_or_id}' succesfully stopped."}
        else:
            raise HTTPException(status_code=404, detail="No such application.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application stopping error: {e}")
    
@router.post("/{app_name_or_id}/resume")
async def resume_app(app_name_or_id: str):
    try:
        if manager.resume_app(app_name_or_id):
            return {"message": f"Application '{app_name_or_id}' succesfully resumed."}
        else:
            raise HTTPException(status_code=404, detail="No such application.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application resume error: {e}")
    
@router.post("/{app_name_or_id}/restart")
async def restart_app(app_name_or_id: str):
    try:
        if manager.restart_app(app_name_or_id):
            return {"message": f"Application '{app_name_or_id}' succesfully restarted."}
        else:
            raise HTTPException(status_code=404, detail="No such application.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application restart error: {e}")
    
@router.get("/")
async def get_apps(show_all: bool = True):
    try:
        containers = manager.list_apps(show_all = show_all)
        apps_list = []
        
        for container in containers:
            node_version = "Unknown"
            env_vars = container.attrs.get('Config', {}).get('Env', [])
            for env in env_vars:
                if env.startswith("NODE_VERSION="):
                    node_version = env.split("=")[1]
                    if not node_version.startswith("v"):
                        node_version = "v" + node_version
                    break
                    
            apps_list.append({
                "id": container.short_id,
                "name": container.name,
                "status": container.status,
                "image": container.image.tags[0] if container.image.tags else "Unknown",
                "ports": container.ports,
                "restart_count": container.attrs.get('RestartCount', 0),
                "node_version": node_version
            })
            
        return {"apps": apps_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application listing error: {e}")
    
@router.delete("/{app_name_or_id}")
async def delete_app(app_name_or_id: str):
    try:
        if manager.delete_app(app_name_or_id):
            return {"message": "Application succesfully stopped and deleted."}
        else:
            raise HTTPException(status_code=404, detail="No such application.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application delete error: {e}")