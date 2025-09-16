// src/pages/login/RecuperarSenha.tsx
import React, { useState } from "react";
import "./RecuperarSenha.css";
import { useNavigate } from "react-router-dom";
import ModalLoginSucesso from "../../components/ModalLoginSucesso";
import api from "../../services/api";

const formatarCPF = (valor: string): string =>
  valor
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const validarCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cleaned[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cleaned[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cleaned[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cleaned[10]);
};

const RecuperarSenha: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCPF(e.target.value);
    setCpf(formatado);
    setCpfValido(validarCPF(formatado));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarCPF(cpf)) {
      alert("CPF inválido");
      return;
    }
    if (novaSenha.trim().length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/usuarios/reset-senha", {
        cpf: cpf.replace(/\D/g, ""),
        nova_senha: novaSenha,
      });

      setShowModal(true);
    } catch (err: any) {
      console.error("Erro ao redefinir senha:", err?.response?.data || err);
      alert(err?.response?.data?.erro || "Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => {
    setShowModal(false);
    navigate("/login");
  };

  return (
    <div className="login-box">
      <div className="login-left">
        <img src="/logo.png" alt="Logo Eletrotek" className="logo" />

        <form className="form-area" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={handleCpfChange}
              maxLength={14}
            />
            {cpf.length === 14 && (
              <span style={{ color: cpfValido ? "lightgreen" : "red", fontSize: "0.8rem" }}>
                {cpfValido ? "CPF válido" : "CPF inválido"}
              </span>
            )}
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="novaSenha">NOVA SENHA</label>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="novaSenha"
              placeholder="Digite a nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                position: "absolute",
                right: 10,
                top: "65%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
              title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? "🚫" : "👁️"}
            </button>
          </div>

          <button type="submit" className="btn-entrar" disabled={loading}>
            {loading ? "ENVIANDO..." : "REDEFINIR SENHA"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              marginTop: "1rem",
              backgroundColor: "#cccccc",
              color: "#1c1740",
              padding: "10px",
              borderRadius: "6px",
              fontWeight: "bold",
              width: "100%",
              cursor: "pointer",
              border: "none",
            }}
          >
            VOLTAR PARA LOGIN
          </button>
        </form>
      </div>

      <div className="login-right">
        <img src="/eletricista.png" alt="Ilustração técnico" className="ilustracao" />
      </div>

      {showModal && (
        <ModalLoginSucesso
          titulo="✅ Sucesso!"
          mensagem="Senha redefinida com sucesso! Faça login com a nova senha."
          botaoLabel="Ir para o login"
          // ✅ Adicionados para atender a tipagem atual do modal:
          onClose={goLogin}
          onTimeout={goLogin}
          initialSeconds={3} // opcional: contador curtinho aqui
        />
      )}
    </div>
  );
};

export default RecuperarSenha;
