import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

interface ModalLoginSucessoProps {
  onClose: () => void;              // fechar agora (pula a espera)
  onTimeout: () => void;            // chamado quando o contador chega a 0
  nome?: string;                    // opcional
  titulo?: string;                  // opcional
  mensagem?: React.ReactNode;       // opcional (string ou JSX)
  botaoLabel?: string;              // opcional
  initialSeconds?: number;          // segundos de contagem (default 5)
}

const ModalLoginSucesso: React.FC<ModalLoginSucessoProps> = ({
  onClose,
  onTimeout,
  nome,
  titulo,
  mensagem,
  botaoLabel,
  initialSeconds = 5,
}) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const intervalRef = useRef<number | null>(null);

  const tituloFinal = titulo ?? "✅ Bem-vindo!";
  const mensagemFinal =
    mensagem ?? (
      <>
        Olá, <strong>{nome ?? "usuário"}</strong> 👋
        <br />
        Login realizado com sucesso.
      </>
    );

  useEffect(() => {
    // inicia contagem regressiva
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      onTimeout(); // aciona redirecionamento
    }
  }, [seconds, onTimeout]);

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a2e",
          color: "#e0e0e0",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 0 15px rgba(0, 255, 128, 0.4)",
          textAlign: "center",
          maxWidth: "460px",
          width: "92%",
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#00ff99" }}>{tituloFinal}</h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.5 }}>{mensagemFinal}</p>

        <div style={{ marginTop: 12, fontSize: "0.95rem", opacity: 0.9 }}>
          Redirecionando para a dashboard em <strong>{seconds}s</strong>…
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "18px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#00ff99",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {botaoLabel ?? "Ir agora"}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ModalLoginSucesso;
