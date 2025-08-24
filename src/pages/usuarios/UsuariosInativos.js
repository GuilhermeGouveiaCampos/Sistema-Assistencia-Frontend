import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
import MenuLateral from "../../components/MenuLateral";
// ✅ Cliente axios centralizado (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";
const UsuariosInativos = () => {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const [usuariosInativos, setUsuariosInativos] = useState([]);
    const formatarCPF = (valor) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        return apenasNumeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
            .slice(0, 14);
    };
    const buscarUsuariosInativos = async () => {
        try {
            const res = await api.get("/api/usuarios/inativos");
            setUsuariosInativos(res.data);
        }
        catch (error) {
            console.error("Erro ao buscar usuários inativos:", error);
        }
    };
    const ativarUsuario = async (id) => {
        try {
            await api.put(`/api/usuarios/${id}/ativar`);
            buscarUsuariosInativos(); // atualiza a lista
        }
        catch (error) {
            console.error("Erro ao ativar usuário:", error);
        }
    };
    useEffect(() => {
        buscarUsuariosInativos();
    }, []);
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "USU\u00C1RIOS INATIVOS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NOME" }), _jsx("th", { children: "N\u00CDVEL" }), _jsx("th", { children: "CPF" }), _jsx("th", { children: "A\u00C7\u00C3O" })] }) }), _jsx("tbody", { children: usuariosInativos.map((usuario) => (_jsxs("tr", { children: [_jsx("td", { children: usuario.nome }), _jsx("td", { children: usuario.nome_nivel }), _jsx("td", { children: formatarCPF(usuario.cpf) }), _jsx("td", { children: _jsx("button", { className: "btn verde", onClick: () => ativarUsuario(usuario.id_usuario), children: "ATIVAR" }) })] }, usuario.id_usuario))) })] }) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate("/usuarios"), children: "VOLTAR" }) })] }) })] }));
};
export default UsuariosInativos;
