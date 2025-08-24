import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
import MenuLateral from "../../components/MenuLateral";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const OrdensServico = () => {
    const navigate = useNavigate();
    const [ordens, setOrdens] = useState([]);
    const [clienteFiltro, setClienteFiltro] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");
    const [ordemSelecionada, setOrdemSelecionada] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const consultarOrdens = async (signal) => {
        try {
            setCarregando(true);
            // Só manda params quando tem valor (evita "" atrapalhar o back)
            const p = {};
            const nomeTrim = clienteFiltro.trim();
            const statusTrim = statusFiltro.trim();
            if (nomeTrim)
                p.nome_cliente = nomeTrim;
            if (statusTrim)
                p.status = statusTrim;
            const resp = await api.get("/api/ordens-consulta", {
                params: p,
                signal,
            });
            setOrdens(resp.data || []);
            setOrdemSelecionada(null);
        }
        catch (err) {
            // se foi cancelada, só ignoramos
            if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
                console.error("Erro ao consultar ordens de serviço:", err);
            }
        }
        finally {
            setCarregando(false);
        }
    };
    // Carrega de cara
    useEffect(() => {
        const controller = new AbortController();
        consultarOrdens(controller.signal);
        return () => controller.abort();
    }, []);
    // Busca automática enquanto digita (debounce + cancelamento da anterior)
    useEffect(() => {
        const controller = new AbortController();
        const t = setTimeout(() => consultarOrdens(controller.signal), 350);
        return () => {
            controller.abort();
            clearTimeout(t);
        };
    }, [clienteFiltro, statusFiltro]);
    const selecionarOrdem = (ordem) => {
        if (!ordem?.id_ordem)
            return;
        setOrdemSelecionada(ordem.id_ordem);
        localStorage.setItem("ordemSelecionada", JSON.stringify(ordem));
    };
    const excluirOrdem = async () => {
        if (ordemSelecionada == null)
            return;
        try {
            await api.delete(`/api/ordens/${ordemSelecionada}`);
            setOrdens((prev) => prev.filter((o) => o.id_ordem !== ordemSelecionada));
            setOrdemSelecionada(null);
            setMostrarModal(false);
        }
        catch (error) {
            console.error("Erro ao excluir ordem:", error);
        }
    };
    const ordemAtual = ordens.find((o) => o.id_ordem === ordemSelecionada);
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "ORDENS DE SERVI\u00C7O" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsxs("div", { className: "filtros-clientes", children: [_jsx("input", { type: "text", placeholder: "NOME DO CLIENTE", value: clienteFiltro, onChange: (e) => setClienteFiltro(e.target.value), autoComplete: "off" }), _jsx("input", { type: "text", placeholder: "STATUS", value: statusFiltro, onChange: (e) => setStatusFiltro(e.target.value), autoComplete: "off" }), _jsx("button", { className: "btn roxo-claro", onClick: () => consultarOrdens(), children: "CONSULTAR" })] }), _jsxs("div", { className: "tabela-clientes", children: [carregando && _jsx("p", { style: { marginBottom: 8 }, children: "Carregando\u2026" }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "CLIENTE" }), _jsx("th", { children: "EQUIPAMENTO" }), _jsx("th", { children: "MARCA" }), _jsx("th", { children: "MODELO" }), _jsx("th", { children: "N\u00BA S\u00C9RIE" }), _jsx("th", { children: "DATA ENTRADA" }), _jsx("th", { children: "STATUS" }), _jsx("th", { children: "A\u00C7\u00D5ES" })] }) }), _jsxs("tbody", { children: [ordens.map((o, index) => (_jsxs("tr", { onClick: () => selecionarOrdem(o), className: ordemSelecionada === o.id_ordem ? "linha-selecionada" : "", style: { cursor: "pointer" }, children: [_jsx("td", { children: o.nome_cliente }), _jsx("td", { children: o.tipo_equipamento || "N/D" }), _jsx("td", { children: o.marca || "N/D" }), _jsx("td", { children: o.modelo || "N/D" }), _jsx("td", { children: o.numero_serie || "N/D" }), _jsx("td", { children: o.data_entrada }), _jsx("td", { children: o.status }), _jsx("td", { children: _jsx("button", { className: "btn detalhes", onClick: (ev) => {
                                                                    ev.stopPropagation();
                                                                    navigate(`/ordemservico/detalhes/${o.id_ordem}`);
                                                                }, children: "DETALHES" }) })] }, o.id_ordem ?? `ordem-${index}`))), !carregando && ordens.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 8, style: { textAlign: "center", padding: 12 }, children: "Nenhuma ordem encontrada." }) }))] })] })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { className: "btn azul", onClick: () => navigate("/ordemservico/cadastrar"), children: "NOVA ORDEM DE SERVI\u00C7O" }), _jsx("button", { className: "btn preto", disabled: ordemSelecionada === null, onClick: () => {
                                        const ordem = ordens.find((o) => o.id_ordem === ordemSelecionada);
                                        if (ordem) {
                                            localStorage.setItem("ordemSelecionada", JSON.stringify(ordem));
                                            navigate("/ordemservico/alterar");
                                        }
                                    }, children: "ALTERAR" }), _jsx("button", { className: "btn vermelho", disabled: ordemSelecionada === null, onClick: () => setMostrarModal(true), children: "EXCLUIR" }), _jsx("button", { className: "btn vermelho-claro", onClick: () => navigate("/ordemservico/inativos"), children: "INATIVAS" })] })] }) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate("/"), children: "VOLTAR" }) }), mostrarModal && ordemAtual && (_jsx(ConfirmarExclusao, { nomeCliente: `${ordemAtual.nome_cliente} - ${ordemAtual.tipo_equipamento}`, onConfirmar: excluirOrdem, onFechar: () => setMostrarModal(false) }))] }));
};
export default OrdensServico;
