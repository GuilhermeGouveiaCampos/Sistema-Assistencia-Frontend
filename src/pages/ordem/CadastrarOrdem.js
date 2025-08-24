import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Dashboard.css';
import '../Css/Cadastrar.css';
import ModalSucesso from '../../components/ModalSucesso';
import MenuLateral from '../../components/MenuLateral';
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const CadastrarOrdem = () => {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id") || "";
    const [clientes, setClientes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [locais, setLocais] = useState([]);
    const [statusInterno, setStatusInterno] = useState('');
    const [idCliente, setIdCliente] = useState('');
    const [idTecnico, setIdTecnico] = useState('');
    const [idLocal, setIdLocal] = useState('');
    const [descricaoProblema, setDescricaoProblema] = useState('');
    const [dataCriacao, setDataCriacao] = useState(() => {
        const hoje = new Date();
        return hoje.toISOString().split('T')[0]; // ✅ formato yyyy-MM-dd
    });
    const [showDropdownEquip, setShowDropdownEquip] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [showDropdownTecnico, setShowDropdownTecnico] = useState(false);
    const [selectedTecnicoId, setSelectedTecnicoId] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);
    const [idEquipamento, setIdEquipamento] = useState('');
    const [selectedEquipamentoId, setSelectedEquipamentoId] = useState(null);
    const [statusLista, setStatusLista] = useState([]);
    const statusDescricao = statusLista.find(s => s.id_status === Number(statusInterno))?.descricao || '';
    const [showTecnicoAutoModal, setShowTecnicoAutoModal] = useState(false);
    useEffect(() => {
        // Carregar clientes
        api.get('/api/ordens/clientes')
            .then(res => setClientes(res.data))
            .catch(err => console.error("Erro ao buscar clientes:", err));
        // Carregar técnicos
        api.get('/api/tecnicos')
            .then(res => setTecnicos(res.data))
            .catch(err => console.error("Erro ao buscar técnicos:", err));
        // Carregar status da OS
        api.get('/api/status')
            .then(res => {
            setStatusLista(res.data);
            const statusRecebido = res.data.find((s) => s.descricao.toLowerCase().includes("recebido"));
            if (statusRecebido) {
                setStatusInterno(statusRecebido.id_status);
            }
        })
            .catch(err => console.error("Erro ao buscar status:", err));
        // Buscar locais
        api.get('/api/locais')
            .then(res => {
            setLocais(res.data);
            const recepcao = res.data.find((loc) => loc.local_instalado.toLowerCase().includes("recepção"));
            if (recepcao) {
                setIdLocal(recepcao.id_scanner);
            }
        })
            .catch(err => console.error("Erro ao buscar locais:", err));
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/ordens', {
                id_cliente: selectedClienteId,
                id_tecnico: selectedTecnicoId,
                id_equipamento: selectedEquipamentoId,
                id_local: idLocal,
                id_status_os: Number(statusInterno),
                descricao_problema: descricaoProblema,
                data_criacao: dataCriacao
            });
            console.log("🟢 RESPOSTA:", response.status, response.data);
            console.log("🔍 STATUS:", response.status);
            console.log("🔍 DADOS RETORNADOS:", response.data);
            if (response.status === 201) {
                setShowSuccessModal(true);
                console.log("⚡ setShowSuccessModal(true) foi chamado!");
            }
        }
        catch (error) {
            console.error("❌ Erro ao cadastrar OS:", error);
            alert("Erro ao cadastrar ordem de serviço.");
        }
    };
    const handleEquipamentoChange = async (e) => {
        const equipamentoId = Number(e.target.value);
        setSelectedEquipamentoId(equipamentoId);
        // 🟢 Encontrar o equipamento selecionado
        const equipamentoSelecionado = equipamentos.find(eq => eq.id_equipamento === equipamentoId);
        if (!equipamentoSelecionado) {
            alert("Equipamento não encontrado.");
            return;
        }
        const tipoEquipamento = equipamentoSelecionado.tipo;
        try {
            const response = await api.get(`/api/tecnicos/menos-carregados/${tipoEquipamento}`);
            const tecnico = response.data;
            setIdTecnico(`${tecnico.nome} - AUTO`);
            setSelectedTecnicoId(tecnico.id_tecnico);
            // ✅ Mostrar toast de sucesso
            const toast = document.createElement('div');
            toast.textContent = `👨‍🔧 Técnico ${tecnico.nome} atribuído automaticamente`;
            toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3500);
        }
        catch (error) {
            console.error("Erro ao buscar técnico automaticamente:", error);
            // 🟠 Mostrar toast de aviso se não houver técnico compatível
            const aviso = document.createElement('div');
            aviso.textContent = "⚠️ Nenhum técnico disponível com essa especialização. Escolha manualmente.";
            aviso.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
            document.body.appendChild(aviso);
            setTimeout(() => aviso.remove(), 3500);
        }
    };
    const handleClienteChange = async (e) => {
        const clienteId = Number(e.target.value);
        setSelectedClienteId(clienteId);
        setIdCliente(clienteId.toString()); // ✅ sincroniza o value
        try {
            const response = await api.get(`/api/equipamentos/por-cliente/${clienteId}`);
            setEquipamentos(response.data);
        }
        catch (error) {
            console.error("Erro ao buscar equipamentos por cliente:", error);
        }
    };
    function formatarCPF(cpf) {
        return cpf
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .substring(0, 14);
    }
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "CADASTRAR ORDEM DE SERVI\u00C7O" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 CLIENTE" }), _jsxs("select", { value: selectedClienteId ?? '', onChange: handleClienteChange, children: [_jsx("option", { value: "", children: "Selecione o cliente" }), clientes.map(cli => (_jsxs("option", { value: cli.id_cliente, children: [cli.nome, " - ", formatarCPF(cli.cpf)] }, cli.id_cliente)))] })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD27 EQUIPAMENTO" }), _jsxs("select", { value: selectedEquipamentoId ?? '', onChange: handleEquipamentoChange, required: true, children: [_jsx("option", { value: "", children: "Selecione o equipamento" }), equipamentos.map(eq => (_jsxs("option", { value: eq.id_equipamento, children: [eq.tipo, " - ", eq.marca, " - ", eq.numero_serie] }, eq.id_equipamento)))] })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDD DESCRI\u00C7\u00C3O DO PROBLEMA" }), _jsx("textarea", { value: descricaoProblema, onChange: (e) => setDescricaoProblema(e.target.value), rows: 4, placeholder: "Informe o que o cliente relatou sobre o problema", style: {
                                            backgroundColor: "#000",
                                            color: "#fff",
                                            width: "100%",
                                            padding: "8px",
                                            border: "1px solid #555",
                                            borderRadius: "4px",
                                            resize: "vertical"
                                        }, required: true })] }), _jsxs("label", { className: "autocomplete-container", children: [_jsx("span", { children: "\uD83D\uDC68\u200D\uD83D\uDD27 T\u00C9CNICO" }), _jsx("input", { type: "text", className: "input-pesquisavel", placeholder: "Busque por nome ou CPF", value: idTecnico, onChange: (e) => {
                                            const input = e.target.value;
                                            const cpfFormatado = formatarCPF(input);
                                            setIdTecnico(cpfFormatado);
                                            setShowDropdownTecnico(true);
                                        }, onFocus: () => setShowDropdownTecnico(true), onBlur: () => setTimeout(() => setShowDropdownTecnico(false), 200) }), showDropdownTecnico && (_jsx("ul", { className: "autocomplete-dropdown", children: tecnicos
                                            .filter(tec => `${tec.nome} ${tec.cpf}`.replace(/\D/g, '').toLowerCase()
                                            .includes(idTecnico.replace(/\D/g, '').toLowerCase()))
                                            .map(tec => (_jsxs("li", { onClick: () => {
                                                setIdTecnico(`${tec.nome} - ${tec.cpf}`);
                                                setSelectedTecnicoId(tec.id_tecnico);
                                                setShowDropdownTecnico(false);
                                            }, children: [tec.nome, " - ", tec.cpf] }, tec.id_tecnico))) }))] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83C\uDFE2 LOCAL" }), _jsx("select", { value: idLocal, disabled: true, title: "Este campo est\u00E1 travado para 'Recep\u00E7\u00E3o'", style: {
                                            backgroundColor: "#000", // preto
                                            color: "#fff", // texto branco
                                            cursor: "not-allowed", // cursor travado
                                            border: "1px solid #555" // borda discreta (opcional)
                                        }, children: locais.map(loc => (_jsx("option", { value: loc.id_scanner, children: loc.local_instalado }, loc.id_scanner))) })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCC STATUS" }), _jsx("input", { type: "text", value: statusDescricao, readOnly: true, style: {
                                            backgroundColor: "#000",
                                            color: "#fff",
                                            cursor: "not-allowed",
                                            border: "1px solid #555"
                                        } })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC5 DATA DE ENTRADA" }), _jsx("input", { type: "date", value: dataCriacao, onChange: (e) => setDataCriacao(e.target.value), required: true })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => navigate('/ordemservico'), children: "CANCELAR" })] })] }) }) }), _jsx("section", { className: "container" }), showSuccessModal && (_jsx(ModalSucesso, { onClose: () => {
                    setShowSuccessModal(false);
                    navigate('/ordemservico');
                } }))] }));
};
export default CadastrarOrdem;
