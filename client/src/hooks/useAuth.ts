import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        setUser(JSON.parse(userString));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    isAdmin: user?.role === "ADMIN",
    isTeacher: user?.role === "TEACHER",
    role: user?.role,
  };
}
