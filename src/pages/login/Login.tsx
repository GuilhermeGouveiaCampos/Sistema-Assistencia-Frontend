// src/pages/login/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalLoginSucesso from "../../components/ModalLoginSucesso";
import "./Login.css";
import api from "../../services/api";

const formatarCPF = (valor: string): string => {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const validarCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cleaned[i]) * (10 - i);
  let digito1 = (soma * 10) % 11;
  if (digito1 === 10) digito1 = 0;
  if (digito1 !== parseInt(cleaned[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cleaned[i]) * (11 - i);
  let digito2 = (soma * 10) % 11;
  if (digito2 === 10) digito2 = 0;

  return digito2 === parseInt(cleaned[10]);
};

const Login: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const formatado = formatarCPF(valor);
    setCpf(formatado);
    setCpfValido(validarCPF(formatado));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarCPF(cpf)) {
      alert("CPF inválido.");
      return;
    }
    if (!senha.trim()) {
      alert("Informe a senha.");
      return;
    }

    try {
      setLoading(true);

      // Envie o CPF somente com dígitos
      const cpfLimpo = cpf.replace(/\D/g, "");
      const res = await api.post("/api/login", { cpf: cpfLimpo, senha: senha.trim() });

      const data = res.data || {};

      // Salva dados retornados
      if (data.token) localStorage.setItem("token", data.token);
      if (data.nome) localStorage.setItem("nome", data.nome);

      // ⬇️ O backend retorna `id`, não `id_usuario`
      if (data.id != null) {
        localStorage.setItem("id", String(data.id));
      } else if (data.id_usuario != null) {
        localStorage.setItem("id", String(data.id_usuario));
      }

      if (data.id_nivel != null) {
        localStorage.setItem("id_nivel", String(data.id_nivel));
      }

      if (typeof data.genero === "string") {
        localStorage.setItem("genero", data.genero);
      } else {
        localStorage.removeItem("genero");
      }

      // 👉 Redireciona imediatamente para a dashboard (sem modal)
      navigate("/dashboard", { replace: true });
      return;

      // (as linhas abaixo foram removidas por não serem mais necessárias)
      // setNomeUsuario(data.nome || "Usuário");
      // setShowModal(true);
    } catch (err: any) {
      console.error("❌ Erro no login:", err);

      // tenta extrair mensagem do backend
      const msg =
        err?.response?.data?.erro ||
        err?.response?.data?.mensagem ||
        err?.response?.data?.message ||
        (err?.response?.status === 500 ? "Erro interno do servidor." : "") ||
        err?.message ||
        "Erro ao conectar com o servidor.";

      alert(msg);
    } finally {
      setLoading(false);
    }
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
              autoComplete="username"
            />
          {cpf.length === 14 && (
              <span style={{ color: cpfValido ? "lightgreen" : "red", fontSize: "0.8rem" }}>
                {cpfValido ? "CPF válido" : "CPF inválido"}
              </span>
            )}
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="senha">SENHA</label>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value.replace(/\s/g, "").slice(0, 50))}
              autoComplete="current-password"
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

          <div className="esqueceu">
            <button
              type="button"
              onClick={() => navigate("/recuperar-senha")}
              style={{
                background: "none",
                border: "none",
                color: "#7bdaf3",
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              ESQUECEU A SENHA?
            </button>
          </div>

          <button type="submit" className="btn-entrar" disabled={loading}>
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>
      </div>

      <div className="login-right">
        <img src="/eletricista.png" alt="Ilustração técnico" className="ilustracao" />
      </div>

      {/* modal permanece no arquivo, mas não será exibido pois não setamos showModal */}
      {showModal && (
        <ModalLoginSucesso
          nome={nomeUsuario}
          onClose={() => {
            setShowModal(false);
            navigate("/dashboard", { replace: true });
          }}
        />
      )}
    </div>
  );
};

export default Login;
