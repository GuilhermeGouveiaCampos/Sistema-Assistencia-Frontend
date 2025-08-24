import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import MenuLateral from '../../components/MenuLateral';
import '../Css/Pesquisa.css';
// ✅ cliente axios central
import api from '../../services/api';
const Equipamentos = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [equipamentos, setEquipamentos] = useState([]);
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [nomeClienteFiltro, setNomeClienteFiltro] = useState("");
    const [modeloFiltro, setModeloFiltro] = useState("");
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const consultarEquipamentos = async () => {
        try {
            const response = await api.get("/api/equipamentos", {
                params: {
                    tipo: tipoFiltro,
                    nome_cliente: nomeClienteFiltro,
                    modelo: modeloFiltro,
                },
            });
            setEquipamentos(response.data);
            setEquipamentoSelecionado(null);
        }
        catch (error) {
            console.error("Erro ao consultar equipamentos:", error);
        }
    };
    useEffect(() => {
        consultarEquipamentos();
    }, []);
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            consultarEquipamentos();
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [tipoFiltro, nomeClienteFiltro, modeloFiltro]);
    const selecionarEquipamento = (equip) => {
        if (!equip?.id_equipamento) {
            console.warn("⚠️ Equipamento inválido:", equip);
            return;
        }
        setEquipamentoSelecionado(equip.id_equipamento);
    };
    const abrirModalExclusao = () => {
        if (equipamentoSelecionado !== null)
            setMostrarModal(true);
    };
    const excluirEquipamento = async () => {
        if (equipamentoSelecionado === null)
            return;
        try {
            const id = equipamentoSelecionado;
            setMostrarModal(false);
            setEquipamentos(prev => prev.filter(equip => equip.id_equipamento !== id));
            setEquipamentoSelecionado(null);
            await api.delete(`/api/equipamentos/${id}`);
        }
        catch (error) {
            console.error("❌ Erro ao excluir equipamento:", error);
        }
    };
    const equipamentoAtual = equipamentos.find(e => e.id_equipamento === equipamentoSelecionado);
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "EQUIPAMENTOS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsxs("div", { className: "filtros-clientes", children: [_jsx("input", { type: "text", placeholder: "TIPO", value: tipoFiltro, onChange: (e) => setTipoFiltro(e.target.value) }), _jsx("input", { type: "text", placeholder: "NOME DO CLIENTE", value: nomeClienteFiltro, onChange: (e) => setNomeClienteFiltro(e.target.value) }), _jsx("input", { type: "text", placeholder: "MODELO", value: modeloFiltro, onChange: (e) => setModeloFiltro(e.target.value) }), _jsx("button", { className: "btn roxo-claro", onClick: consultarEquipamentos, children: "CONSULTAR" })] }), _jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "CLIENTE" }), _jsx("th", { children: "TIPO" }), _jsx("th", { children: "MARCA" }), _jsx("th", { children: "MODELO" }), _jsx("th", { children: "N\u00BA S\u00C9RIE" }), _jsx("th", { children: "A\u00C7\u00D5ES" })] }) }), _jsx("tbody", { children: equipamentos.map((e) => (_jsxs("tr", { onClick: () => selecionarEquipamento(e), className: equipamentoSelecionado === e.id_equipamento ? 'linha-selecionada' : '', style: { cursor: 'pointer' }, children: [_jsx("td", { children: e.nome_cliente }), _jsx("td", { children: e.tipo }), _jsx("td", { children: e.marca }), _jsx("td", { children: e.modelo }), _jsx("td", { children: e.numero_serie }), _jsx("td", { children: _jsx("button", { className: "btn detalhes", onClick: (ev) => {
                                                            ev.stopPropagation();
                                                            navigate(`/equipamentos/detalhes/${e.id_equipamento}`);
                                                        }, children: "DETALHES" }) })] }, e.id_equipamento))) })] }) }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { className: "btn azul", onClick: () => navigate('/equipamentos/cadastrar'), children: "CADASTRAR" }), _jsx("button", { className: "btn preto", disabled: equipamentoSelecionado === null, onClick: () => {
                                        const eq = equipamentos.find(e => e.id_equipamento === equipamentoSelecionado);
                                        if (eq) {
                                            localStorage.setItem('equipamentoSelecionado', JSON.stringify(eq));
                                            navigate('/equipamentos/editar');
                                        }
                                    }, children: "ALTERAR" }), _jsx("button", { className: "btn vermelho", disabled: equipamentoSelecionado === null, onClick: abrirModalExclusao, children: "EXCLUIR" }), _jsx("button", { className: "btn vermelho-claro", onClick: () => navigate('/equipamentos/inativos'), children: "INATIVOS" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/'), children: "VOLTAR" }) })] }) }), mostrarModal && equipamentoAtual && (_jsx(ConfirmarExclusao, { nomeCliente: `${equipamentoAtual.nome_cliente} - ${equipamentoAtual.tipo} - ${equipamentoAtual.numero_serie}`, onConfirmar: excluirEquipamento, onFechar: () => setMostrarModal(false) }))] }));
};
export default Equipamentos;
