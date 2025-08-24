import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Alterar.css";
import "../Css/Cadastrar.css";
import "../Css/Pesquisa.css";
// ✅ cliente axios central
import api from "../../services/api";
const Clientes = () => {
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id");
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [nomeFiltro, setNomeFiltro] = useState("");
    const [cpfFiltro, setCpfFiltro] = useState("");
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const formatarCPF = (valor) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        return apenasNumeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
            .slice(0, 14);
    };
    const consultarClientes = async () => {
        try {
            const { data } = await api.get("/api/clientes", {
                params: {
                    nome: nomeFiltro?.trim() || undefined,
                    cpf: cpfFiltro?.trim() || undefined,
                },
            });
            // 🔒 Normaliza SEMPRE para array (independente do formato do backend)
            const lista = Array.isArray(data)
                ? data
                : Array.isArray(data?.rows)
                    ? data.rows
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];
            setClientes(lista);
            setClienteSelecionado(null);
        }
        catch (error) {
            console.error("❌ Erro ao consultar clientes:", error);
            setClientes([]); // garante array mesmo no erro
            setClienteSelecionado(null);
        }
    };
    useEffect(() => {
        consultarClientes();
    }, []);
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            consultarClientes();
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [nomeFiltro, cpfFiltro]);
    const selecionarCliente = (cli) => {
        if (!cli || !cli.id_cliente) {
            console.warn("Cliente inválido:", cli);
            return;
        }
        setClienteSelecionado(cli.id_cliente);
    };
    const abrirModalExclusao = () => {
        if (clienteSelecionado !== null)
            setMostrarModal(true);
    };
    const excluirCliente = async () => {
        try {
            if (clienteSelecionado == null)
                return;
            await api.delete(`/api/clientes/${clienteSelecionado}`);
            setMostrarModal(false);
            consultarClientes();
        }
        catch (error) {
            console.error("Erro ao excluir cliente:", error);
        }
    };
    const clienteAtual = Array.isArray(clientes)
        ? clientes.find((c) => c.id_cliente === clienteSelecionado)
        : undefined;
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "CLIENTES" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsxs("div", { className: "filtros-clientes", children: [_jsx("input", { type: "text", placeholder: "NOME COMPLETO", value: nomeFiltro, onChange: (e) => setNomeFiltro(e.target.value) }), _jsx("input", { type: "text", placeholder: "CPF", value: cpfFiltro, onChange: (e) => setCpfFiltro(formatarCPF(e.target.value)) }), _jsx("button", { className: "btn roxo-claro", onClick: consultarClientes, children: "CONSULTAR" })] }), _jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NOME" }), _jsx("th", { children: "CPF" }), _jsx("th", { children: _jsxs("div", { style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                        }, children: [_jsx("span", { children: "TELEFONE" }), clienteSelecionado !== null && (_jsx("button", { onClick: () => setClienteSelecionado(null), style: {
                                                                    marginLeft: "0.5rem",
                                                                    padding: "0.2rem 0.6rem",
                                                                    fontSize: "0.75rem",
                                                                    backgroundColor: "#666",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "4px",
                                                                    cursor: "pointer",
                                                                }, children: "DESMARCAR" }))] }) })] }) }), _jsx("tbody", { children: (Array.isArray(clientes) ? clientes : []).map((cli) => (_jsxs("tr", { onClick: () => selecionarCliente(cli), className: clienteSelecionado === cli.id_cliente ? "linha-selecionada" : "", style: { cursor: "pointer" }, children: [_jsx("td", { children: cli.nome }), _jsx("td", { children: cli.cpf }), _jsx("td", { children: cli.telefone })] }, cli.id_cliente))) })] }) }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { className: "btn azul", onClick: () => navigate("/clientes/cadastrar"), children: "CADASTRAR" }), _jsx("button", { className: "btn preto", disabled: clienteSelecionado === null, onClick: () => {
                                        if (!Array.isArray(clientes))
                                            return;
                                        const cliente = clientes.find((c) => c.id_cliente === clienteSelecionado);
                                        if (cliente) {
                                            localStorage.setItem("clienteSelecionado", JSON.stringify(cliente));
                                            navigate("/clientes/editar");
                                        }
                                    }, children: "ALTERAR" }), _jsx("button", { className: "btn vermelho", disabled: clienteSelecionado === null, onClick: abrirModalExclusao, children: "EXCLUIR" }), _jsx("button", { className: "btn vermelho-claro", onClick: () => navigate("/clientes/inativos"), children: "INATIVOS" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate("/"), children: "VOLTAR" }) })] }) }), mostrarModal && clienteAtual && (_jsx(ConfirmarExclusao, { nomeCliente: clienteAtual.nome, onConfirmar: excluirCliente, onFechar: () => setMostrarModal(false) }))] }));
};
export default Clientes;
