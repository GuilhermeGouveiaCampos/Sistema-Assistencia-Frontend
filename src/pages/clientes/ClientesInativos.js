import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
// ✅ cliente axios central
import api from '../../services/api';
const ClientesInativos = () => {
    const navigate = useNavigate();
    const [clientesInativos, setClientesInativos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const carregarInativos = async () => {
        try {
            const { data } = await api.get("/api/clientes/inativos");
            // 🔒 Normaliza para array SEMPRE
            const lista = Array.isArray(data)
                ? data
                : Array.isArray(data?.rows)
                    ? data.rows
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];
            setClientesInativos(lista);
        }
        catch (error) {
            console.error("Erro ao buscar clientes inativos:", error);
            setClientesInativos([]); // evita crash no map
        }
    };
    const ativarCliente = async (id) => {
        try {
            await api.put(`/api/clientes/ativar/${id}`);
            carregarInativos();
            setShowModal(false);
        }
        catch (error) {
            console.error("Erro ao ativar cliente:", error);
        }
    };
    const confirmarAtivacao = (cliente) => {
        setClienteSelecionado(cliente);
        setShowModal(true);
    };
    const cancelar = () => {
        setClienteSelecionado(null);
        setShowModal(false);
    };
    useEffect(() => {
        carregarInativos();
    }, []);
    return (_jsxs(MenuLateral, { children: [showModal && clienteSelecionado && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR \u2705" }), _jsx("button", { className: "close-btn", onClick: cancelar, children: "X" })] }), _jsx("div", { className: "modal-body", children: _jsxs("p", { children: ["Deseja realmente reativar o cliente", " ", _jsx("strong", { children: clienteSelecionado.nome }), "?"] }) }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { className: "btn azul", onClick: () => ativarCliente(clienteSelecionado.id_cliente), children: "CONFIRMAR" }), _jsx("button", { className: "btn preto", onClick: cancelar, children: "CANCELAR" })] })] }) })), _jsx("h1", { className: "titulo-clientes", children: "CLIENTES INATIVOS" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsx("div", { className: "tabela-clientes inativos", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NOME" }), _jsx("th", { children: "CPF" }), _jsx("th", { children: "MOTIVO" }), _jsx("th", { children: "A\u00C7\u00C3O" })] }) }), _jsx("tbody", { children: clientesInativos.length > 0 ? (clientesInativos.map((cli) => (_jsxs("tr", { children: [_jsx("td", { children: cli.nome }), _jsx("td", { children: cli.cpf }), _jsx("td", { children: cli.motivo_inativacao }), _jsx("td", { children: _jsx("button", { className: "btn verde", onClick: () => confirmarAtivacao(cli), children: "ATIVAR" }) })] }, cli.id_cliente)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 4, style: { textAlign: "center", padding: 12 }, children: "Nenhum cliente inativo encontrado." }) })) })] }) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/clientes'), children: "VOLTAR" }) })] }) })] }));
};
export default ClientesInativos;
