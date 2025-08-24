import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';
import MenuLateral from '../../components/MenuLateral'; // ✅ novo import
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const LocaisInativos = () => {
    const navigate = useNavigate();
    const [locaisInativos, setLocaisInativos] = useState([]);
    const buscarInativos = async () => {
        try {
            const res = await api.get('/api/locais/inativos');
            setLocaisInativos(res.data);
        }
        catch (error) {
            console.error('Erro ao buscar locais inativos:', error);
        }
    };
    const ativarLocal = async (id) => {
        try {
            await api.put(`/api/locais/ativar/${id}`);
            buscarInativos(); // atualiza a lista
        }
        catch (error) {
            console.error('Erro ao ativar local:', error);
        }
    };
    useEffect(() => {
        buscarInativos();
    }, []);
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "LOCAIS INATIVOS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID SCANNER" }), _jsx("th", { children: "LOCAL INSTALADO" }), _jsx("th", { children: "MOTIVO" }), _jsx("th", { children: "A\u00C7\u00C3O" })] }) }), _jsx("tbody", { children: locaisInativos.map((loc) => (_jsxs("tr", { children: [_jsx("td", { children: loc.id_scanner }), _jsx("td", { children: loc.local_instalado }), _jsx("td", { children: loc.motivo_inativacao }), _jsx("td", { children: _jsx("button", { className: "btn verde", onClick: () => ativarLocal(loc.id_scanner), children: "ATIVAR" }) })] }, loc.id_scanner))) })] }) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/rfid'), children: "VOLTAR" }) })] }) })] }));
};
export default LocaisInativos;
