import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalLoginSucesso from "../../components/ModalLoginSucesso";
import "./Login.css";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const formatarCPF = (valor) => {
    return valor
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};
const validarCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned))
        return false;
    let soma = 0;
    for (let i = 0; i < 9; i++)
        soma += parseInt(cleaned[i]) * (10 - i);
    let digito1 = (soma * 10) % 11;
    if (digito1 === 10)
        digito1 = 0;
    if (digito1 !== parseInt(cleaned[9]))
        return false;
    soma = 0;
    for (let i = 0; i < 10; i++)
        soma += parseInt(cleaned[i]) * (11 - i);
    let digito2 = (soma * 10) % 11;
    if (digito2 === 10)
        digito2 = 0;
    return digito2 === parseInt(cleaned[10]);
};
const Login = () => {
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [cpfValido, setCpfValido] = useState(null);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleCpfChange = (e) => {
        const valor = e.target.value;
        const formatado = formatarCPF(valor);
        setCpf(formatado);
        setCpfValido(validarCPF(formatado));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarCPF(cpf)) {
            alert("CPF inválido.");
            return;
        }
        try {
            setLoading(true);
            // ✅ Chamada via api central (baseURL = VITE_API_URL)
            const res = await api.post("/api/login", { cpf, senha });
            const data = res.data;
            // ✅ Salva os dados retornados pelo backend (top-level)
            localStorage.setItem("token", data.token);
            localStorage.setItem("nome", data.nome);
            localStorage.setItem("id", String(data.id_usuario));
            if (data?.id_nivel != null)
                localStorage.setItem("id_nivel", String(data.id_nivel));
            // ⚠️ Salva exatamente o que veio de genero (M/F ou masculino/feminino), sem default
            if (typeof data.genero === "string") {
                localStorage.setItem("genero", data.genero);
            }
            else {
                localStorage.removeItem("genero");
            }
            setNomeUsuario(data.nome);
            setShowModal(true);
        }
        catch (err) {
            console.error("❌ Erro no login:", err);
            const msg = err?.response?.data?.mensagem ||
                err?.response?.data?.message ||
                err?.message ||
                "Erro ao conectar com o servidor.";
            alert(msg);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "login-box", children: [_jsxs("div", { className: "login-left", children: [_jsx("img", { src: "/logo.png", alt: "Logo Eletrotek", className: "logo" }), _jsxs("form", { className: "form-area", onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "cpf", children: "CPF" }), _jsx("input", { type: "text", id: "cpf", placeholder: "Digite seu CPF", value: cpf, onChange: handleCpfChange, maxLength: 14 }), cpf.length === 14 && (_jsx("span", { style: {
                                            color: cpfValido ? "lightgreen" : "red",
                                            fontSize: "0.8rem",
                                        }, children: cpfValido ? "CPF válido" : "CPF inválido" }))] }), _jsxs("div", { className: "form-group", style: { position: "relative" }, children: [_jsx("label", { htmlFor: "senha", children: "SENHA" }), _jsx("input", { type: mostrarSenha ? "text" : "password", id: "senha", placeholder: "Digite sua senha", value: senha, onChange: (e) => setSenha(e.target.value.replace(/\s/g, "").slice(0, 20)) }), _jsx("button", { type: "button", onClick: () => setMostrarSenha(!mostrarSenha), style: {
                                            position: "absolute",
                                            right: 10,
                                            top: "65%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "1.1rem",
                                        }, title: mostrarSenha ? "Ocultar senha" : "Mostrar senha", children: mostrarSenha ? "🚫" : "👁️" })] }), _jsx("div", { className: "esqueceu", children: _jsx("button", { type: "button", onClick: () => navigate("/recuperar-senha"), style: {
                                        background: "none",
                                        border: "none",
                                        color: "#7bdaf3",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                        padding: 0,
                                        fontWeight: 700,
                                        letterSpacing: "0.5px"
                                    }, children: "ESQUECEU A SENHA?" }) }), _jsx("button", { type: "submit", className: "btn-entrar", disabled: loading, children: loading ? "ENTRANDO..." : "ENTRAR" })] })] }), _jsx("div", { className: "login-right", children: _jsx("img", { src: "/eletricista.png", alt: "Ilustra\u00E7\u00E3o t\u00E9cnico", className: "ilustracao" }) }), showModal && (_jsx(ModalLoginSucesso, { nome: nomeUsuario, onClose: () => {
                    setShowModal(false);
                    navigate("/dashboard");
                } }))] }));
};
export default Login;
