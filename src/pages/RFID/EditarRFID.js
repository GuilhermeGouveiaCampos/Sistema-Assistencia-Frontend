import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import MenuLateral from '../../components/MenuLateral';
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const AlterarRFID = () => {
    const navigate = useNavigate();
    const [local, setLocal] = useState(null);
    const [localInstalado, setLocalInstalado] = useState('');
    const [statusInterno, setStatusInterno] = useState('');
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useEffect(() => {
        const localSelecionado = localStorage.getItem("localSelecionado");
        if (!localSelecionado) {
            alert("Nenhum local selecionado.");
            navigate('/rfid');
            return;
        }
        const localObj = JSON.parse(localSelecionado);
        setLocal(localObj);
        setLocalInstalado(localObj.local_instalado);
        setStatusInterno(localObj.status_interno);
        setStatus(localObj.status);
    }, [navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!local)
            return;
        const localAtualizado = {
            local_instalado: localInstalado,
            status_interno: statusInterno,
            status: status
        };
        try {
            await api.put(`/api/locais/${local.id_scanner}`, localAtualizado);
            setShowSuccessModal(true);
        }
        catch (error) {
            console.error('Erro ao atualizar local:', error);
            alert('Erro ao atualizar local.');
        }
    };
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "ALTERAR LOCAL RFID" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD20 ID SCANNER" }), _jsx("input", { type: "text", value: local?.id_scanner || '', disabled: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCD LOCAL INSTALADO" }), _jsx("input", { type: "text", value: localInstalado, onChange: (e) => setLocalInstalado(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCC STATUS INTERNO" }), _jsx("input", { type: "text", value: statusInterno, onChange: (e) => setStatusInterno(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCA STATUS" }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Selecione" }), _jsx("option", { value: "ativo", children: "Ativo" }), _jsx("option", { value: "inativo", children: "Inativo" })] })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => {
                                            localStorage.removeItem("localSelecionado");
                                            navigate('/rfid');
                                        }, children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", type: "button", onClick: () => setShowModal(true), children: "VOLTAR" }) })] }) }) }), showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR ?" }), _jsx("button", { className: "close-btn", onClick: () => setShowModal(false), children: "X" })] }), _jsx("p", { children: "Deseja mesmo sair sem salvar?" }), _jsxs("p", { children: [_jsx("strong", { children: "Local:" }), " ", local?.local_instalado] }), _jsx("button", { className: "btn azul", onClick: () => {
                                localStorage.removeItem("localSelecionado");
                                navigate('/rfid');
                            }, children: "CONFIRMAR" })] }) })), showSuccessModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "\u2705 Sucesso!" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowSuccessModal(false);
                                        localStorage.removeItem("localSelecionado");
                                        navigate('/rfid');
                                    }, children: "X" })] }), _jsxs("p", { children: ["Local ", _jsx("strong", { children: local?.local_instalado }), " atualizado com sucesso!"] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn azul", onClick: () => {
                                    setShowSuccessModal(false);
                                    localStorage.removeItem("localSelecionado");
                                    navigate('/rfid');
                                }, children: "OK" }) })] }) }))] }));
};
export default AlterarRFID;
