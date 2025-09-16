import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIdleLogout } from "../hooks/useIdleLogout";

interface IdleLogoutProps {
  timeoutMs?: number; // default 10 minutos
}

const IdleLogout: React.FC<IdleLogoutProps> = ({ timeoutMs = 600_000 }) => {
  const navigate = useNavigate();

  const handleTimeout = useCallback(() => {
    // Limpa credenciais (ajuste conforme seu app)
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("id_nivel");
    localStorage.removeItem("nome");
    localStorage.removeItem("genero");

    navigate("/login", { replace: true });
  }, [navigate]);

  useIdleLogout(timeoutMs, handleTimeout);

  return null; // componente "fantasma"
};

export default IdleLogout;
