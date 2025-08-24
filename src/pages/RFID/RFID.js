import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import MenuLateral from '../../components/MenuLateral'; // ✅
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const RFID = () => {
    const navigate = useNavigate();
    const [locais, setLocais] = useState([]);
    const [localFiltro, setLocalFiltro] = useState('');
    const [localSelecionado, setLocalSelecionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [motivo, setMotivo] = useState('');
    const consultarLocais = async () => {
        try {
            const res = await api.get('/api/locais', {
                params: { local: localFiltro },
            });
            setLocais(res.data);
            setLocalSelecionado(null);
        }
        catch (error) {
            console.error('Erro ao consultar locais:', error);
        }
    };
    useEffect(() => {
        consultarLocais();
    }, []);
    useEffect(() => {
        const delay = setTimeout(() => consultarLocais(), 400);
        return () => clearTimeout(delay);
    }, [localFiltro]);
    const selecionarLocal = (idScanner) => {
        const local = locais.find(l => l.id_scanner === idScanner) || null;
        setLocalSelecionado(prev => (prev?.id_scanner === idScanner ? null : local));
        if (local)
            console.log('✓ Local selecionado:', local.id_scanner);
    };
    const inativarLocal = async () => {
        if (!localSelecionado || motivo.trim() === '')
            return;
        try {
            await api.put(`/api/locais/${localSelecionado.id_scanner}`, {
                status: 'inativo',
                motivo_inativacao: motivo,
            });
            setMostrarModal(false);
            consultarLocais();
        }
        catch (error) {
            console.error('Erro ao inativar local:', error);
            alert('Falha ao inativar. Verifique o backend ou os dados enviados.');
            setMostrarModal(false);
        }
    };
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "LOCAL INSTALADO" }), _jsx("section", { className: "clientes-section", children: _jsxs("div", { className: "container-central", children: [_jsxs("div", { className: "filtros-clientes", children: [_jsx("input", { type: "text", placeholder: "LOCAL INSTALADO", value: localFiltro, onChange: (e) => setLocalFiltro(e.target.value) }), _jsx("button", { className: "btn roxo-claro", onClick: consultarLocais, children: "CONSULTAR" })] }), _jsx("div", { className: "tabela-clientes", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID SCANNER" }), _jsx("th", { children: "LOCAL INSTALADO" }), _jsx("th", { children: "STATUS INTERNO" })] }) }), _jsx("tbody", { children: locais.map((loc) => (_jsxs("tr", { onClick: () => selecionarLocal(loc.id_scanner), className: localSelecionado?.id_scanner === loc.id_scanner ? 'linha-selecionada' : '', children: [_jsx("td", { children: loc.id_scanner }), _jsx("td", { children: loc.local_instalado }), _jsx("td", { children: loc.status_interno })] }, loc.id_scanner))) })] }) }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { className: "btn azul", onClick: () => navigate('/rfid/cadastrar'), children: "CADASTRAR" }), _jsx("button", { className: "btn preto", disabled: !localSelecionado, onClick: () => {
                                        if (localSelecionado) {
                                            localStorage.setItem('localSelecionado', JSON.stringify(localSelecionado));
                                            navigate('/rfid/editar');
                                        }
                                    }, children: "ALTERAR" }), _jsx("button", { className: "btn vermelho", disabled: !localSelecionado, onClick: () => {
                                        setMotivo('');
                                        setMostrarModal(true);
                                    }, children: "EXCLUIR" }), _jsx("button", { className: "btn roxo-claro", onClick: () => navigate('/rfid/inativos'), children: "INATIVOS" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate('/'), children: "VOLTAR" }) })] }) }), mostrarModal && localSelecionado && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "INATIVAR LOCAL" }), _jsx("button", { className: "close-btn", onClick: () => setMostrarModal(false), children: "X" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("p", { children: ["Deseja inativar o local ", _jsx("strong", { children: localSelecionado.local_instalado }), "?"] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDD MOTIVO DA INATIVA\u00C7\u00C3O" }), _jsx("textarea", { value: motivo, onChange: (e) => setMotivo(e.target.value), placeholder: "Descreva o motivo...", rows: 4, required: true, style: {
                                                width: '100%',
                                                backgroundColor: 'black',
                                                color: 'white',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                fontSize: '16px',
                                                border: 'none',
                                                marginTop: '5px'
                                            } })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn azul", onClick: inativarLocal, children: "CONFIRMAR" }), _jsx("button", { className: "btn preto", onClick: () => setMostrarModal(false), children: "CANCELAR" })] })] })] }) }))] }));
};
export default RFID;
