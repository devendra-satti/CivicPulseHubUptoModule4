// Response we expect back from backend after signin/signup
export type AuthResponse = {
  id: string;        // unique user id
  name: string;      // user's name
  email: string;     // user's email
  role: string;      // e.g. "admin" | "user"
  token: string;     // JWT token
  wardNumber?:number; //p2
  department?: string;  //p2
};

// Request payload for signin
export type SigninRequest = {
  email: string;
  password: string;
};

// Request payload for signup
export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  role: string;       // New - PHASE2
  wardNumber?: string; // Optional (only for citizens) - PHASE2
  department?: string; // Optional (only for officers) - PHASE2
};