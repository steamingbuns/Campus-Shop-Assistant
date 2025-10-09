// frontend/src/contexts/auth-core.js
import { createContext, useContext } from "react";

export const AuthCtx = createContext(null);

export function useAuth() {
  return useContext(AuthCtx);
}
