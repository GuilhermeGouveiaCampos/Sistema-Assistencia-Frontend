import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';
import { FaCalendarAlt } from 'react-icons/fa';
// ✅ usa o cliente axios central (src/services/api.ts)
import api from '../../services/api';
const CadastrarCliente = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [cpfValido, setCpfValido] = useState(true);
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
    const validarCPF = (cpfStr) => {
        let cpf = cpfStr.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
            return false;
        let soma = 0;
        for (let i = 0; i < 9; i++)
            soma += parseInt(cpf[i]) * (10 - i);
        let digito1 = 11 - (soma % 11);
        if (digito1 >= 10)
            digito1 = 0;
        soma = 0;
        for (let i = 0; i < 10; i++)
            soma += parseInt(cpf[i]) * (11 - i);
        let digito2 = 11 - (soma % 11);
        if (digito2 >= 10)
            digito2 = 0;
        return digito1 === parseInt(cpf[9]) && digito2 === parseInt(cpf[10]);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const novoCliente = {
            nome,
            cpf, // se o backend exigir só dígitos, use: cpf.replace(/\D/g, '')
            telefone,
            data_nascimento: dataNascimento,
            status: 'ativo'
        };
        try {
            const response = await api.post('/api/clientes', novoCliente);
            console.log("✅ Cliente cadastrado com sucesso:", response.data);
            setShowModal(true);
        }
        catch (error) {
            console.error("❌ Erro ao cadastrar cliente:", error);
            alert("Erro ao cadastrar cliente");
        }
    };
    return (_jsxs(MenuLateral, { children: [showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "SUCESSO \u2705" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowModal(false);
                                        navigate('/clientes');
                                    }, children: "X" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("p", { children: ["Cliente ", _jsx("strong", { children: nome }), " cadastrado com sucesso!"] }), _jsx("button", { className: "btn azul", onClick: () => navigate('/clientes'), children: "OK" })] })] }) })), _jsx("h1", { className: "titulo-clientes", children: "CADASTRAR CLIENTES" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 NOME" }), _jsx("input", { type: "text", placeholder: "Digite o nome completo", value: nome, onChange: e => setNome(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC4 CPF" }), _jsx("input", { type: "text", placeholder: "Digite o CPF", value: cpf, onChange: e => {
                                            const formatado = formatCPF(e.target.value);
                                            setCpf(formatado);
                                            setCpfValido(validarCPF(formatado));
                                        }, maxLength: 14, required: true, className: cpfValido || cpf.length < 14 ? "" : "input-invalido" }), cpf.length === 14 && (cpfValido ? (_jsx("span", { className: "cpf-valido", children: "CPF v\u00E1lido \u2705" })) : (_jsx("span", { className: "cpf-invalido", children: "CPF inv\u00E1lido \u274C" })))] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDE TELEFONE" }), _jsx("input", { type: "text", placeholder: "Digite o telefone", value: telefone, onChange: e => setTelefone(formatTelefone(e.target.value)), maxLength: 15, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC5 DATA DE NASCIMENTO" }), _jsx("div", { className: "data-picker-wrapper", children: _jsx(DatePicker, { selected: dataNascimento ? new Date(dataNascimento) : null, onChange: (date) => setDataNascimento(date?.toISOString().split('T')[0] || ''), locale: ptBR, dateFormat: "dd/MM/yyyy", placeholderText: "Selecione a data", className: "custom-datepicker", showIcon: true, icon: _jsx(FaCalendarAlt, { color: "#fff" }) }) })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => navigate('/clientes'), children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/clientes'), children: "VOLTAR" }) })] }) }) })] }));
};
export default CadastrarCliente;
