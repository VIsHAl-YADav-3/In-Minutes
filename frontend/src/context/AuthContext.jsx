import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { getErrorMessage } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("in_minutes_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("in_minutes_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("in_minutes_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("in_minutes_token");
        localStorage.removeItem("in_minutes_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (token, user) => {
    localStorage.setItem("in_minutes_token", token);
    localStorage.setItem("in_minutes_user", JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      persist(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const res = await api.post("/auth/register", payload);
      persist(res.data.token, res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("in_minutes_token");
    localStorage.removeItem("in_minutes_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get("/auth/me");
    setUser(res.data.user);
    localStorage.setItem("in_minutes_user", JSON.stringify(res.data.user));
    return res.data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
