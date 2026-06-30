import axios from "axios";
import { DockerContainer, ContainerStats } from '../types';

const API_URL = "/api/apps/";

export const fetchContainers = async (): Promise<DockerContainer[]> => {
  const response = await axios.get(API_URL);
  return response.data.apps;
};

export const startApp = async (name: string, target_port: number, image: string) => {
  const response = await axios.post(API_URL, { 
      name, 
      target_port,
      image: image || "node:18-alpine" 
  });
  return response.data;
};

export const stopApp = async (id: string) => {
  const response = await axios.post(`${API_URL}${id}/stop`);
  return response.data;
};

export const resumeApp = async (id: string) => {
  const response = await axios.post(`${API_URL}${id}/resume`);
  return response.data;
};

export const restartApp = async (id: string) => {
  const response = await axios.post(`${API_URL}${id}/restart`);
  return response.data;
};

export const deleteApp = async (id: string) => {
  const response = await axios.delete(`${API_URL}${id}`);
  return response.data;
};