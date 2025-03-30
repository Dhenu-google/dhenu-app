/**
 * Authentication context module providing global auth state and methods.
 * @module
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "@/lib/firebase-service";
import { auth } from "@/lib/firebase-config";
import { DB_API_URL } from "@/config";
import { findNodeHandle, Alert } from "react-native";
import { loadBundle } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

// ============================================================================
// Types & Interfaces
// ============================================================================
type UserRole = "Farmer" | "Gaushala Owner" | "Public" | null;
/**
 * Authentication context interface defining available methods and state
 * for managing user authentication throughout the application.
 * @interface
 */
interface AuthContextType {
  /**
   * Authenticates an existing user with their credentials
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User | undefined>} Authenticated user or undefined
   */
  signIn: (email: string, password: string) => Promise<User | undefined>;

  /**
   * Creates and authenticates a new user account
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} [name] - Optional user's display name
   * @returns {Promise<User | undefined>} Created user or undefined
   */
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole  | null,
    latitude:number | null,
    longitude:number|null,
  ) => Promise<User | undefined>;

  /**
   * Logs out the current user and clears session
   * @returns {void}
   */
  signOut: () => void;

  /** Currently authenticated user */
  user: User | null;
  role : UserRole;
  /** Loading state for authentication operations */
  isLoading: boolean;
  isRoleLoading: boolean;
}

// ============================================================================
// Context Creation
// ============================================================================

/**
 * Authentication context instance
 * @type {React.Context<AuthContextType>}
 */
const AuthContext = createContext<AuthContextType>({} as AuthContextType);


/* Helper Function - fetches user role from the API */
const fetchUserRole = async (uid: string): Promise<UserRole> => {
  if (!uid) {
    console.error("Error fetching user role: User ID was not provided");
    return null;
  }

  try {
    const response = await fetch(`${DB_API_URL}/get_role/${uid}`);

    if (!response.ok) {
      // Handle specific HTTP error statuses
      if (response.status === 400) {
        console.error("Error fetching user role: User ID was not provided");
      } else if (response.status === 404) {
        console.error("Error fetching user role: User not found");
      } else {
        console.error(`Error fetching user role: ${response.statusText}`);
      }
      return null;
    }

    const data = await response.json();
    return data.role || null;
  } catch (error) {
    console.error("Error fetching user role: ", error);
    return null;
  }
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook to access authentication context
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useSession(): AuthContextType {
  const value = useContext(AuthContext);

  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * SessionProvider component that manages authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function SessionProvider(props: { children: React.ReactNode }) {
  // ============================================================================
  // State & Hooks
  // ============================================================================

  /**
   * Current authenticated user state
   * @type {[User | null, React.Dispatch<React.SetStateAction<User | null>>]}
   */
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);


  /**
   * Loading state for authentication operations
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);


  const fetchAndSetRole = async (uid: string) => {
    setIsRoleLoading(true);
    let retries = 3; // Number of retry attempts

    while (retries > 0) {
      try {
        const userRole = await fetchUserRole(uid);
        if (userRole) {
          setRole(userRole); // Successfully fetched the role
          break; // Exit the loop
        }
      } catch (error) {
        // Log the error only if it's the last retry
        if (retries === 1) {
          console.error("Error fetching role after retries:", error);
        }

        // Retry logic for specific error conditions
        if (error instanceof Error && error.message.includes("User not found") && retries > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        } else {
          break; // Exit the loop for other errors
        }
      } finally {
        retries--; // Decrement the retry counter
      }
    }

    setIsRoleLoading(false); // Ensure loading state is updated
  };

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Sets up Firebase authentication state listener
   * Automatically updates user state on auth changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
console.log("Auth state changed:", user);
      console.log("Auth state changed:", user);
      setIsLoading(true);
      try {
        setUser(user);
        if (user) {
          console.log("Fetching role for user:", user.uid);
          await new Promise(resolve => setTimeout(resolve, 500));
          await user.getIdToken(true); //refresh auth state
          await fetchAndSetRole(user.uid);
        } else {
          setRole(null);
        }
      } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
        setIsRoleLoading(false);
      }
    });
    return () => unsubscribe();
  }, []); // Ensure no unnecessary dependencies

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handles user sign-in process
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User | undefined>} Authenticated user or undefined
   */
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await login(email, password);
      if(response?.user){
        await fetchAndSetRole(response.user.uid);
      }
      return response?.user;
    } catch (error) {
      console.error("[handleSignIn error] ==>", error);
      return undefined;
    }finally{
      setIsLoading(false);
    }
  };

  /**
   * Handles new user registration process
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} [name] - Optional user's display name
   * @returns {Promise<User | undefined>} Created user or undefined
   */
  const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    latitude:number,
    longitude:number,
  ) => {
    try {
      setIsLoading(true);
      const response = await register(email, password, name);
      let user = null;
      
      if(response?.user){
        //Send User data to db.
        user = response.user;
        await createBackendUser(
          user.uid,
          name,
          email,
          role,
          latitude,
          longitude,
        );
        await user.getIdToken(true); //refresh auth state
      }
      return user;
    } catch (error) {
      console.error("[handleSignUp error] ==>", error);
      return undefined;
    }
    finally{
      setIsLoading(false);
    }
  };

  const createBackendUser = async (uid:string, name:string|null, email:string|null,
     role:string|null,
     longitude:number, latitude:number
  ) => {
    try{
      console.log("sendLocationToDB Params:", { uid, name, email, role, longitude, latitude }); // Debug log
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const response = await fetch(`${DB_API_URL}/add_user`,
        {method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          oauthID:uid,
          name,
          email,
          role:role||"",
          location:mapsUrl,
        }),
      });

      console.log("DB response : ", response.status);
      const responseData = await response.json();
      console.log("DB Repsonse Data:", responseData);
      if(response.status===200 || response.status===201) {
        console.log("Locatoin Added to DB");
      }
      else if(!response.ok){
        throw new Error("Failed to send locatoin to backend");
      }
    } catch(err){
      console.error("[SendLocatoinToDB] ==> ",err);
      Alert.alert("Error","Failed to send location to DB");
    }
  };


  /**
   * Handles user sign-out process
   * Clears local user state after successful logout
   */
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logout();
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("[handleSignOut error] ==>", error);
    }
    finally{
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        user,
        role,
        isLoading : isLoading || isRoleLoading,
        isRoleLoading,
      }}
    >
      {props.children}
      {console.log("isRoleLoading:", isRoleLoading)}
    </AuthContext.Provider>
  );
}
