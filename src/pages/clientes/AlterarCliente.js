import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
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
// ✅ use o cliente axios central com baseURL = import.meta.env.VITE_API_URL
import api from '../../services/api';
const AlterarCliente = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [idCliente, setIdCliente] = useState(null);
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [dataNascimento, setDataNascimento] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [cpfValido, setCpfValido] = useState(true);
    useEffect(() => {
        const clienteString = localStorage.getItem("clienteSelecionado");
        if (!clienteString) {
            alert("Nenhum cliente selecionado.");
            navigate('/clientes');
            return;
        }
        const cliente = JSON.parse(clienteString);
        setIdCliente(cliente.id_cliente);
        setNome(cliente.nome);
        setCpf(cliente.cpf);
        setTelefone(cliente.telefone);
        if (cliente.data_nascimento) {
            setDataNascimento(new Date(cliente.data_nascimento));
        }
    }, [navigate]);
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
    const validarCPF = (cpf) => {
        cpf = cpf.replace(/[^\d]+/g, '');
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
        if (!idCliente || !dataNascimento) {
            alert("Dados inválidos.");
            return;
        }
        const clienteAtualizado = {
            nome,
            cpf, // se o backend exigir só dígitos, use: cpf.replace(/\D/g, '')
            telefone,
            data_nascimento: dataNascimento.toISOString().split('T')[0]
        };
        try {
            // 🔁 trocado para usar o cliente axios central
            await api.put(`/api/clientes/${idCliente}`, clienteAtualizado);
            setShowSuccessModal(true);
        }
        catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            alert('Erro ao atualizar cliente.');
        }
    };
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "ALTERAR CLIENTES" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 NOME" }), _jsx("input", { type: "text", value: nome, onChange: e => setNome(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC4 CPF" }), _jsx("input", { type: "text", value: cpf, onChange: (e) => {
                                            const valorFormatado = formatCPF(e.target.value);
                                            setCpf(valorFormatado);
                                            setCpfValido(validarCPF(valorFormatado));
                                        }, maxLength: 14, required: true, className: cpfValido || cpf.length < 14 ? "" : "input-invalido" }), cpf.length === 14 && (cpfValido ? (_jsx("span", { className: "cpf-valido", children: "CPF v\u00E1lido \u2705" })) : (_jsx("span", { className: "cpf-invalido", children: "CPF inv\u00E1lido \u274C" })))] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDE TELEFONE" }), _jsx("input", { type: "text", value: telefone, onChange: e => setTelefone(formatTelefone(e.target.value)), maxLength: 15, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC5 DATA DE NASCIMENTO" }), _jsx("div", { className: "data-picker-wrapper", children: _jsx(DatePicker, { selected: dataNascimento, onChange: (date) => setDataNascimento(date), locale: ptBR, dateFormat: "dd/MM/yyyy", placeholderText: "Selecione a data", className: "custom-datepicker", showIcon: true, icon: _jsx(FaCalendarAlt, { color: "#fff" }) }) })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => {
                                            localStorage.removeItem("clienteSelecionado");
                                            navigate('/clientes');
                                        }, children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", type: "button", onClick: () => setShowModal(true), children: "VOLTAR" }) })] }) }) }), showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR ?" }), _jsx("button", { className: "close-btn", onClick: () => setShowModal(false), children: "X" })] }), _jsx("p", { children: "Deseja mesmo sair sem salvar?" }), _jsxs("p", { children: [_jsx("strong", { children: "Cliente:" }), " ", nome] }), _jsx("button", { className: "btn azul", onClick: () => {
                                localStorage.removeItem("clienteSelecionado");
                                navigate('/clientes');
                            }, children: "CONFIRMAR" })] }) })), showSuccessModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "\u2705 Sucesso!" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowSuccessModal(false);
                                        localStorage.removeItem("clienteSelecionado");
                                        navigate('/clientes');
                                    }, children: "X" })] }), _jsxs("p", { children: ["Cliente ", _jsx("strong", { children: nome }), " atualizado com sucesso!"] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn azul", onClick: () => {
                                    setShowSuccessModal(false);
                                    localStorage.removeItem("clienteSelecionado");
                                    navigate('/clientes');
                                }, children: "OK" }) })] }) }))] }));
};
export default AlterarCliente;
