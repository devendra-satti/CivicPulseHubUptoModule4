import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthResponse } from "../types/auth"; 
import { jwtDecode } from "jwt-decode"; // <--- Import this for auto logout when token expired

//Acts as a locker to store all the contents
//Auth Context holds 3 things , the current user, a function to login,a function to logout
const AuthContext = createContext<{
  user: AuthResponse | null;
  signin: (data: AuthResponse) => void;
  signout: () => void;
} | null>(null);

//Storing of the contents in the locker
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const raw = localStorage.getItem("auth");
    
    if (!raw) return null;

    try {
      const parsedData: AuthResponse = JSON.parse(raw);
      
      // DECODE AND CHECK EXPIRATION
      if (parsedData.token) {
        const decoded: any = jwtDecode(parsedData.token);
        // If current time is greater than expiration time
        if (decoded.exp * 1000 < Date.now()) {
           // Token is expired! Clean up and return null
           localStorage.removeItem("auth");

           setTimeout(() => alert("Session expired. Please login again."), 100);

           
           return null;
        }
      }
      
      // Token is valid, return the user data
      return parsedData;
      
    } catch (error) {
      // If JSON parse fails or token is garbage
      localStorage.removeItem("auth");
      return null;
    }
  });

  const signin = (data: AuthResponse) => {
    setUser(data);
    localStorage.setItem("auth", JSON.stringify(data));
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

//Accessing of Contents
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}