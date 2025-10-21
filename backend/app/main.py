from fastapi import FastAPI
from contextlib import asynccontextmanager
from .api import apps as apps_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Fast API server started.")
    yield
    print("Fast API server stopped.")

app = FastAPI(
    title="Node.js Manager Backend",
    description="API for Node.js applications",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(apps_router.router, prefix="/api/apps", tags=["Application managemenet"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "node-manager-backend"}