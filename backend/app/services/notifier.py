import httpx

NTFY_TOPIC = "NodeJS_App_Manager_123456789987654321" 

async def send_ntfy_alert(container_name: str, exit_code: str, error_log: str):
    message = (
        f"The '{container_name}' named container crashed!\n"
        f"Exit code: {exit_code}\n"
        f"Possible error cause:\n\n"
        f"{error_log}"
    )
    
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://ntfy.sh/{NTFY_TOPIC}",
                data=message.encode('utf-8'),
                headers={
                    "Title": "Container Crash Alert",
                    "Tags": "warning",
                    "Priority": "high"
                }
            )
    except Exception as e:
        print(f"Ntfy send error: {e}")