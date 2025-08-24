import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
function mmToHuman(m) {
    if (!m || m <= 0)
        return "0 min";
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h === 0)
        return `${min} min`;
    if (min === 0)
        return `${h} h`;
    return `${h} h ${min} min`;
}
const TecnicosAtribuicoes = () => {
    const [rows, setRows] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const carregar = async () => {
        setCarregando(true);
        try {
            const { data } = await api.get("/api/tecnicos/atribuicoes");
            setRows(data);
        }
        catch (e) {
            console.error("❌ Erro ao buscar atribuições:", e);
        }
        finally {
            setCarregando(false);
        }
    };
    useEffect(() => {
        carregar();
        // auto-refresh a cada 60s, para o tempo “andar”
        const t = setInterval(carregar, 60000);
        return () => clearInterval(t);
    }, []);
    const grupos = useMemo(() => {
        const map = new Map();
        for (const r of rows) {
            const g = map.get(r.id_tecnico) ||
                {
                    id_tecnico: r.id_tecnico,
                    nome_tecnico: r.nome_tecnico,
                    telefone: r.telefone,
                    total_os: 0,
                    total_minutos: 0,
                    ordens: [],
                };
            g.ordens.push(r);
            g.total_os += 1;
            g.total_minutos += r.minutos_total || 0;
            map.set(r.id_tecnico, g);
        }
        return Array.from(map.values());
    }, [rows]);
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "ATRIBUI\u00C7\u00D5ES DOS T\u00C9CNICOS" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: carregando ? (_jsx("p", { children: "Carregando..." })) : grupos.length === 0 ? (_jsx("p", { children: "Nenhuma OS atribu\u00EDda." })) : (grupos.map((g) => (_jsxs("div", { className: "card-atr", children: [_jsxs("div", { className: "card-atr__header", children: [_jsxs("div", { children: [_jsx("strong", { children: g.nome_tecnico }), _jsx("div", { className: "muted", children: g.telefone ? `📞 ${g.telefone}` : "📞 N/D" })] }), _jsxs("div", { className: "card-atr__resume", children: [_jsxs("span", { children: [_jsx("b", { children: g.total_os }), " OS"] }), _jsxs("span", { children: ["\u23F1 ", mmToHuman(g.total_minutos)] })] })] }), _jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("th", { children: "Cliente" }), _jsx("th", { children: "Equipamento" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Criada em" }), _jsx("th", { children: "Tempo (acumulado)" })] }) }), _jsx("tbody", { children: g.ordens.map((o) => (_jsxs("tr", { children: [_jsx("td", { children: o.id_os }), _jsx("td", { children: o.nome_cliente }), _jsxs("td", { children: [(o.tipo || "N/D"), " ", o.marca || "", " ", o.modelo || "", " \u00B7", " ", o.numero_serie || "s/ série"] }), _jsx("td", { children: o.status_os }), _jsx("td", { children: new Date(o.data_criacao).toLocaleDateString() }), _jsx("td", { children: _jsx("b", { children: mmToHuman(o.minutos_total || 0) }) })] }, o.id_os))) })] }) })] }, g.id_tecnico)))) }) })] }));
};
export default TecnicosAtribuicoes;
