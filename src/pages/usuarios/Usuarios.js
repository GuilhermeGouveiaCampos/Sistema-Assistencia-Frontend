import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import '../dashboard/Dashboard.css';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import MenuLateral from "../../components/MenuLateral";
// ✅ Cliente axios centralizado (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const Usuarios = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [nomeFiltro, setNomeFiltro] = useState("");
    const [cpfFiltro, setCpfFiltro] = useState("");
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const formatarCPF = (valor) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        return apenasNumeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
            .slice(0, 14);
    };
    const consultarUsuarios = async () => {
        try {
            const response = await api.get("/api/usuarios", {
                params: { nome: nomeFiltro, cpf: cpfFiltro }
            });
            setUsuarios(response.data);
            setUsuarioSelecionado(null);
        }
        catch (error) {
            console.error("Erro ao consultar usuários:", error);
        }
    };
    useEffect(() => {
        consultarUsuarios();
    }, []);
    useEffect(() => {
        const delay = setTimeout(() => consultarUsuarios(), 400);
        return () => clearTimeout(delay);
    }, [nomeFiltro, cpfFiltro]);
    const selecionarUsuario = (user) => {
        if (!user?.id_usuario)
            return;
        setUsuarioSelecionado(user.id_usuario);
    };
    const abrirModalExclusao = () => {
        if (usuarioSelecionado !== null)
            setMostrarModal(true);
    };
    const excluirUsuario = async () => {
        try {
            await api.delete(`/api/usuarios/${usuarioSelecionado}`);
            setMostrarModal(false);
            consultarUsuarios();
        }
        catch (error) {
            console.error("Erro ao excluir usuário:", error);
        }
    };
    const usuarioAtual = usuarios.find(u => u.id_usuario === usuarioSelecionado);
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "USU\u00C1RIOS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsxs("div", { className: "filtros-clientes", children: [_jsx("input", { type: "text", placeholder: "NOME", value: nomeFiltro, onChange: (e) => setNomeFiltro(e.target.value) }), _jsx("input", { type: "text", placeholder: "CPF", value: cpfFiltro, onChange: (e) => setCpfFiltro(formatarCPF(e.target.value)) }), _jsx("button", { className: "btn roxo-claro", onClick: consultarUsuarios, children: "CONSULTAR" })] }), _jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NOME" }), _jsx("th", { children: "N\u00CDVEL" }), _jsx("th", { children: "CPF" })] }) }), _jsx("tbody", { children: usuarios.map((u) => (_jsxs("tr", { onClick: () => selecionarUsuario(u), className: usuarioSelecionado === u.id_usuario ? 'linha-selecionada' : '', style: { cursor: 'pointer' }, children: [_jsx("td", { children: u.nome }), _jsx("td", { children: u.nome_nivel }), _jsx("td", { children: formatarCPF(u.cpf) })] }, u.id_usuario))) })] }) }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { className: "btn azul", onClick: () => navigate('/usuarios/cadastrar'), children: "CADASTRAR" }), _jsx("button", { className: "btn preto", disabled: usuarioSelecionado === null, onClick: () => {
                                        const usuario = usuarios.find(u => u.id_usuario === usuarioSelecionado);
                                        if (usuario) {
                                            localStorage.setItem("usuarioSelecionado", JSON.stringify(usuario));
                                            navigate('/usuarios/editar');
                                        }
                                    }, children: "ALTERAR" }), _jsx("button", { className: "btn vermelho", disabled: usuarioSelecionado === null, onClick: abrirModalExclusao, children: "EXCLUIR" }), _jsx("button", { className: "btn vermelho-claro", onClick: () => navigate('/usuarios/inativos'), children: "INATIVOS" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/'), children: "VOLTAR" }) })] }) }), mostrarModal && usuarioAtual && (_jsx(ConfirmarExclusao, { nomeCliente: usuarioAtual.nome, onConfirmar: excluirUsuario, onFechar: () => setMostrarModal(false) }))] }));
};
export default Usuarios;
