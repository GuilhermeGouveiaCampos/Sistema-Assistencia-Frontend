import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Cadastrar.css";
import "../Css/Alterar.css";
import "../Css/Pesquisa.css";
import Select from 'react-select';
// ✅ cliente axios central
import api from '../../services/api';
const CadastrarEquipamento = () => {
    const navigate = useNavigate();
    const [selectedClienteId, setSelectedClienteId] = useState("");
    const [selectedEquipamentoId, setSelectedEquipamentoId] = useState("");
    const [clientes, setClientes] = useState([]);
    const [formulario, setFormulario] = useState({
        id_cliente: "",
        tipo: "",
        marca: "",
        modelo: "",
        numero_serie: "",
    });
    const [cpfCliente, setCpfCliente] = useState("");
    const [imagens, setImagens] = useState([]);
    const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
    const [equipamentos, setEquipamentos] = useState([]);
    const optionsClientes = clientes.map(cliente => ({
        value: cliente.id_cliente,
        label: cliente.nome
    }));
    const removerImagem = (index) => {
        setImagens(prev => prev.filter((_, i) => i !== index));
    };
    useEffect(() => {
        const carregarClientes = async () => {
            try {
                const response = await api.get("/api/clientes");
                setClientes(response.data);
            }
            catch (error) {
                console.error("Erro ao carregar clientes:", error);
            }
        };
        carregarClientes();
    }, []);
    useEffect(() => {
        const carregarEquipamentos = async () => {
            try {
                const response = await api.get("/api/equipamentos");
                setEquipamentos(response.data);
            }
            catch (error) {
                console.error("Erro ao carregar equipamentos:", error);
            }
        };
        carregarEquipamentos();
    }, []);
    useEffect(() => {
        const dadosSalvos = localStorage.getItem("novoEquipamento");
        if (dadosSalvos) {
            const { id_cliente, id_equipamento } = JSON.parse(dadosSalvos);
            setSelectedClienteId(id_cliente);
            setSelectedEquipamentoId(id_equipamento);
            localStorage.removeItem("novoEquipamento");
        }
    }, []);
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "id_cliente") {
            const clienteSelecionado = clientes.find(c => c.id_cliente === parseInt(value));
            setCpfCliente(clienteSelecionado ? clienteSelecionado.cpf : "");
        }
        setFormulario({ ...formulario, [name]: value });
    };
    const handleImagemChange = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).slice(0, 20);
            setImagens(prev => [...prev, ...selectedFiles]);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dados = new FormData();
        dados.append("id_cliente", formulario.id_cliente);
        dados.append("tipo", formulario.tipo);
        dados.append("marca", formulario.marca);
        dados.append("modelo", formulario.modelo);
        dados.append("numero_serie", formulario.numero_serie);
        dados.append("status", "ativo");
        imagens.forEach((imagem) => {
            dados.append("imagens", imagem);
        });
        try {
            const response = await api.post("/api/equipamentos", dados, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.status === 201 || response.status === 200) {
                setMostrarModalSucesso(true);
                if (response.data.id_equipamento) {
                    localStorage.setItem("novoEquipamento", JSON.stringify({
                        id_cliente: formulario.id_cliente,
                        id_equipamento: response.data.id_equipamento
                    }));
                }
            }
            else {
                alert("Algo deu errado. Verifique o console.");
            }
        }
        catch (error) {
            console.error("❌ Erro ao cadastrar equipamento:", error);
            alert("Erro ao cadastrar equipamento. Veja o console.");
        }
    };
    return (_jsxs(MenuLateral, { children: [mostrarModalSucesso && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsx("h2", { children: "\u2705 Equipamento cadastrado com sucesso!" }), _jsx("p", { children: "Deseja criar uma nova Ordem de Servi\u00E7o para este equipamento?" }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: '15px' }, children: [_jsx("button", { className: "btn azul", onClick: () => {
                                        setMostrarModalSucesso(false);
                                        navigate("/ordemservico/cadastrar");
                                    }, children: "SIM" }), _jsx("button", { className: "btn preto", onClick: () => {
                                        setMostrarModalSucesso(false);
                                        navigate("/equipamentos");
                                    }, children: "N\u00C3O" })] })] }) })), _jsx("h1", { className: "titulo-clientes", children: "CADASTRAR EQUIPAMENTO" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, encType: "multipart/form-data", children: [_jsxs("div", { className: "cliente-select-group", children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 CLIENTE" }), _jsx(Select, { options: optionsClientes, onChange: (optionSelecionada) => {
                                                    const id_cliente = optionSelecionada?.value.toString() || "";
                                                    const cliente = clientes.find(c => c.id_cliente === Number(id_cliente));
                                                    setFormulario({ ...formulario, id_cliente });
                                                    setCpfCliente(cliente?.cpf || "");
                                                }, placeholder: "Digite o nome do cliente", className: "react-select-container", classNamePrefix: "react-select", styles: {
                                                    control: (base) => ({
                                                        ...base,
                                                        backgroundColor: "#000",
                                                        borderColor: "#444",
                                                        color: "#fff",
                                                        borderRadius: "8px",
                                                        boxShadow: "none",
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: "#fff",
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        color: "#ccc",
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: "#1e1e1e",
                                                        color: "#fff",
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isSelected
                                                            ? "#007bff"
                                                            : state.isFocused
                                                                ? "#333"
                                                                : "#1e1e1e",
                                                        color: "#fff",
                                                        cursor: "pointer",
                                                    }),
                                                } })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC4 CPF DO CLIENTE" }), _jsx("div", { className: "cpf-disabled-wrapper", children: _jsx("input", { type: "text", value: cpfCliente, disabled: true, className: "input-estilizado" }) })] })] }), _jsxs("label", { children: [_jsx("span", { children: "\u2699\uFE0F TIPO DO EQUIPAMENTO" }), _jsx("input", { type: "text", name: "tipo", placeholder: "Ex: Liquidificador", value: formulario.tipo, onChange: handleChange, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83C\uDFF7\uFE0F MARCA" }), _jsx("input", { type: "text", name: "marca", placeholder: "Ex: Mondial", value: formulario.marca, onChange: handleChange, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCE6 MODELO" }), _jsx("input", { type: "text", name: "modelo", placeholder: "Ex: Power 600W", value: formulario.modelo, onChange: handleChange, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD22 N\u00DAMERO DE S\u00C9RIE" }), _jsx("input", { type: "text", name: "numero_serie", placeholder: "Ex: AB123456", value: formulario.numero_serie, onChange: handleChange, required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCF7 FOTOS DO EQUIPAMENTO" }), _jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: handleImagemChange }), imagens.length > 0 && (_jsx("div", { className: "preview-imagens", children: imagens.map((img, index) => (_jsxs("div", { className: "preview-item", children: [_jsx("img", { src: URL.createObjectURL(img), alt: `Prévia ${index + 1}` }), _jsx("button", { type: "button", onClick: () => removerImagem(index), className: "btn-remover", children: "\u274C" })] }, index))) }))] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => navigate("/equipamentos"), children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", type: "button", onClick: () => navigate("/equipamentos"), children: "VOLTAR" }) })] }) }) })] }));
};
export default CadastrarEquipamento;
