import { createContext, useContext } from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "shopkeeper" | "admin";
  token: string;
  location?: string;
  phone?: string;
  address?: string;
}

interface AuthCtx {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthCtx>({ user: null, setUser: () => {} });
export const useAuth = () => useContext(AuthContext);
