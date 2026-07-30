import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

export async function analyzeRepository(repository: string) {
  const response = await axios.post(
    `${API_URL}/api/analyze`,
    {
      repository,
    }
  );

  return response.data;
}
