import asyncio
from app.utils.log_analyzer import extract_nodejs_error
from app.services.notifier import send_ntfy_alert
from app.core.manager import node_manager as manager

def docker_event_listener():
    try:
        print("Docker event listener started ...")
        for event in manager.client.events(decode=True, filters={"type": "container", "event": "die"}):
            attributes = event.get("Actor", {}).get("Attributes", {})
            container_id = event.get("id")
            
            if attributes.get("node-manager") == "managed":
                container_name = attributes.get("name", "Unknown")
                exit_code = attributes.get("exitCode", "0")
                
                if container_id in manager.intentional_stops:
                    manager.intentional_stops.discard(container_id)
                    continue 
                
                if exit_code not in ["0", "137", "143"]:
                    error_log = "Hiba a log lekérésekor."
                    try:
                        container = manager.client.containers.get(container_id)
                        
                        logs_bytes = container.logs(tail=200)
                        logs_str = logs_bytes.decode('utf-8').strip()
                        
                        error_log = extract_nodejs_error(logs_str)
                            
                    except Exception as log_err:
                        error_log = f"[Log olvasási hiba: {log_err}]"

                    asyncio.run(send_ntfy_alert(container_name, exit_code, error_log))
    except Exception as e:
        print(f"Critical event listener error: {e}")