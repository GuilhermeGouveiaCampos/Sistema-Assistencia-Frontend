import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import MenuLateral from "../../components/MenuLateral";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const CadastrarTecnico = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [especializacao, setEspecializacao] = useState('');
    const [showModal, setShowModal] = useState(false);
    const formatCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };
    const formatTelefone = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const novoTecnico = {
            nome,
            cpf,
            telefone,
            especializacao,
            status: 'ativo'
        };
        try {
            const response = await api.post('/api/tecnicos', novoTecnico);
            console.log("✅ Técnico cadastrado com sucesso:", response.data);
            setShowModal(true);
        }
        catch (error) {
            const axiosError = error;
            console.error("❌ Erro ao cadastrar técnico:", axiosError);
            alert("Erro ao cadastrar técnico.");
        }
    };
    return (_jsxs(MenuLateral, { children: [showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "SUCESSO \u2705" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowModal(false);
                                        navigate('/tecnicos');
                                    }, children: "X" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("p", { children: ["T\u00E9cnico ", _jsx("strong", { children: nome }), " cadastrado com sucesso!"] }), _jsx("button", { className: "btn azul", onClick: () => navigate('/tecnicos'), children: "OK" })] })] }) })), _jsx("h1", { className: "titulo-clientes", children: "CADASTRAR T\u00C9CNICO" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 NOME" }), _jsx("input", { type: "text", placeholder: "Digite o nome completo", value: nome, onChange: e => setNome(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC4 CPF" }), _jsx("input", { type: "text", placeholder: "Digite o CPF", value: cpf, onChange: e => setCpf(formatCPF(e.target.value)), maxLength: 14, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDE TELEFONE" }), _jsx("input", { type: "text", placeholder: "Digite o telefone", value: telefone, onChange: e => setTelefone(formatTelefone(e.target.value)), maxLength: 15, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83C\uDF93 ESPECIALIZA\u00C7\u00C3O" }), _jsx("input", { type: "text", placeholder: "Ex: Eletr\u00F4nicos, Inform\u00E1tica...", value: especializacao, onChange: e => setEspecializacao(e.target.value), required: true })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => navigate('/tecnicos'), children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/tecnicos'), children: "VOLTAR" }) })] }) }) })] }));
};
export default CadastrarTecnico;
