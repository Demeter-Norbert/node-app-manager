import docker
from docker.errors import NotFound, APIError

class NodeAppManager:
    def __init__(self):
        self.client = docker.from_env()

    def list_apps(self, show_all: bool = True, label_filter="node-manager=managed"):
        try:
            return self.client.containers.list(all = show_all, filters={"label": label_filter})
        except APIError as e:
            print(f"Docker API error: {e}")
            return []

    def start_app(self, app_name: str, image_name: str, port: int, env_vars: dict):
        try:
            container = self.client.containers.run(
                image=image_name,
                name=app_name,
                detach=True, 
                ports={f"{port}/tcp": port}, 
                environment=env_vars,
                labels={"node-manager": "managed", "app-name": app_name}, 
                restart_policy={"Name": "no"}, 
            )
            return container.id
        except Exception as e:
            print(f"Application start error: {e}")
            raise
        
    def resume_app (self, container_id_or_name: str):
        try:
            container = self.client.containers.get(container_id_or_name)
            container.start() 
            return True
        except NotFound:
            print(f"Cannot find container: {container_id_or_name}")
            return False
        except APIError as e:
            print(f"Docker API error: {e}")
            raise

    def stop_app(self, container_id_or_name: str):
        try:
            container = self.client.containers.get(container_id_or_name)
            container.stop() 
            return True
        except NotFound:
            print(f"Cannot find container: {container_id_or_name}")
            return False
        except APIError as e:
            print(f"Docker API error: {e}")
            raise
    
    def delete_app(self, container_id_or_name: str):
        try:
            container = self.client.containers.get(container_id_or_name)
            container.stop()
            container.remove() 
            return True
        except NotFound:
            print(f"Cannot find container: {container_id_or_name}")
            return False
        except APIError as e:
            print(f"Docker API error: {e}")
            raise
    
    def restart_app(self, container_id_or_name: str):
        try:
            container = self.client.containers.get(container_id_or_name)
            container.restart() 
            return True
        except NotFound:
            print(f"Cannot find container: {container_id_or_name}")
            return False
        except APIError as e:
            print(f"Docker API error: {e}")
            raise

    def get_container_logs(self, container_id: str, tail: int = 100) -> list:
        try:
            container = self.client.containers.get(container_id)
            logs_bytes = container.logs(tail=tail, timestamps=True)
            logs_str = logs_bytes.decode('utf-8')
            return logs_str.split('\n')[:-1]
        except docker.errors.NotFound:
            return ["Container not found."]
        except Exception as e:
            return [f"Error fetching logs: {str(e)}"]

    def get_container_stats(self, container_id: str) -> dict:
        try:
            container = self.client.containers.get(container_id)
            stats = container.stats(stream=False)
            
            mem_usage = stats.get('memory_stats', {}).get('usage', 0)
            mem_limit = stats.get('memory_stats', {}).get('limit', 1) 
            mem_percent = (mem_usage / mem_limit) * 100.0

            cpu_stats = stats.get('cpu_stats', {})
            precpu_stats = stats.get('precpu_stats', {})
            
            cpu_usage_total = cpu_stats.get('cpu_usage', {}).get('total_usage', 0)
            precpu_usage_total = precpu_stats.get('cpu_usage', {}).get('total_usage', 0)
            
            system_cpu_usage = cpu_stats.get('system_cpu_usage', 0)
            system_precpu_usage = precpu_stats.get('system_cpu_usage', 0)
            
            online_cpus = cpu_stats.get('online_cpus', 1)

            cpu_delta = cpu_usage_total - precpu_usage_total
            system_cpu_delta = system_cpu_usage - system_precpu_usage
            
            cpu_percent = 0.0
            if system_cpu_delta > 0 and cpu_delta > 0:
                cpu_percent = (cpu_delta / system_cpu_delta) * online_cpus * 100.0

            return {
                "id": container_id,
                "memory_usage_bytes": mem_usage,
                "memory_limit_bytes": mem_limit,
                "memory_percent": round(mem_percent, 2),
                "cpu_percent": round(cpu_percent, 2)
            }
        except Exception as e:
            return {"error": str(e)}