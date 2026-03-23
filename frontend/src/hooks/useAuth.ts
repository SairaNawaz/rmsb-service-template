interface User {
  username: string;
  displayName: string;
  role: string;
  email?: string;
}

export function useAuth(): User | null {
  const stored = localStorage.getItem('rmsb_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function getGraphToken(): string | null {
  return localStorage.getItem('rmsb_graph_token');
}

export function isAdmin(role: string): boolean {
  return role === 'SuperAdmin' || role === 'Admin' || role === 'Administrator';
}
