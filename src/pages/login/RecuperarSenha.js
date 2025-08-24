import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/login/RecuperarSenha.tsx
import { useState } from "react";
import "./RecuperarSenha.css";
import { useNavigate } from "react-router-dom";
import ModalLoginSucesso from "../../components/ModalLoginSucesso";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const formatarCPF = (valor) => valor
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const validarCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned))
        return false;
    let soma = 0;
    for (let i = 0; i < 9; i++)
        soma += parseInt(cleaned[i]) * (10 - i);
    let d1 = (soma * 10) % 11;
    if (d1 === 10)
        d1 = 0;
    if (d1 !== parseInt(cleaned[9]))
        return false;
    soma = 0;
    for (let i = 0; i < 10; i++)
        soma += parseInt(cleaned[i]) * (11 - i);
    let d2 = (soma * 10) % 11;
    if (d2 === 10)
        d2 = 0;
    return d2 === parseInt(cleaned[10]);
};
const RecuperarSenha = () => {
    const [cpf, setCpf] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [cpfValido, setCpfValido] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const handleCpfChange = (e) => {
        const formatado = formatarCPF(e.target.value);
        setCpf(formatado);
        setCpfValido(validarCPF(formatado));
    };
    const handleSubmit = async (e) => {
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
            // ✅ chamada via API central
            await api.post("/api/usuarios/reset-senha", {
                cpf: cpf.replace(/\D/g, ""),
                nova_senha: novaSenha,
            });
            setShowModal(true);
        }
        catch (err) {
            console.error("Erro ao redefinir senha:", err?.response?.data || err);
            alert(err?.response?.data?.erro || "Erro ao redefinir a senha.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "login-box", children: [_jsxs("div", { className: "login-left", children: [_jsx("img", { src: "/logo.png", alt: "Logo Eletrotek", className: "logo" }), _jsxs("form", { className: "form-area", onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "cpf", children: "CPF" }), _jsx("input", { type: "text", id: "cpf", placeholder: "Digite seu CPF", value: cpf, onChange: handleCpfChange, maxLength: 14 }), cpf.length === 14 && (_jsx("span", { style: { color: cpfValido ? "lightgreen" : "red", fontSize: "0.8rem" }, children: cpfValido ? "CPF válido" : "CPF inválido" }))] }), _jsxs("div", { className: "form-group", style: { position: "relative" }, children: [_jsx("label", { htmlFor: "novaSenha", children: "NOVA SENHA" }), _jsx("input", { type: mostrarSenha ? "text" : "password", id: "novaSenha", placeholder: "Digite a nova senha", value: novaSenha, onChange: (e) => setNovaSenha(e.target.value) }), _jsx("button", { type: "button", onClick: () => setMostrarSenha(!mostrarSenha), style: {
                                            position: "absolute",
                                            right: 10,
                                            top: "65%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "1.1rem",
                                        }, title: mostrarSenha ? "Ocultar senha" : "Mostrar senha", children: mostrarSenha ? "🚫" : "👁️" })] }), _jsx("button", { type: "submit", className: "btn-entrar", disabled: loading, children: loading ? "ENVIANDO..." : "REDEFINIR SENHA" }), _jsx("button", { type: "button", onClick: () => navigate("/login"), style: {
                                    marginTop: "1rem",
                                    backgroundColor: "#cccccc",
                                    color: "#1c1740",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    fontWeight: "bold",
                                    width: "100%",
                                    cursor: "pointer",
                                    border: "none",
                                }, children: "VOLTAR PARA LOGIN" })] })] }), _jsx("div", { className: "login-right", children: _jsx("img", { src: "/eletricista.png", alt: "Ilustra\u00E7\u00E3o t\u00E9cnico", className: "ilustracao" }) }), showModal && (_jsx(ModalLoginSucesso, { titulo: "\u2705 Sucesso!", mensagem: "Senha redefinida com sucesso! Fa\u00E7a login com a nova senha.", botaoLabel: "Ir para o login", onClose: () => {
                    setShowModal(false);
                    navigate("/login");
                } }))] }));
};
export default RecuperarSenha;
