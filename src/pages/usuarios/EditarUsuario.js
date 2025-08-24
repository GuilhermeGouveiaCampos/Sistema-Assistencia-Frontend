import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import MenuLateral from "../../components/MenuLateral";
// ✅ Cliente axios centralizado (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const AlterarUsuario = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuarioLogado = localStorage.getItem("id");
    const navigate = useNavigate();
    const [idUsuario, setIdUsuario] = useState(null);
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [idNivel, setIdNivel] = useState('');
    const [genero, setGenero] = useState('masculino');
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [cpfValido, setCpfValido] = useState(null);
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
    useEffect(() => {
        const usuarioString = localStorage.getItem("usuarioSelecionado");
        if (!usuarioString) {
            alert("Nenhum usuário selecionado.");
            navigate('/usuarios');
            return;
        }
        const usuario = JSON.parse(usuarioString);
        setIdUsuario(usuario.id_usuario);
        setNome(usuario.nome);
        setCpf(usuario.cpf);
        setEmail(usuario.email);
        setIdNivel(usuario.id_nivel);
        setGenero(usuario.genero || 'masculino');
    }, [navigate]);
    const formatCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idUsuario)
            return;
        const cpfNumerico = cpf.replace(/\D/g, '');
        if (!validarCPF(cpfNumerico)) {
            alert("CPF inválido.");
            return;
        }
        try {
            await api.put(`/api/usuarios/${idUsuario}`, {
                nome,
                cpf: cpfNumerico,
                email,
                id_nivel: idNivel,
                genero,
            });
            setShowSuccessModal(true);
        }
        catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            alert("Erro ao atualizar usuário.");
        }
    };
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "ALTERAR USU\u00C1RIO" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 NOME" }), _jsx("input", { type: "text", value: nome, onChange: e => setNome(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC4 CPF" }), _jsx("input", { type: "text", value: cpf, onChange: (e) => {
                                            const novoCPF = formatCPF(e.target.value);
                                            setCpf(novoCPF);
                                            const somenteNumeros = novoCPF.replace(/\D/g, '');
                                            if (somenteNumeros.length === 11) {
                                                setCpfValido(validarCPF(somenteNumeros));
                                            }
                                            else {
                                                setCpfValido(null);
                                            }
                                        }, maxLength: 14, required: true }), cpfValido !== null && (_jsx("p", { style: {
                                            color: cpfValido ? "green" : "red",
                                            fontSize: "0.9rem",
                                            marginTop: "5px",
                                            fontWeight: "bold"
                                        }, children: cpfValido ? "CPF válido ✅" : "CPF inválido ❌" }))] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCE7 EMAIL" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\u26A7\uFE0F G\u00CANERO" }), _jsxs("select", { value: genero, onChange: e => setGenero(e.target.value), required: true, children: [_jsx("option", { value: "masculino", children: "Masculino" }), _jsx("option", { value: "feminino", children: "Feminino" })] })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83E\uDDD1\u200D\uD83D\uDCBC N\u00CDVEL" }), _jsxs("select", { value: idNivel, onChange: e => setIdNivel(e.target.value), required: true, children: [_jsx("option", { value: "1", children: "Administrador" }), _jsx("option", { value: "2", children: "Atendente" }), _jsx("option", { value: "3", children: "T\u00E9cnico" })] })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => navigate('/usuarios'), children: "CANCELAR" })] })] }) }) }), showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR SA\u00CDDA?" }), _jsx("button", { className: "close-btn", onClick: () => setShowModal(false), children: "X" })] }), _jsx("p", { children: "Deseja mesmo sair sem salvar?" }), _jsxs("p", { children: [_jsx("strong", { children: "Usu\u00E1rio:" }), " ", nome] }), _jsx("button", { className: "btn azul", onClick: () => {
                                localStorage.removeItem("usuarioSelecionado");
                                navigate('/usuarios');
                            }, children: "CONFIRMAR" })] }) })), showSuccessModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "\u2705 Sucesso!" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowSuccessModal(false);
                                        navigate('/usuarios');
                                    }, children: "X" })] }), _jsxs("p", { children: ["Usu\u00E1rio ", _jsx("strong", { children: nome }), " atualizado com sucesso!"] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn azul", onClick: () => {
                                    setShowSuccessModal(false);
                                    navigate('/usuarios');
                                }, children: "OK" }) })] }) })), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", type: "button", onClick: () => setShowModal(true), children: "VOLTAR" }) })] }));
};
export default AlterarUsuario;
