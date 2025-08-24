import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
import MenuLateral from "../../components/MenuLateral";
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const TecnicosInativos = () => {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const [tecnicosInativos, setTecnicosInativos] = useState([]);
    const formatarCPF = (valor) => {
        if (!valor)
            return "";
        const apenasNumeros = valor.replace(/\D/g, "");
        return apenasNumeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
            .slice(0, 14);
    };
    const formatarTelefone = (valor) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        return apenasNumeros
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .slice(0, 15);
    };
    const buscarInativos = async () => {
        try {
            const res = await api.get("/api/tecnicos/inativos");
            setTecnicosInativos(res.data);
        }
        catch (error) {
            console.error("Erro ao buscar técnicos inativos:", error);
        }
    };
    const ativarTecnico = async (id) => {
        try {
            await api.put(`/api/tecnicos/ativar/${id}`);
            buscarInativos(); // atualiza a lista
        }
        catch (error) {
            console.error("Erro ao ativar técnico:", error);
        }
    };
    useEffect(() => {
        buscarInativos();
    }, []);
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "T\u00C9CNICOS INATIVOS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NOME" }), _jsx("th", { children: "CPF" }), _jsx("th", { children: "TELEFONE" }), _jsx("th", { children: "A\u00C7\u00C3O" })] }) }), _jsx("tbody", { children: tecnicosInativos.map((tec) => (_jsxs("tr", { children: [_jsx("td", { children: tec.nome }), _jsx("td", { children: formatarCPF(tec.cpf) }), _jsx("td", { children: formatarTelefone(tec.telefone) }), _jsx("td", { children: _jsx("button", { className: "btn verde", onClick: () => ativarTecnico(tec.id_tecnico), children: "ATIVAR" }) })] }, tec.id_tecnico))) })] }) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate("/tecnicos"), children: "VOLTAR" }) })] }) })] }));
};
export default TecnicosInativos;
