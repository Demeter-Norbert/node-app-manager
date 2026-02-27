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
