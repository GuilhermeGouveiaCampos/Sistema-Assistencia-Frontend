import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard/Dashboard.css";
import "../Css/Cadastrar.css";
import MenuLateral from "../../components/MenuLateral";
// ✅ importando cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const validarCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
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
// máscara de telefone
const formatarTelefone = (valor) => {
    const n = valor.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 2)
        return `(${n}`;
    if (n.length <= 6)
        return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    if (n.length <= 10)
        return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
};
const CadastrarUsuario = () => {
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
    const [cpfValido, setCpfValido] = useState(null);
    const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const formatarCPF = (valor) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        return apenasNumeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
            .slice(0, 14);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        const novoValor = name === "cpf" ? formatarCPF(value)
            : name === "telefone" ? formatarTelefone(value)
                : value;
        setFormulario((prev) => ({ ...prev, [name]: novoValor }));
        if (name === "cpf") {
            const somenteNumeros = novoValor.replace(/\D/g, "");
            if (somenteNumeros.length === 11) {
                setCpfValido(validarCPF(somenteNumeros));
            }
            else {
                setCpfValido(null);
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarCPF(formulario.cpf)) {
            alert("CPF inválido.");
            return;
        }
        if (formulario.id_nivel === "3") {
            const faltando = [];
            if (!formulario.especializacao.trim())
                faltando.push("especializacao");
            if (!formulario.telefone.trim())
                faltando.push("telefone");
            if (faltando.length) {
                alert(`Campos de técnico faltando: ${faltando.join(", ")}`);
                return;
            }
        }
        try {
            const payload = {
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
        }
        catch (error) {
            console.error("Erro ao cadastrar usuário:", error?.response?.data || error);
            alert(error?.response?.data?.erro || "Erro ao cadastrar usuário.");
        }
    };
    return (_jsxs(MenuLateral, { children: [mostrarModalSucesso && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "SUCESSO \u2705" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setMostrarModalSucesso(false);
                                        navigate('/usuarios');
                                    }, children: "X" })] }), _jsxs("div", { className: "modal-body", children: [_jsx("p", { children: "Usu\u00E1rio cadastrado com sucesso!" }), _jsx("button", { className: "btn azul", onClick: () => navigate('/usuarios'), children: "OK" })] })] }) })), _jsx("h1", { className: "titulo-clientes", children: "CADASTRAR USU\u00C1RIO" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 NOME" }), _jsx("input", { type: "text", name: "nome", required: true, value: formulario.nome, onChange: handleChange })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC4 CPF" }), _jsx("input", { type: "text", name: "cpf", required: true, value: formulario.cpf, onChange: handleChange }), cpfValido !== null && (_jsx("p", { style: { color: cpfValido ? "green" : "red", fontSize: "0.9rem", marginTop: "5px" }, children: cpfValido ? "CPF válido ✅" : "CPF inválido ❌" }))] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCE7 E-MAIL" }), _jsx("input", { type: "email", name: "email", required: true, value: formulario.email, onChange: handleChange })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD12 SENHA" }), _jsxs("div", { style: { display: "flex", alignItems: "center" }, children: [_jsx("input", { type: mostrarSenha ? "text" : "password", name: "senha", required: true, value: formulario.senha, onChange: handleChange, style: { flex: 1 } }), _jsx("button", { type: "button", onClick: () => setMostrarSenha(!mostrarSenha), style: { marginLeft: "5px", border: "none", cursor: "pointer", fontSize: "1.2rem" }, children: mostrarSenha ? "🚫" : "👁️" })] })] }), _jsxs("label", { children: [_jsx("span", { children: "\u26A7\uFE0F G\u00CANERO" }), _jsxs("select", { name: "genero", value: formulario.genero, onChange: handleChange, required: true, children: [_jsx("option", { value: "masculino", children: "Masculino" }), _jsx("option", { value: "feminino", children: "Feminino" })] })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDEE1\uFE0F N\u00CDVEL DE ACESSO" }), _jsxs("select", { name: "id_nivel", value: formulario.id_nivel, onChange: handleChange, required: true, children: [_jsx("option", { value: "1", children: "Gerente" }), _jsx("option", { value: "2", children: "Atendente" }), _jsx("option", { value: "3", children: "T\u00E9cnico" })] })] }), formulario.id_nivel === "3" && (_jsxs(_Fragment, { children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDA ESPECIALIZA\u00C7\u00C3O" }), _jsx("input", { type: "text", name: "especializacao", value: formulario.especializacao, onChange: handleChange, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDE TELEFONE" }), _jsx("input", { type: "text", name: "telefone", value: formulario.telefone, onChange: handleChange, required: true, maxLength: 15 })] })] })), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => navigate("/usuarios"), children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { type: "button", className: "btn roxo", onClick: () => navigate("/usuarios"), children: "VOLTAR" }) })] }) }) })] }));
};
export default CadastrarUsuario;
