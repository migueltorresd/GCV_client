import { apiClient } from '../../shared/api-client';

interface LoginResponse {
  access_token: string;
}

// POST /auth/login → { access_token } (contrato design.md).
export async function login(email: string, password: string): Promise<string> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  return data.access_token;
}
