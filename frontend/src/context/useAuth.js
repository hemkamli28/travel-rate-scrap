"use client";
import axios from "axios";
import { getCookie, hasCookie, setCookie } from "cookies-next";
// import { cookies } from "next/headers";
import { createContext, useState, useEffect } from "react";

export const authContext = createContext();

export default function UseAuth({ children }) {


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(getCookie("access-token"));
  const [refreshToken, setRefreshToken] = useState(getCookie("refresh-token"));

  const getNewAccessToken = async () => {
    try {
      const response = await axios.post(
        "http://10.0.2.43:5000/user/refresh-token",
        {refreshToken}
      );
      setCookie("access-token", response.data.token, {
        maxAge: 60 * 60
      });
    } catch (error) {
      setIsAuthenticated(false);
      console.log(error);
    }
  };

  const checkAuth = async () => {
    console.log("incoming1/......")
    if (hasCookie("access-token")) {
      setIsAuthenticated(true);
    } 
    if (!hasCookie("access-token") && hasCookie("refresh-token")) {
      await getNewAccessToken();
    }
  };

  useEffect(() => {
     checkAuth();
}, [accessToken, refreshToken]);

  return (
    <authContext.Provider value={{ isAuthenticated }}>
      {children}
    </authContext.Provider>
  );
}
