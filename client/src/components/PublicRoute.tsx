// src/components/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type{ JSX } from "@emotion/react/jsx-runtime";// or get from Redux if you're using it

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth(); // Or useSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/" replace />; // Redirect to homepage or dashboard
  }

  return children;
}
