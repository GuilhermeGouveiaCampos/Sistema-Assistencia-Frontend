// src/pages/ordens/OrdemDetalhe.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';

import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

interface OrdemImagem {
  id_imagem: number;
  url: string;       // ex.: /api/ordens/imagens/blob/123
  mime?: string;
  size?: number;
  created_at?: string;
}

interface OrdemDetalhe {
  id_ordem?: number;
  id_os?: number;
  id_equipamento?: number;
  descricao_problema: string | null;
  descricao_servico: string | null;
  data_criacao: string;
  data_inicio_reparo: string | null;
  data_fim_reparo: string | null;
  tempo_servico: number | null;
  status_os: string;
  nome_cliente: string;
  cpf_cliente: string;
  nome_tecnico: string;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  // ❗ não usamos mais string CSV aqui; backend já envia:
  imagens?: OrdemImagem[];
}

type AuditItem = {
  id_log: number;
  action: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
  user_id: number | null;
  usuario: string | null;
  created_at: string;
  old_label?: string | null;
  new_label?: string | null;
};

const fmtData = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR') : 'N/D';

const fmtDuracao = (m?: number | null) => {
  if (m == null) return 'N/D';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h ? `${h}h ${min}min` : `${min}min`;
};

// helper p/ quebrar string de imagens "a.jpg,b.png"
const splitImgs = (s?: string | null) =>
  s ? s.split(',').map(v => v.trim()).filter(Boolean) : [];

const OrdemDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ordem, setOrdem] = useState<OrdemDetalhe | null | undefined>(null);

  // 🔥 lista final de imagens a exibir (pode misturar blob e /uploads)
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);

  const navigate = useNavigate();

  // histórico
  const [showHist, setShowHist] = useState(false);
  const [audit, setAudit] = useState<AuditItem[] | null>(null);
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
        const { data } = await api.get<OrdemDetalhe>(`/api/ordens/${id}`);
        if (!data || (data as any).erro) {
          setOrdem(undefined);
          return;
        }

        data.tempo_servico = data.tempo_servico != null ? Number(data.tempo_servico) : null;
        setOrdem(data);

        // monta imagens:
        await hidratarFotos(data);
      } catch (error) {
        console.error('❌ Erro ao buscar detalhes da OS:', error);
        setOrdem(undefined);
      }
    };
    fetchOrdem();
  }, [id]);

  const hidratarFotos = async (od: OrdemDetalhe) => {
    const baseURL = import.meta.env.VITE_API_URL;

    // 1) usa as imagens BLOB da própria OS (se vieram)
    if (od.imagens && od.imagens.length) {
      setFotosUrls(
        od.imagens.map(im => `${baseURL}${im.url}`) // junta baseURL + /api/ordens/imagens/blob/:id
      );
      return;
    }

    // 2) fallback: por id_equipamento (CSV salvo em /uploads)
    if (od.id_equipamento) {
      try {
        const { data: eq } = await api.get(`/api/equipamentos/${od.id_equipamento}`);
        const csv = splitImgs(eq?.imagem);
        if (csv.length) {
          setFotosUrls(csv.map((f: string) => `${baseURL}/uploads/${f}`));
          return;
        }
      } catch (e) {
        console.warn('⚠️ Fallback por id_equipamento falhou:', e);
      }
    }

    // 3) fallback: casando por número de série
    try {
      const { data: lista } = await api.get('/api/equipamentos');
      const eq = (lista || []).find((it: any) =>
        String(it?.numero_serie ?? '').trim() === String(od.numero_serie ?? '').trim()
      );
      const csv = splitImgs(eq?.imagem);
      if (csv.length) {
        setFotosUrls(csv.map((f: string) => `${baseURL}/uploads/${f}`));
        return;
      }
    } catch (e) {
      console.warn('⚠️ Fallback por número de série falhou:', e);
    }

    // nada encontrado
    setFotosUrls([]);
  };

  const carregarHistorico = async () => {
    if (!id) return;
    setAuditLoading(true);
    try {
      const uid = localStorage.getItem('id') || undefined;
      const { data } = await api.get<AuditItem[]>(
        `/api/ordens/${id}/auditoria`,
        { headers: uid ? { 'x-user-id': uid } : undefined }
      );
      setAudit(data);
    } catch (e) {
      console.error('❌ Erro ao buscar auditoria:', e);
      setAudit([]);
    } finally {
      setAuditLoading(false);
    }
  };

  if (ordem === null) return <p>Carregando...</p>;
  if (ordem === undefined) return <p>Ordem de serviço não encontrada.</p>;

  const acumulado = Number(ordem.tempo_servico) || 0;
  const timerRodando = !!ordem.data_inicio_reparo && !ordem.data_fim_reparo;
  const extraMin = timerRodando
    ? Math.max(0, Math.floor((Date.now() - new Date(ordem.data_inicio_reparo as string).getTime()) / 60000))
    : 0;
  const totalMin = acumulado + extraMin;

  return (
    <MenuLateral>
      <div className="clientes-content">
        <h1 className="titulo-clientes">DETALHES EQUIPAMENTO</h1>

        <table className="tabela-detalhes">
          <tbody>
            <tr><th>Cliente</th><td>{ordem.nome_cliente}</td></tr>
            <tr><th>CPF Cliente</th><td>{ordem.cpf_cliente}</td></tr>
            <tr><th>Técnico</th><td>{ordem.nome_tecnico}</td></tr>
            <tr><th>Equipamento</th><td>{ordem.tipo} - {ordem.marca} {ordem.modelo}</td></tr>
            <tr><th>Nº Série</th><td>{ordem.numero_serie}</td></tr>
            <tr><th>Status</th><td>{ordem.status_os}</td></tr>
            <tr><th>Problema</th><td>{ordem.descricao_problema || 'N/D'}</td></tr>
            <tr><th>Serviço Realizado</th><td>{ordem.descricao_servico || 'Não informado'}</td></tr>
            <tr><th>Data Criação</th><td>{fmtData(ordem.data_criacao)}</td></tr>
            <tr><th>Início Reparo</th><td>{fmtData(ordem.data_inicio_reparo)}</td></tr>
            <tr><th>Fim Reparo</th><td>{fmtData(ordem.data_fim_reparo)}</td></tr>
            <tr>
              <th>Tempo Serviço</th>
              <td>{fmtDuracao(totalMin)}{timerRodando ? ' (contando...)' : ''}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            className="btn roxo-claro"
            onClick={() => {
              const novo = !showHist;
              setShowHist(novo);
              if (novo && audit == null) carregarHistorico();
            }}
            title="Ver histórico de movimentações desta OS"
          >
            HISTÓRICO
          </button>
        </div>

        {showHist && (
          <div style={{ marginTop: '14px' }}>
            <h3 style={{ marginBottom: '.5rem' }}>Histórico de Movimentações</h3>
            {auditLoading ? (
              <p>Carregando histórico...</p>
            ) : audit && audit.length ? (
              <div className="tabela-usuarios">
                <table>
                  <thead>
                    <tr>
                      <th>Quando</th>
                      <th>Quem</th>
                      <th>Campo alterado</th>
                      <th>De → Para</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(audit || [])
                      .filter(a => a.field === 'id_local' || a.field === 'id_status_os')
                      .map(a => {
                        const campo =
                          a.field === 'id_local' ? 'Local'
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

                        return (
                          <tr key={a.id_log}>
                            <td>{quando}</td>
                            <td>{a.usuario || '—'}</td>
                            <td>{campo}</td>
                            <td>{de} &nbsp;→&nbsp; {para}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Nenhum evento registrado.</p>
            )}
          </div>
        )}

        <h2 style={{ marginTop: '2rem' }}>Imagens do Equipamento / OS</h2>
        <div className="galeria-imagens">
          {fotosUrls.length === 0 ? (
            <p>Nenhuma imagem disponível.</p>
          ) : (
            fotosUrls.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Imagem ${i + 1}`}
                onError={() => console.error(`❌ Falha ao carregar imagem: ${src}`)}
              />
            ))
          )}
        </div>

        <div className="voltar-container">
          <button className="btn roxo" onClick={() => navigate(-1)}>VOLTAR</button>
        </div>
      </div>
    </MenuLateral>
  );
};

export default OrdemDetalhe;
