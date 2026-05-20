import os
from dotenv import load_dotenv

load_dotenv()

NTFY_TOPIC: str = os.getenv("NTFY_TOPIC", "NodeJS_App_Manager_123456789987654321")
NTFY_URL: str = os.getenv("NTFY_URL", "https://ntfy.sh")


CORS_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5175").split(",")
    if origin.strip()
]