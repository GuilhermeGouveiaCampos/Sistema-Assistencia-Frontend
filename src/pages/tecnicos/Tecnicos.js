import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import '../dashboard/Dashboard.css';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import MenuLateral from "../../components/MenuLateral";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const Tecnicos = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [tecnicos, setTecnicos] = useState([]);
    const [nomeFiltro, setNomeFiltro] = useState("");
    const [cpfFiltro, setCpfFiltro] = useState("");
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const formatarCPF = (valor) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        return apenasNumeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
            .slice(0, 14);
    };
    const consultarTecnicos = async () => {
        try {
            const response = await api.get("/api/tecnicos", {
                params: { nome: nomeFiltro, cpf: cpfFiltro }
            });
            setTecnicos(response.data);
            setTecnicoSelecionado(null);
        }
        catch (error) {
            console.error("Erro ao buscar técnicos:", error);
        }
    };
    useEffect(() => {
        consultarTecnicos();
    }, []);
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            consultarTecnicos();
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [nomeFiltro, cpfFiltro]);
    const selecionarTecnico = (tec) => {
        if (!tec || !tec.id_tecnico)
            return;
        setTecnicoSelecionado(tec.id_tecnico);
    };
    const abrirModalExclusao = () => {
        if (tecnicoSelecionado !== null)
            setMostrarModal(true);
    };
    const excluirTecnico = async () => {
        try {
            await api.delete(`/api/tecnicos/${tecnicoSelecionado}`);
            setMostrarModal(false);
            consultarTecnicos();
        }
        catch (error) {
            console.error("Erro ao excluir técnico:", error);
        }
    };
    const tecnicoAtual = tecnicos.find(t => t.id_tecnico === tecnicoSelecionado);
    return (_jsxs(MenuLateral, { children: [_jsxs("header", { className: "titulo-bar", children: [_jsx("h1", { className: "titulo-clientes", children: "T\u00C9CNICOS" }), _jsx("button", { className: "btn roxo-claro titulo-atr-btn", onClick: () => navigate('/tecnicos/atribuicoes'), children: "VER ATRIBUI\u00C7\u00D5ES" })] }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsxs("div", { className: "filtros-clientes", children: [_jsx("input", { type: "text", placeholder: "NOME COMPLETO", value: nomeFiltro, onChange: (e) => setNomeFiltro(e.target.value) }), _jsx("input", { type: "text", placeholder: "CPF", value: cpfFiltro, onChange: (e) => setCpfFiltro(formatarCPF(e.target.value)) }), _jsx("button", { className: "btn roxo-claro", onClick: consultarTecnicos, children: "CONSULTAR" })] }), _jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NOME" }), _jsx("th", { children: "CPF" }), _jsx("th", { children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: "TELEFONE" }), tecnicoSelecionado !== null && (_jsx("button", { onClick: () => setTecnicoSelecionado(null), style: {
                                                                    marginLeft: '0.5rem',
                                                                    padding: '0.2rem 0.6rem',
                                                                    fontSize: '0.75rem',
                                                                    backgroundColor: '#666',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }, children: "DESMARCAR" }))] }) }), _jsx("th", { style: { width: 140, textAlign: 'center' }, children: "A\u00C7\u00D5ES" })] }) }), _jsx("tbody", { children: tecnicos.map((tec) => (_jsxs("tr", { onClick: () => selecionarTecnico(tec), className: tecnicoSelecionado === tec.id_tecnico ? 'linha-selecionada' : '', style: { cursor: 'pointer' }, children: [_jsx("td", { children: tec.nome }), _jsx("td", { children: tec.cpf }), _jsx("td", { children: tec.telefone }), _jsx("td", { style: { textAlign: 'center' }, children: _jsx("button", { className: "btn detalhes", onClick: (ev) => {
                                                            ev.stopPropagation();
                                                            localStorage.setItem('tecnicoSelecionado', JSON.stringify(tec));
                                                            navigate(`/tecnicos/detalhes/${tec.id_tecnico}`);
                                                        }, title: "Ver detalhes do t\u00E9cnico", children: "DETALHES" }) })] }, tec.id_tecnico))) })] }) }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { className: "btn azul", onClick: () => navigate('/usuarios/cadastrar'), children: "CADASTRAR" }), _jsx("button", { className: "btn preto", disabled: tecnicoSelecionado === null, onClick: () => {
                                        const tecnico = tecnicos.find(t => t.id_tecnico === tecnicoSelecionado);
                                        if (tecnico) {
                                            localStorage.setItem('tecnicoSelecionado', JSON.stringify(tecnico));
                                            navigate('/tecnicos/editar');
                                        }
                                    }, children: "ALTERAR" }), _jsx("button", { className: "btn vermelho", disabled: tecnicoSelecionado === null, onClick: abrirModalExclusao, children: "EXCLUIR" }), _jsx("button", { className: "btn vermelho-claro", onClick: () => navigate('/tecnicos/inativos'), children: "INATIVOS" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/'), children: "VOLTAR" }) })] }) }), mostrarModal && tecnicoAtual && (_jsx(ConfirmarExclusao, { nomeCliente: tecnicoAtual.nome, onConfirmar: excluirTecnico, onFechar: () => setMostrarModal(false) }))] }));
};
export default Tecnicos;
