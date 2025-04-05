const apiUrl = import.meta.env.VITE_API_URL;

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true); // To prevent flickering during API call

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.log("No token found, setting isAuthenticated to false.");
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(response.data.isValid);
      } catch (error) {
        console.error("Token verification failed", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    console.log("Loading state active, displaying loading message.");
    return <div>Loading...</div>; // Prevent flashing before redirect
  }

  console.log(
    "Authentication check complete. isAuthenticated:",
    isAuthenticated
  );
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
