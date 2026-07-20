import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // 🔒 PREVENT MULTIPLE LOGOUT CALLS
  // =========================
  let isLoggingOut = false;

  // =========================
  // ✅ TOKEN EXPIRY CHECK
  // =========================
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  };

  // =========================
  // 🔥 FORCE LOGOUT (GLOBAL)
  // =========================
  const logout = () => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    setUser(null);

    if (!sessionStorage.getItem("logoutReloaded")) {
      sessionStorage.setItem("logoutReloaded", "true");

      window.location.href = "/login";

      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // =========================
  // ✅ LOAD USER
  // =========================
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("authToken");

      sessionStorage.removeItem("logoutReloaded");

      if (storedUser && storedUser !== "undefined" && storedToken) {
        if (isTokenExpired(storedToken)) {
          console.warn("Token expired → logout");
          logout();
        } else {
          setUser({
            ...JSON.parse(storedUser),
            token: storedToken,
          });
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Load error:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // 🔁 TOKEN EXPIRY CHECK
  // =========================
  useEffect(() => {
    if (!user?.token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(user.token)) {
        console.warn("Token expired → auto logout");
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // =========================
  // 🔥 SERVER SESSION CHECK (401 HANDLING)
  // =========================
  useEffect(() => {
    if (!user?.token) return;

    const checkSession = async () => {
      try {
        const res = await fetch(`/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        // 🔥 MAIN CONDITION
        if (res.status === 401) {
          console.log("🚨 Unauthorized → logout");
          logout();
        }
      } catch (err) {
        console.log("Session check error:", err);
      }
    };

    const interval = setInterval(checkSession, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // =========================
  // 🔥 INSTANT CHECK (FOCUS / TAB)
  // =========================
  useEffect(() => {
    const handleFocus = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await fetch(`/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          console.log("🚨 Unauthorized (focus) → logout");
          logout();
        }
      } catch (err) {
        console.log("Focus check error:", err);
      }
    };

    window.addEventListener("focus", handleFocus);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // =========================
  // ✅ LOGIN
  // =========================
  const login = (userData) => {
    const normalizedUser = {
      token: userData.token,
      id: userData.id,
      name: userData.name || "Guest",
      email: userData.email || "",
      isAdmin: Boolean(userData.isAdmin),
      role: userData.role || "user",
    };

    sessionStorage.setItem("user", JSON.stringify(normalizedUser));
    sessionStorage.setItem("authToken", userData.token);

    setUser(normalizedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};