import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import MenuLateral from "../../components/MenuLateral";
// ✅ cliente axios central
import api from '../../services/api';
const AlterarOrdem = () => {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const [idOrdem, setIdOrdem] = useState(null);
    const [nomeCliente, setNomeCliente] = useState('');
    const [equipamentoInfo, setEquipamentoInfo] = useState('');
    const [status, setStatus] = useState(0);
    const [descricao, setDescricao] = useState('');
    const [dataCriacao, setDataCriacao] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [idLocal, setIdLocal] = useState('');
    const [statusDescricao, setStatusDescricao] = useState('');
    const [locais, setLocais] = useState([]);
    useEffect(() => {
        const ordemString = localStorage.getItem("ordemSelecionada");
        if (!ordemString) {
            alert("Nenhuma ordem selecionada.");
            navigate('/ordemservico');
            return;
        }
        const ordem = JSON.parse(ordemString);
        setIdOrdem(ordem.id_ordem);
        setNomeCliente(ordem.nome_cliente);
        setEquipamentoInfo(`${ordem.tipo_equipamento} ${ordem.marca} ${ordem.modelo} - ${ordem.numero_serie}`);
        setDescricao(ordem.descricao_problema || '');
        setDataCriacao(ordem.data_entrada?.split('T')[0]);
        setIdLocal(ordem.id_local.toString());
        api.get("/api/locais")
            .then(res => {
            setLocais(res.data);
            const localAtual = res.data.find((loc) => loc.id_scanner === ordem.id_local);
            if (localAtual) {
                setStatusDescricao(localAtual.status_interno);
                setStatus(localAtual.id_status);
            }
        })
            .catch(err => console.error("Erro ao buscar locais:", err));
    }, [navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idLocal || idLocal.trim() === '') {
            alert("Selecione um local válido.");
            return;
        }
        const ordemAtualizada = {
            descricao_problema: descricao,
            id_local: idLocal,
            id_status: status
        };
        if (typeof status !== 'number' || isNaN(status) || status <= 0) {
            alert("Status inválido. Selecione um local válido para gerar o status.");
            return;
        }
        try {
            await api.put(`/api/ordens/${idOrdem}`, ordemAtualizada);
            setShowSuccessModal(true);
        }
        catch (error) {
            console.error('Erro ao atualizar ordem:', error);
            alert('Erro ao atualizar ordem.');
        }
    };
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "ALTERAR ORDEM DE SERVI\u00C7O" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDC64 CLIENTE" }), _jsx("input", { type: "text", value: nomeCliente, disabled: true, title: "N\u00E3o \u00E9 poss\u00EDvel alterar o cliente ap\u00F3s o cadastro da ordem.", className: "input-estilizado" })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD27 EQUIPAMENTO" }), _jsx("input", { type: "text", value: equipamentoInfo, disabled: true, title: "N\u00E3o \u00E9 poss\u00EDvel alterar o equipamento ap\u00F3s o cadastro da ordem.", className: "input-estilizado" })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83C\uDFE2 LOCAL" }), _jsxs("select", { value: idLocal, onChange: (e) => {
                                            const novoId = e.target.value;
                                            setIdLocal(novoId);
                                            const localSelecionado = locais.find(loc => loc.id_scanner.toString() === novoId);
                                            if (localSelecionado) {
                                                setStatusDescricao(localSelecionado.status_interno);
                                                setStatus(localSelecionado.id_status);
                                            }
                                        }, required: true, children: [_jsx("option", { value: "", children: "Selecione o local" }), locais.map(loc => (_jsx("option", { value: loc.id_scanner, children: loc.local_instalado }, loc.id_scanner)))] })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCC STATUS" }), _jsx("input", { type: "text", value: statusDescricao, disabled: true, title: "N\u00E3o \u00E9 poss\u00EDvel alterar o status diretamente. O status \u00E9 definido pelo local.", className: "input-estilizado input-disabled" })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDD DESCRI\u00C7\u00C3O DO PROBLEMA" }), _jsx("textarea", { value: descricao, onChange: (e) => setDescricao(e.target.value), rows: 4, placeholder: "Informe o que o cliente relatou sobre o problema", required: true, className: "input-estilizado", style: { resize: 'vertical' } })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCC5 DATA DE CRIA\u00C7\u00C3O" }), _jsx("input", { type: "text", value: dataCriacao, disabled: true, className: "input-estilizado" })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => {
                                            localStorage.removeItem("ordemSelecionada");
                                            navigate('/ordemservico');
                                        }, children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", type: "button", onClick: () => setShowModal(true), children: "VOLTAR" }) })] }) }) }), showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR ?" }), _jsx("button", { className: "close-btn", onClick: () => setShowModal(false), children: "X" })] }), _jsx("p", { children: "Deseja mesmo sair sem salvar?" }), _jsxs("p", { children: [_jsx("strong", { children: "Cliente:" }), " ", nomeCliente] }), _jsx("button", { className: "btn azul", onClick: () => {
                                localStorage.removeItem("ordemSelecionada");
                                navigate('/ordemservico');
                            }, children: "CONFIRMAR" })] }) })), showSuccessModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "\u2705 Sucesso!" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowSuccessModal(false);
                                        localStorage.removeItem("ordemSelecionada");
                                        navigate('/ordemservico');
                                    }, children: "X" })] }), _jsx("p", { children: "Ordem de servi\u00E7o atualizada com sucesso!" }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn azul", onClick: () => {
                                    setShowSuccessModal(false);
                                    localStorage.removeItem("ordemSelecionada");
                                    navigate('/ordemservico');
                                }, children: "OK" }) })] }) }))] }));
};
export default AlterarOrdem;
