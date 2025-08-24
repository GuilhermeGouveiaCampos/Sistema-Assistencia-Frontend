import React from "react";
import ReactDOM from "react-dom";

interface ModalLoginSucessoProps {
  onClose: () => void;
  nome?: string;                 // opcional
  titulo?: string;               // opcional
  mensagem?: React.ReactNode;    // opcional (pode ser string ou JSX)
  botaoLabel?: string;           // opcional
}

const ModalLoginSucesso: React.FC<ModalLoginSucessoProps> = ({
  onClose,
  nome,
  titulo,
  mensagem,
  botaoLabel,
}) => {
  const tituloFinal = titulo ?? "✅ Bem-vindo!";
  const mensagemFinal =
    mensagem ??
    (
      <>
        Olá, <strong>{nome ?? "usuário"}</strong> 👋
        <br />
        Seu login foi realizado com sucesso.
      </>
    );

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
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
          maxWidth: "420px",
          width: "90%",
        }}
      >
        <h2 style={{ marginBottom: "15px", color: "#00ff99" }}>{tituloFinal}</h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.5 }}>{mensagemFinal}</p>
        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#00ff99",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {botaoLabel ?? "Continuar"}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ModalLoginSucesso;
