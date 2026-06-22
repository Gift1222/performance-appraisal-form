const AUTH_KEY = "emerge_admin_auth";
const CREDENTIALS = { username: "admin", password: "admin@emerge2024" };

export function login(username: string, password: string): boolean {
  if (username.trim() === CREDENTIALS.username && password === CREDENTIALS.password) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}
