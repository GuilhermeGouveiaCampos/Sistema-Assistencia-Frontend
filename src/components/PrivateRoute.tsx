// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function hasToken() {
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}

export default function PrivateRoute() {
  // Lê do localStorage de forma síncrona (evita piscar/erro)
  const [authed, setAuthed] = React.useState(() => hasToken());

  // Sincroniza se o token mudar (outra aba, logout, etc.)
  React.useEffect(() => {
    const onStorage = () => setAuthed(hasToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return authed ? <Outlet /> : <Navigate to="/login" replace />;
}
