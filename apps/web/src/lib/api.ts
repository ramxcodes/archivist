import { useQuery } from "@tanstack/react-query";
import { env } from "@quarter/env/web";

const API_URL = env.NEXT_PUBLIC_SERVER_URL;

// API endpoints

const getApiHealth = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) {
    throw new Error("Failed to fetch API health");
  }
  return response.json();
};

/**
 * Query hooks
 */

export function useGetApiHealth() {
  return useQuery({
    queryKey: ["api-health"],
    queryFn: getApiHealth,
  });
}
