import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/ordens/OrdemDetalhe.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';
// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';
const fmtData = (iso) => iso ? new Date(iso).toLocaleString('pt-BR') : 'N/D';
const fmtDuracao = (m) => {
    if (m == null)
        return 'N/D';
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h ? `${h}h ${min}min` : `${min}min`;
};
const OrdemDetalhe = () => {
    const { id } = useParams();
    const [ordem, setOrdem] = useState(null);
    const navigate = useNavigate();
    // histórico
    const [showHist, setShowHist] = useState(false);
    const [audit, setAudit] = useState(null);
    const [auditLoading, setAuditLoading] = useState(false);
    // tick para atualizar o tempo “ao vivo”
    const [, setTick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTick(v => v + 1), 60000);
        return () => clearInterval(t);
    }, []);
    useEffect(() => {
        const fetchOrdem = async () => {
            try {
                const { data } = await api.get(`/api/ordens/${id}`);
                if (!data || data.erro) {
                    setOrdem(undefined);
                }
                else {
                    data.tempo_servico = data.tempo_servico != null ? Number(data.tempo_servico) : null;
                    setOrdem(data);
                }
            }
            catch (error) {
                console.error('❌ Erro ao buscar detalhes da OS:', error);
                setOrdem(undefined);
            }
        };
        fetchOrdem();
    }, [id]);
    const carregarHistorico = async () => {
        if (!id)
            return;
        setAuditLoading(true);
        try {
            const uid = localStorage.getItem('id') || undefined;
            const { data } = await api.get(`/api/ordens/${id}/auditoria`, { headers: uid ? { 'x-user-id': uid } : undefined });
            setAudit(data);
        }
        catch (e) {
            console.error('❌ Erro ao buscar auditoria:', e);
            setAudit([]);
        }
        finally {
            setAuditLoading(false);
        }
    };
    if (ordem === null)
        return _jsx("p", { children: "Carregando..." });
    if (ordem === undefined)
        return _jsx("p", { children: "Ordem de servi\u00E7o n\u00E3o encontrada." });
    const imagens = ordem.imagem?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const baseURL = import.meta.env.VITE_API_URL;
    const acumulado = Number(ordem.tempo_servico) || 0;
    const timerRodando = !!ordem.data_inicio_reparo && !ordem.data_fim_reparo;
    const extraMin = timerRodando
        ? Math.max(0, Math.floor((Date.now() - new Date(ordem.data_inicio_reparo).getTime()) / 60000))
        : 0;
    const totalMin = acumulado + extraMin;
    return (_jsx(MenuLateral, { children: _jsxs("div", { className: "clientes-content", children: [_jsx("h1", { className: "titulo-clientes", children: "DETALHES EQUIPAMENTO" }), _jsx("table", { className: "tabela-detalhes", children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("th", { children: "Cliente" }), _jsx("td", { children: ordem.nome_cliente })] }), _jsxs("tr", { children: [_jsx("th", { children: "CPF Cliente" }), _jsx("td", { children: ordem.cpf_cliente })] }), _jsxs("tr", { children: [_jsx("th", { children: "T\u00E9cnico" }), _jsx("td", { children: ordem.nome_tecnico })] }), _jsxs("tr", { children: [_jsx("th", { children: "Equipamento" }), _jsxs("td", { children: [ordem.tipo, " - ", ordem.marca, " ", ordem.modelo] })] }), _jsxs("tr", { children: [_jsx("th", { children: "N\u00BA S\u00E9rie" }), _jsx("td", { children: ordem.numero_serie })] }), _jsxs("tr", { children: [_jsx("th", { children: "Status" }), _jsx("td", { children: ordem.status_os })] }), _jsxs("tr", { children: [_jsx("th", { children: "Problema" }), _jsx("td", { children: ordem.descricao_problema || 'N/D' })] }), _jsxs("tr", { children: [_jsx("th", { children: "Servi\u00E7o Realizado" }), _jsx("td", { children: ordem.descricao_servico || 'Não informado' })] }), _jsxs("tr", { children: [_jsx("th", { children: "Data Cria\u00E7\u00E3o" }), _jsx("td", { children: fmtData(ordem.data_criacao) })] }), _jsxs("tr", { children: [_jsx("th", { children: "In\u00EDcio Reparo" }), _jsx("td", { children: fmtData(ordem.data_inicio_reparo) })] }), _jsxs("tr", { children: [_jsx("th", { children: "Fim Reparo" }), _jsx("td", { children: fmtData(ordem.data_fim_reparo) })] }), _jsxs("tr", { children: [_jsx("th", { children: "Tempo Servi\u00E7o" }), _jsxs("td", { children: [fmtDuracao(totalMin), timerRodando ? ' (contando...)' : ''] })] })] }) }), _jsx("div", { style: { marginTop: '10px', display: 'flex', justifyContent: 'flex-start' }, children: _jsx("button", { className: "btn roxo-claro", onClick: () => {
                            const novo = !showHist;
                            setShowHist(novo);
                            if (novo && audit == null)
                                carregarHistorico();
                        }, title: "Ver hist\u00F3rico de movimenta\u00E7\u00F5es desta OS", children: "HIST\u00D3RICO" }) }), showHist && (_jsxs("div", { style: { marginTop: '14px' }, children: [_jsx("h3", { style: { marginBottom: '.5rem' }, children: "Hist\u00F3rico de Movimenta\u00E7\u00F5es" }), auditLoading ? (_jsx("p", { children: "Carregando hist\u00F3rico..." })) : audit && audit.length ? (_jsx("div", { className: "tabela-usuarios", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Quando" }), _jsx("th", { children: "Quem" }), _jsx("th", { children: "Campo alterado" }), _jsx("th", { children: "De \u2192 Para" })] }) }), _jsx("tbody", { children: (audit || [])
                                            .filter(a => a.field === 'id_local' || a.field === 'id_status_os')
                                            .map(a => {
                                            const campo = a.field === 'id_local' ? 'Local'
                                                : a.field === 'id_status_os' ? 'Status'
                                                    : (a.field || '—');
                                            const de = (a.old_label ?? a.old_value ?? '—');
                                            const para = (a.new_label ?? a.new_value ?? '—');
                                            const quando = a.created_at
                                                ? new Date(a.created_at).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })
                                                : '—';
                                            return (_jsxs("tr", { children: [_jsx("td", { children: quando }), _jsx("td", { children: a.usuario || '—' }), _jsx("td", { children: campo }), _jsxs("td", { children: [de, " \u00A0\u2192\u00A0 ", para] })] }, a.id_log));
                                        }) })] }) })) : (_jsx("p", { children: "Nenhum evento registrado." }))] })), _jsx("h2", { style: { marginTop: '2rem' }, children: "Imagens do Equipamento" }), _jsx("div", { className: "galeria-imagens", children: imagens.length === 0 ? (_jsx("p", { children: "Nenhuma imagem dispon\u00EDvel." })) : (imagens.map((img, i) => (_jsx("img", { src: `${baseURL}/uploads/${img}`, alt: `Imagem ${i + 1}`, onError: () => console.error(`❌ Falha ao carregar imagem: ${img}`) }, i)))) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate(-1), children: "VOLTAR" }) })] }) }));
};
export default OrdemDetalhe;
