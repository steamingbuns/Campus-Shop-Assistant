// frontend/src/contexts/AuthContext.jsx
import { useEffect, useState } from "react";
import { AuthCtx } from "./auth-core.js";   // <-- thêm .js cho chắc chắn

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("auth_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function login(userObj) {
    setUser(userObj);
    localStorage.setItem("auth_user", JSON.stringify(userObj));
  }
  function logout() {
    setUser(null);
    localStorage.removeItem("auth_user");
  }

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
