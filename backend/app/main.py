from fastapi import FastAPI
from contextlib import asynccontextmanager
from .api import apps as apps_router
from app.api.monitor import router as monitor_router
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175", "http://127.0.0.1:5175", "http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

app.include_router(apps_router.router, prefix="/api/apps", tags=["Application managemenet"])
app.include_router(monitor_router, prefix="/api/monitor", tags=["monitor"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "node-manager-backend"}