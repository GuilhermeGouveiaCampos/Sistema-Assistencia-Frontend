import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
// ✅ cliente axios central
import api from "../../services/api";
const EquipamentosInativos = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [equipamentos, setEquipamentos] = useState([]);
    const carregarEquipamentos = async () => {
        try {
            const response = await api.get("/api/equipamentos/inativos");
            setEquipamentos(response.data);
        }
        catch (error) {
            console.error("Erro ao buscar equipamentos inativos:", error);
        }
    };
    useEffect(() => {
        carregarEquipamentos();
    }, []);
    const ativarEquipamento = async (id) => {
        try {
            await api.put(`/api/equipamentos/ativar/${id}`);
            setEquipamentos(prev => prev.filter(eq => eq.id_equipamento !== id));
        }
        catch (error) {
            console.error("Erro ao reativar equipamento:", error);
        }
    };
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "EQUIPAMENTOS INATIVOS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "TIPO" }), _jsx("th", { children: "MARCA" }), _jsx("th", { children: "MODELO" }), _jsx("th", { children: "N\u00BA S\u00C9RIE" }), _jsx("th", { children: "ESTADO" }), _jsx("th", { children: "A\u00C7\u00C3O" })] }) }), _jsx("tbody", { children: equipamentos.map((eq) => (_jsxs("tr", { children: [_jsx("td", { children: eq.tipo }), _jsx("td", { children: eq.marca }), _jsx("td", { children: eq.modelo }), _jsx("td", { children: eq.numero_serie }), _jsx("td", { children: eq.estado }), _jsx("td", { children: _jsx("button", { className: "btn verde", onClick: () => ativarEquipamento(eq.id_equipamento), children: "ATIVAR" }) })] }, eq.id_equipamento))) })] }) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate("/equipamentos"), children: "VOLTAR" }) })] }) })] }));
};
export default EquipamentosInativos;
