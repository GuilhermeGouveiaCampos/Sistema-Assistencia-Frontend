import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard/Dashboard.css";
import "../Css/Cadastrar.css";
import MenuLateral from "../../components/MenuLateral";

// ✅ importando cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";

const validarCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
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

// máscara de telefone
const formatarTelefone = (valor: string): string => {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
};

const CadastrarUsuario: React.FC = () => {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    id_nivel: "1",
    especializacao: "",
    telefone: "",
    genero: "masculino",
  });

  const [cpfValido, setCpfValido] = useState<boolean | null>(null);
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);

  // 👁️ Olho da SENHA (já existia)
  const [mostrarSenha, setMostrarSenha] = useState(false);
  // 👁️ NOVO: Olho independente para CONFIRMAR SENHA
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // ✅ NOVO: campo de confirmar senha
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const formatarCPF = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const novoValor =
      name === "cpf" ? formatarCPF(value)
      : name === "telefone" ? formatarTelefone(value)
      : value;

    setFormulario((prev) => ({ ...prev, [name]: novoValor }));

    if (name === "cpf") {
      const somenteNumeros = novoValor.replace(/\D/g, "");
      if (somenteNumeros.length === 11) {
        setCpfValido(validarCPF(somenteNumeros));
      } else {
        setCpfValido(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ validação de confirmar senha
    if (formulario.senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!validarCPF(formulario.cpf)) {
      alert("CPF inválido.");
      return;
    }

    if (formulario.id_nivel === "3") {
      const faltando: string[] = [];
      if (!formulario.especializacao.trim()) faltando.push("especializacao");
      if (!formulario.telefone.trim()) faltando.push("telefone");
      if (faltando.length) {
        alert(`Campos de técnico faltando: ${faltando.join(", ")}`);
        return;
      }
    }

    try {
      const payload: any = {
        nome: formulario.nome.trim(),
        cpf: formulario.cpf.replace(/\D/g, ""),
        email: formulario.email.trim(),
        senha: formulario.senha,
        id_nivel: Number(formulario.id_nivel),
        genero: formulario.genero.toLowerCase(),
        status: "ativo",
      };

      if (formulario.id_nivel === "3") {
        payload.especializacao = formulario.especializacao.trim();
        payload.telefone = formulario.telefone.replace(/\D/g, "");
      }

      // ✅ agora usando api central (VITE_API_URL)
      await api.post("/api/usuarios", payload);

      setMostrarModalSucesso(true);
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error?.response?.data || error);
      alert(error?.response?.data?.erro || "Erro ao cadastrar usuário.");
    }
  };

  // ✅ NOVO: status de comparação das senhas (para feedback em tempo real)
  const mostrouFeedbackConfirmar = confirmarSenha.length > 0;
  const senhasIguais = mostrouFeedbackConfirmar && formulario.senha === confirmarSenha;

  return (
    <MenuLateral>
      {mostrarModalSucesso && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>SUCESSO ✅</strong>
              <button
                className="close-btn"
                onClick={() => {
                  setMostrarModalSucesso(false);
                  navigate('/usuarios');
                }}
              >
                X
              </button>
            </div>
            <div className="modal-body">
              <p>Usuário cadastrado com sucesso!</p>
              <button className="btn azul" onClick={() => navigate('/usuarios')}>OK</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="titulo-clientes">CADASTRAR USUÁRIO</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>👤 NOME</span>
              <input type="text" name="nome" required value={formulario.nome} onChange={handleChange} />
            </label>

            <label>
              <span>📄 CPF</span>
              <input type="text" name="cpf" required value={formulario.cpf} onChange={handleChange} />
              {cpfValido !== null && (
                <p style={{ color: cpfValido ? "green" : "red", fontSize: "0.9rem", marginTop: "5px" }}>
                  {cpfValido ? "CPF válido ✅" : "CPF inválido ❌"}
                </p>
              )}
            </label>

            <label>
              <span>📧 E-MAIL</span>
              <input type="email" name="email" required value={formulario.email} onChange={handleChange} />
            </label>

            <label>
              <span>🔒 SENHA</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  required
                  value={formulario.senha}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{ marginLeft: "5px", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  {mostrarSenha ? "🚫" : "👁️"}
                </button>
              </div>
            </label>

            <label>
              <span>🔒 CONFIRMAR SENHA</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  name="confirmarSenha"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  style={{ marginLeft: "5px", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  {mostrarConfirmarSenha ? "🚫" : "👁️"}
                </button>
              </div>
              {/* ✅ feedback em tempo real abaixo do campo */}
              {mostrouFeedbackConfirmar && (
                <p
                  style={{
                    color: senhasIguais ? "green" : "red",
                    fontSize: "0.9rem",
                    marginTop: "5px",
                  }}
                >
                  {senhasIguais ? "As senhas coincidem ✅" : "As senhas não coincidem ❌"}
                </p>
              )}
            </label>

            <label>
              <span>⚧️ GÊNERO</span>
              <select name="genero" value={formulario.genero} onChange={handleChange} required>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </label>

            <label>
              <span>🛡️ NÍVEL DE ACESSO</span>
              <select name="id_nivel" value={formulario.id_nivel} onChange={handleChange} required>
                <option value="1">Gerente</option>
                <option value="2">Atendente</option>
                <option value="3">Técnico</option>
              </select>
            </label>

            {formulario.id_nivel === "3" && (
              <>
                <label>
                  <span>📚 ESPECIALIZAÇÃO</span>
                  <input
                    type="text"
                    name="especializacao"
                    value={formulario.especializacao}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>📞 TELEFONE</span>
                  <input
                    type="text"
                    name="telefone"
                    value={formulario.telefone}
                    onChange={handleChange}
                    required
                    maxLength={15}
                  />
                </label>
              </>
            )}

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">SALVAR</button>
              <button type="button" className="btn preto" onClick={() => navigate("/usuarios")}>CANCELAR</button>
            </div>

            <div className="voltar-container">
              <button type="button" className="btn roxo" onClick={() => navigate("/usuarios")}>VOLTAR</button>
            </div>
          </form>
        </div>
      </section>
    </MenuLateral>
  );
};

export default CadastrarUsuario;
