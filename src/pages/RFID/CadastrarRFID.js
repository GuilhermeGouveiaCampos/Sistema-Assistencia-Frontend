import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import MenuLateral from '../../components/MenuLateral';
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const CadastrarLocalRFID = () => {
    const navigate = useNavigate();
    const [idScanner, setIdScanner] = useState('');
    const [localInstalado, setLocalInstalado] = useState('');
    const [statusInterno, setStatusInterno] = useState('');
    const [status, setStatus] = useState('ativo');
    const [showModal, setShowModal] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/locais', {
                id_scanner: idScanner,
                local_instalado: localInstalado,
                status_interno: statusInterno,
                status: status,
            });
            setShowModal(true);
        }
        catch (error) {
            console.error('Erro ao cadastrar local:', error);
            alert('Erro ao cadastrar local.');
        }
    };
    return (_jsxs(MenuLateral, { children: [showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "SUCESSO \u2705" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowModal(false);
                                        navigate('/rfid');
                                    }, children: "X" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("p", { children: ["Local ", _jsx("strong", { children: idScanner }), " cadastrado com sucesso!"] }), _jsx("button", { className: "btn azul", onClick: () => navigate('/rfid'), children: "OK" })] })] }) })), _jsx("h1", { className: "titulo-clientes", children: "CADASTRAR LOCAL RFID" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD24 ID SCANNER" }), _jsx("input", { type: "text", placeholder: "Ex: LOC001", value: idScanner, onChange: (e) => setIdScanner(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCD LOCAL INSTALADO" }), _jsx("input", { type: "text", placeholder: "Ex: Bancada de Teste", value: localInstalado, onChange: (e) => setLocalInstalado(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCC STATUS INTERNO" }), _jsx("input", { type: "text", placeholder: "Ex: Finalizado", value: statusInterno, onChange: (e) => setStatusInterno(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCCA STATUS" }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), required: true, children: [_jsx("option", { value: "ativo", children: "Ativo" }), _jsx("option", { value: "inativo", children: "Inativo" })] })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn vermelho-claro", onClick: () => navigate('/rfid'), children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/rfid'), children: "VOLTAR" }) })] }) }) })] }));
};
export default CadastrarLocalRFID;
