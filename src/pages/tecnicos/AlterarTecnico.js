import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Alterar.css";
import "../Css/Cadastrar.css";
import "../Css/Pesquisa.css";
import "../dashboard/Dashboard.css";
import MenuLateral from "../../components/MenuLateral";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const AlterarTecnico = () => {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const tecnicoStorage = localStorage.getItem("tecnicoSelecionado");
    const [idTecnico, setIdTecnico] = useState(null);
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useEffect(() => {
        if (!tecnicoStorage) {
            alert("Nenhum técnico selecionado.");
            navigate("/tecnicos");
            return;
        }
        const tecnico = JSON.parse(tecnicoStorage);
        setIdTecnico(tecnico.id_tecnico);
        setNome(tecnico.nome);
        setCpf(tecnico.cpf);
        setTelefone(tecnico.telefone);
    }, [navigate, tecnicoStorage]);
    const formatCPF = (value) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    };
    const formatTelefone = (value) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .slice(0, 15);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idTecnico) {
            alert("Dados inválidos.");
            return;
        }
        const tecnicoAtualizado = { nome, cpf, telefone };
        try {
            await api.put(`/api/tecnicos/${idTecnico}`, tecnicoAtualizado);
            setShowSuccessModal(true);
        }
        catch (error) {
            console.error("Erro ao atualizar técnico:", error);
            alert("Erro ao atualizar técnico.");
        }
    };
    return (_jsxs(MenuLateral, { children: [showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR ?" }), _jsx("button", { className: "close-btn", onClick: () => setShowModal(false), children: "X" })] }), _jsx("p", { children: "Deseja mesmo sair sem salvar?" }), _jsxs("p", { children: [_jsx("strong", { children: "T\u00E9cnico:" }), " ", nome] }), _jsx("button", { className: "btn azul", onClick: () => {
                                localStorage.removeItem("tecnicoSelecionado");
                                navigate("/tecnicos");
                            }, children: "CONFIRMAR" })] }) })), showSuccessModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "\u2705 Sucesso!" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowSuccessModal(false);
                                        localStorage.removeItem("tecnicoSelecionado");
                                        navigate("/tecnicos");
                                    }, children: "X" })] }), _jsxs("p", { children: ["T\u00E9cnico ", _jsx("strong", { children: nome }), " atualizado com sucesso!"] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn azul", onClick: () => {
                                    setShowSuccessModal(false);
                                    localStorage.removeItem("tecnicoSelecionado");
                                    navigate("/tecnicos");
                                }, children: "OK" }) })] }) })), _jsx("h1", { className: "titulo-clientes", children: "ALTERAR T\u00C9CNICO" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 NOME" }), _jsx("input", { type: "text", value: nome, onChange: (e) => setNome(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC4 CPF" }), _jsx("input", { type: "text", value: cpf, onChange: (e) => setCpf(formatCPF(e.target.value)), maxLength: 14, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDE TELEFONE" }), _jsx("input", { type: "text", value: telefone, onChange: (e) => setTelefone(formatTelefone(e.target.value)), maxLength: 15, required: true })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => setShowModal(true), children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", type: "button", onClick: () => setShowModal(true), children: "VOLTAR" }) })] }) }) })] }));
};
export default AlterarTecnico;
