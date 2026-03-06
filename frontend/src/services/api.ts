import axios from "axios";
import { DockerContainer } from "../types/docker";

const API_URL = "http://localhost:8000/api/apps/";

export const fetchContainers = async (): Promise<DockerContainer[]> => {
  const response = await axios.get(API_URL);
  return response.data.apps;
};