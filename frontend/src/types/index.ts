export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  ports: any[]; 
  restart_count: number;
}

export interface ContainerStats {
  id: string;
  memory_usage_bytes: number;
  memory_limit_bytes: number;
  memory_percent: number;
  cpu_percent: number;
}

export interface SystemHistory {
  time: string;
  cpu: number;
  memory: number;
}

export interface ParsedLog {
  timeStr: string;
  showTime: boolean;
  messageStr: string;
  textColor: string;
}