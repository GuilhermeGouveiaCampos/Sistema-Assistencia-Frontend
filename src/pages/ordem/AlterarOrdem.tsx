import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import MenuLateral from "../../components/MenuLateral";

// ✅ cliente axios central
import api from '../../services/api';

type LocalItem = {
  id_local: string;        // normalizado para string
  id_scanner: string;      // ex.: "LOC002"
  local_instalado: string;
  status_interno: string;  // texto do status
  id_status: number;       // numérico
};

type LeitorItem = {
  codigo: string;
  nome?: string;
};

type Toast = {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
};

const AlterarOrdem: React.FC = () => {
  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";

  // 🔐 nível do usuário (3 = técnico)
  const nivelUsuario =
    Number(localStorage.getItem('nivel') ??
          localStorage.getItem('nivel_acesso') ??
          localStorage.getItem('nivelUsuario') ?? '0');
  const isTecnico = nivelUsuario === 3;

  const [idOrdem, setIdOrdem] = useState<number | null>(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [equipamentoInfo, setEquipamentoInfo] = useState('');
  const [status, setStatus] = useState<number>(0);
  const [descricao, setDescricao] = useState('');
  const [descricaoServico, setDescricaoServico] = useState(''); // 👈 novo (somente técnico)
  const [dataCriacao, setDataCriacao] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [idLocal, setIdLocal] = useState<string>(''); // guarda o id_scanner
  const [statusDescricao, setStatusDescricao] = useState('');
  const [locais, setLocais] = useState<LocalItem[]>([]);

  // 🔗 RFID
  const [uidTag, setUidTag] = useState<string>('');            // campo de UID (manual ou auto)
  const [boundUid, setBoundUid] = useState<string>('');        // UID atualmente vinculado na OS
  const [boundList, setBoundList] = useState<{ uid: string; desde?: string }[]>([]);
  const [loadingBind, setLoadingBind] = useState(false);
  const [loadingUnbind, setLoadingUnbind] = useState(false);
  const [loadingBoundUid, setLoadingBoundUid] = useState(false);

  // 🔊 Leitor + autofill
  const [leitores, setLeitores] = useState<LeitorItem[]>([]);
  const [leitorEscutado, setLeitorEscutado] = useState<string>(() => localStorage.getItem('leitor_codigo_front') || '');
  const [autoFill, setAutoFill] = useState<boolean>(() => (localStorage.getItem('rfid_autofill') ?? '1') === '1');

  // 🔔 Toasts (canto superior direito)
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (t: Omit<Toast, 'id'>, ms = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), ms);
  };

  // cache da TAG vinculada por OS
  const cacheKey = (osId: number) => `rfid_bound_uid_${osId}`;
  const setCacheBound = (osId: number, uid: string) => localStorage.setItem(cacheKey(osId), uid || '');
  const getCacheBound = (osId: number) => localStorage.getItem(cacheKey(osId)) || '';

  // carrega dados iniciais
  useEffect(() => {
    const ordemString = localStorage.getItem("ordemSelecionada");
    if (!ordemString) {
      pushToast({ type: 'error', text: 'Nenhuma ordem selecionada.' });
      navigate('/ordemservico');
      return;
    }

    const ordem = JSON.parse(ordemString);
    const osId = Number(ordem.id_ordem ?? ordem.id_os ?? ordem.id);
    setIdOrdem(Number.isFinite(osId) ? osId : null);

    setNomeCliente(ordem.nome_cliente ?? '');
    setEquipamentoInfo(`${ordem.tipo_equipamento ?? ''} ${ordem.marca ?? ''} ${ordem.modelo ?? ''} - ${ordem.numero_serie ?? ''}`.trim());
    setDescricao(ordem.descricao_problema || '');
    setDescricaoServico(ordem.descricao_servico || ''); // 👈 carrega se existir

    const data = String(ordem.data_entrada || ordem.data_criacao || ordem.data_atualizacao || '');
    setDataCriacao(data.includes('T') ? data.split('T')[0] : data.substring(0, 10));

    const currentLocal = String(ordem.id_local ?? ordem.id_scanner ?? '');
    setIdLocal(currentLocal);

    // locais
    api.get("/api/ordens/locais")
      .then(res => {
        const recebidos: LocalItem[] = (res.data || []).map((x: any) => ({
          id_local: String(x.id_local ?? ''),
          id_scanner: String(x.id_scanner ?? ''),
          local_instalado: String(x.local_instalado ?? ''),
          status_interno: String(x.status_interno ?? ''),
          id_status: Number(x.id_status ?? 0),
        }));
        setLocais(recebidos);

        const localAtual = recebidos.find((l) => l.id_scanner === currentLocal);
        if (localAtual) {
          setStatusDescricao(localAtual.status_interno);
          setStatus(Number(localAtual.id_status || 0));
        }
      })
      .catch(err => {
        console.error("Erro ao buscar locais:", err);
        pushToast({ type: 'error', text: 'Erro ao carregar locais.' });
      });

    // leitores disponíveis para escuta (autofill)
    api.get('/api/ardloc/leitores')
      .then(res => setLeitores(res.data || []))
      .catch(() => setLeitores([]));

    // preenche TAG(s) vinculada(s) (servidor) ou cache
    if (Number.isFinite(osId)) {
      fetchBoundUidFromApi(osId).catch(() => {
        const cached = getCacheBound(osId);
        setBoundUid(cached);
        if (cached) setUidTag(cached);
      });
      fetchBoundList(osId).catch(() => setBoundList([]));
    }
  }, [navigate]);

  // polling last-uid do leitor selecionado p/ autopreencher o campo de UID
  useEffect(() => {
    if (!autoFill || !leitorEscutado) return;
    const timer = setInterval(async () => {
      try {
        const { data } = await api.get('/api/ardloc/last-uid', {
          params: { leitor: leitorEscutado, maxAgeSec: 5 }
        });
        if (data?.recente && data?.uid) {
          const novo = String(data.uid).toUpperCase();
          setUidTag((prev) => (prev !== novo ? novo : prev));
        }
      } catch {
        /* silencioso */
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [autoFill, leitorEscutado]);

  async function fetchBoundUidFromApi(id_os: number) {
    setLoadingBoundUid(true);
    try {
      const { data } = await api.get('/api/ardloc/bind/current', { params: { id_os } });
      const uid = String(data?.uid || '').toUpperCase();
      setBoundUid(uid);
      if (uid) {
        setUidTag(uid);
        setCacheBound(id_os, uid);
      }
    } finally {
      setLoadingBoundUid(false);
    }
  }

  async function fetchBoundList(id_os: number) {
    const { data } = await api.get('/api/ardloc/bind/list', { params: { id_os } });
    setBoundList(Array.isArray(data) ? data : []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idOrdem) {
      pushToast({ type: 'error', text: 'Ordem inválida.' });
      return;
    }
    if (!idLocal || idLocal.trim() === '') {
      pushToast({ type: 'error', text: 'Selecione um local válido.' });
      return;
    }
    if (typeof status !== 'number' || isNaN(status) || status <= 0) {
      pushToast({ type: 'error', text: 'Status inválido. Selecione um local válido.' });
      return;
    }

    const ordemAtualizada: any = {
      descricao_problema: (descricao || '').trim(),
      id_local: idLocal,  // string: "LOC002"
      id_status: status   // número
    };

    // 👇 só técnico pode enviar/alterar a descrição do serviço
    if (isTecnico) {
      ordemAtualizada.descricao_servico = (descricaoServico || '').trim();
    }

    try {
      await api.put(`/api/ordens/${idOrdem}`, ordemAtualizada);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Erro ao atualizar ordem:', error?.response?.data || error);
      pushToast({ type: 'error', text: error?.response?.data?.erro || 'Erro ao atualizar ordem.' });
    }
  };

  // 🔗 Vincular TAG à OS
  const bindTag = async () => {
    if (!idOrdem) {
      pushToast({ type: 'error', text: 'Ordem inválida.' });
      return;
    }
    const uid = (uidTag || '').trim().toUpperCase();
    if (!/^[0-9A-F]{8,}$/i.test(uid)) {
      pushToast({ type: 'error', text: 'Informe o UID da TAG (hex).' });
      return;
    }

    try {
      setLoadingBind(true);
      await api.post('/api/ardloc/bind', { uid, id_os: Number(idOrdem) });
      setBoundUid(uid);
      setCacheBound(idOrdem, uid);
      await fetchBoundList(idOrdem);
      pushToast({ type: 'success', text: `TAG ${uid} vinculada à OS ${idOrdem}.` });
    } catch (e: any) {
      pushToast({ type: 'error', text: e?.response?.data?.erro || 'Falha ao vincular TAG.' });
    } finally {
      setLoadingBind(false);
    }
  };

  // ❌ Desvincular TAG da OS
  const unbindTag = async () => {
    const uid = (uidTag || '').trim().toUpperCase();
    if (!/^[0-9A-F]{8,}$/i.test(uid)) {
      pushToast({ type: 'error', text: 'Informe o UID da TAG para desvincular.' });
      return;
    }

    try {
      setLoadingUnbind(true);
      await api.post('/api/ardloc/unbind', { uid });
      setBoundUid('');
      if (idOrdem) {
        localStorage.removeItem(cacheKey(idOrdem));
        await fetchBoundList(idOrdem);
      }
      pushToast({ type: 'error', text: `TAG ${uid} desvinculada.` }); // vermelho
    } catch (e: any) {
      pushToast({ type: 'error', text: e?.response?.data?.erro || 'Falha ao desvincular TAG.' });
    } finally {
      setLoadingUnbind(false);
    }
  };

  return (
    <MenuLateral>
      {/* 🔔 Toasts (top-right) */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              minWidth: 260,
              maxWidth: 420,
              padding: '10px 14px',
              borderRadius: 10,
              color: '#fff',
              background:
                t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#dc2626' : '#2563eb',
              boxShadow: '0 8px 24px rgba(0,0,0,.2)',
              fontWeight: 600,
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      <h1 className="titulo-clientes">ALTERAR ORDEM DE SERVIÇO</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>👤 CLIENTE</span>
              <input
                type="text"
                value={nomeCliente}
                disabled
                title="Não é possível alterar o cliente após o cadastro da ordem."
                className="input-estilizado"
              />
            </label>

            <label>
              <span>🔧 EQUIPAMENTO</span>
              <input
                type="text"
                value={equipamentoInfo}
                disabled
                title="Não é possível alterar o equipamento após o cadastro da ordem."
                className="input-estilizado"
              />
            </label>

            <label>
              <span>🏢 LOCAL</span>
              <select
                value={idLocal}
                onChange={(e) => {
                  const novoId = e.target.value;
                  setIdLocal(novoId);

                  const localSelecionado = locais.find(loc => loc.id_scanner === novoId);
                  if (localSelecionado) {
                    setStatusDescricao(localSelecionado.status_interno);
                    setStatus(Number(localSelecionado.id_status || 0));
                  } else {
                    setStatusDescricao('');
                    setStatus(0);
                  }
                }}
                required
              >
                <option value="">Selecione o local</option>
                {locais.map(loc => (
                  <option key={loc.id_scanner} value={loc.id_scanner}>
                    {loc.local_instalado}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>📌 STATUS</span>
              <input
                type="text"
                value={statusDescricao}
                disabled
                title="Não é possível alterar o status diretamente. O status é definido pelo local."
                className="input-estilizado input-disabled"
              />
            </label>

            {/* 👇 Só técnico vê e edita */}
            {isTecnico && (
              <label>
                <span>🧰 DESCRIÇÃO DO SERVIÇO (técnico)</span>
                <textarea
                  value={descricaoServico}
                  onChange={(e) => setDescricaoServico(e.target.value)}
                  rows={3}
                  placeholder="Descreva o que foi/será executado no item"
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    resize: 'vertical',
                  }}
                />
              </label>
            )}

            <label>
              <span>🏷️ TAG CADASTRADA NA OS</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="text" value={boundUid || '—'} readOnly style={{ cursor: 'not-allowed' }} />
                <button
                  type="button"
                  className="btn preto"
                  onClick={() => idOrdem && fetchBoundUidFromApi(idOrdem)}
                  disabled={loadingBoundUid || !idOrdem}
                >
                  {loadingBoundUid ? 'ATUALIZANDO...' : 'ATUALIZAR'}
                </button>
              </div>

              {boundList.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <small style={{ opacity: .7 }}>TAGs vinculadas a esta OS:</small>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                    {boundList.map(({ uid, desde }) => (
                      <li key={uid}>
                        <code>{uid}</code>{' '}
                        {desde && <small style={{ opacity: .6 }}>— desde {new Date(desde).toLocaleString('pt-BR')}</small>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </label>

            {/* 🔗 RFID */}
            <div style={{ marginTop: 16, background: '#fff', border: '1px solid #ddd', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 10 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>Leitor (escuta):</span>
                  <select
                    value={leitorEscutado}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setLeitorEscutado(v);
                      localStorage.setItem('leitor_codigo_front', v);
                    }}
                    style={{ background: '#000', color: '#fff', border: '1px solid #555', padding: 6, borderRadius: 6, minWidth: 220 }}
                  >
                    <option value="">Selecione o leitor</option>
                    {leitores.map((l) => (
                      <option key={l.codigo} value={l.codigo}>
                        {l.nome || l.codigo}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={autoFill}
                    onChange={(e) => {
                      setAutoFill(e.target.checked);
                      localStorage.setItem('rfid_autofill', e.target.checked ? '1' : '0');
                    }}
                  />
                  <span>Preencher UID automaticamente quando passar a TAG</span>
                </label>
              </div>

              <p style={{ margin: '6px 0 12px 0', color: '#666' }}>
                Passe a TAG no leitor configurado ou insira manualmente o UID abaixo.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={uidTag}
                  onChange={(e) => setUidTag(e.target.value.toUpperCase())}
                  placeholder="UID da TAG (hex)"
                  style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '1px solid #555',
                    padding: '10px 12px',
                    borderRadius: 6,
                    letterSpacing: '1px',
                    minWidth: 220,
                  }}
                />
                <button
                  type="button"
                  className="btn preto"
                  onClick={async () => {
                    if (!leitorEscutado) {
                      pushToast({ type: 'error', text: 'Selecione o leitor.' });
                      return;
                    }
                    try {
                      const { data } = await api.get('/api/ardloc/last-uid', { params: { leitor: leitorEscutado, maxAgeSec: 10 } });
                      if (data?.uid) setUidTag(String(data.uid).toUpperCase());
                      else pushToast({ type: 'info', text: 'Nenhum UID recente para este leitor.' });
                    } catch {
                      pushToast({ type: 'error', text: 'Falha ao ler UID.' });
                    }
                  }}
                >
                  LER AGORA
                </button>
                <button type="button" className="btn azul" onClick={bindTag} disabled={loadingBind || !idOrdem || !uidTag}>
                  {loadingBind ? 'VINCULANDO...' : 'VINCULAR'}
                </button>
                <button type="button" className="btn vermelho" onClick={unbindTag} disabled={loadingUnbind || !uidTag}>
                  {loadingUnbind ? 'DESVINCULANDO...' : 'DESVINCULAR'}
                </button>
              </div>
            </div>

            <div className="acoes-clientes" style={{ marginTop: 24 }}>
              <button type="submit" className="btn azul">SALVAR</button>
              <button
                type="button"
                className="btn preto"
                onClick={() => {
                  localStorage.removeItem("ordemSelecionada");
                  navigate('/ordemservico');
                }}
              >
                CANCELAR
              </button>
            </div>

            <div className="voltar-container" style={{ marginTop: 20 }}>
              <button className="btn roxo" type="button" onClick={() => setShowModal(true)}>
                VOLTAR
              </button>
            </div>
          </form>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR ?</strong>
              <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
            </div>
            <p>Deseja mesmo sair sem salvar?</p>
            <p><strong>Cliente:</strong> {nomeCliente}</p>
            <button
              className="btn azul"
              onClick={() => {
                localStorage.removeItem("ordemSelecionada");
                navigate('/ordemservico');
              }}
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>✅ Sucesso!</strong>
              <button className="close-btn" onClick={() => {
                setShowSuccessModal(false);
                localStorage.removeItem("ordemSelecionada");
                navigate('/ordemservico');
              }}>X</button>
            </div>
            <p>Ordem de serviço atualizada com sucesso!</p>
            <div className="modal-footer">
              <button className="btn azul" onClick={() => {
                setShowSuccessModal(false);
                localStorage.removeItem("ordemSelecionada");
                navigate('/ordemservico');
              }}>OK</button>
            </div>
          </div>
        </div>
      )}
    </MenuLateral>
  );
};

export default AlterarOrdem;
