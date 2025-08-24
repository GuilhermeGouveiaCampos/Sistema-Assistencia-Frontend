import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Pesquisa.css";
import "../dashboard/Dashboard.css";
import MenuLateral from "../../components/MenuLateral";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const OrdensInativas = () => {
    const navigate = useNavigate();
    const [ordensInativas, setOrdensInativas] = useState([]);
    const [ordemSelecionada, setOrdemSelecionada] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const carregarOrdens = async () => {
        setCarregando(true);
        try {
            console.log("📡 GET /api/ordens/inativas");
            const { data } = await api.get("/api/ordens/inativas");
            console.log("📦 Inativas recebidas:", data);
            setOrdensInativas(data);
        }
        catch (error) {
            console.error("❌ Erro ao carregar ordens inativas:", error);
        }
        finally {
            setCarregando(false);
        }
    };
    const ativarOrdem = async (id) => {
        try {
            console.log("🛠️ PUT /api/ordens/ativar/" + id);
            await api.put(`/api/ordens/ativar/${id}`);
            setShowModal(false);
            await carregarOrdens();
        }
        catch (error) {
            console.error("❌ Erro ao ativar ordem:", error);
        }
    };
    const confirmarAtivacao = (ordem) => {
        setOrdemSelecionada(ordem);
        setShowModal(true);
    };
    const cancelar = () => {
        setShowModal(false);
        setOrdemSelecionada(null);
    };
    useEffect(() => {
        carregarOrdens();
    }, []);
    return (_jsxs(MenuLateral, { children: [showModal && ordemSelecionada && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR \u2705" }), _jsx("button", { className: "close-btn", onClick: cancelar, children: "X" })] }), _jsx("div", { className: "modal-body", children: _jsxs("p", { children: ["Deseja reativar a ordem do equipamento", " ", _jsxs("strong", { children: [ordemSelecionada.tipo_equipamento || "Equipamento", " ", ordemSelecionada.marca || "", " ", ordemSelecionada.modelo || ""] }), "?"] }) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn azul", onClick: () => ativarOrdem(ordemSelecionada.id_ordem), children: "CONFIRMAR" }), _jsx("button", { className: "btn preto", onClick: cancelar, children: "CANCELAR" })] })] }) })), _jsx("h1", { className: "titulo-clientes", children: "ORDENS INATIVAS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsx("div", { className: "tabela-clientes inativos", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "CLIENTE" }), _jsx("th", { children: "EQUIPAMENTO" }), _jsx("th", { children: "MARCA" }), _jsx("th", { children: "MODELO" }), _jsx("th", { children: "S\u00C9RIE" }), _jsx("th", { children: "MOTIVO" }), _jsx("th", { children: "A\u00C7\u00C3O" })] }) }), _jsx("tbody", { children: carregando ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, children: "Carregando..." }) })) : ordensInativas.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, children: "Nenhuma ordem inativa." }) })) : (ordensInativas.map((ord) => (_jsxs("tr", { children: [_jsx("td", { children: ord.nome_cliente }), _jsx("td", { children: ord.tipo_equipamento || "N/D" }), _jsx("td", { children: ord.marca || "N/D" }), _jsx("td", { children: ord.modelo || "N/D" }), _jsx("td", { children: ord.numero_serie || "N/D" }), _jsx("td", { children: ord.motivo_inativacao || "—" }), _jsx("td", { children: _jsx("button", { className: "btn verde", onClick: () => confirmarAtivacao(ord), children: "ATIVAR" }) })] }, ord.id_ordem)))) })] }) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate("/ordemservico"), children: "VOLTAR" }) })] }) })] }));
};
export default OrdensInativas;
