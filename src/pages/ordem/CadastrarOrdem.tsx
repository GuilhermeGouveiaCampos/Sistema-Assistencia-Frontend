import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/Dashboard.css';
import '../Css/Cadastrar.css';
import { buscarTecnicoMenosCarregado } from '../../services/tecnicosService';
import ModalSucesso from '../../components/ModalSucesso';
import MenuLateral from '../../components/MenuLateral';

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
}

interface Tecnico {
  id_tecnico: number;
  nome: string;
  cpf: string;
  especializacao: string;
}

interface Local {
  id_scanner: string;
  local_instalado: string;
  status_interno: string;
}

interface Equipamento {
  id_equipamento: number;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
}

/** ------------ IMAGENS: tipos auxiliares ------------ */
type PreviewFile = {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
};

const genId = () =>
  (window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

const CadastrarOrdem: React.FC = () => {
  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id") || "";

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [statusInterno, setStatusInterno] = useState('');

  const [idCliente, setIdCliente] = useState('');
  const [idTecnico, setIdTecnico] = useState('');
  const [idLocal, setIdLocal] = useState('');
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [dataCriacao, setDataCriacao] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0]; // ✅ yyyy-MM-dd
  });

  const [showDropdownEquip, setShowDropdownEquip] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [showDropdownTecnico, setShowDropdownTecnico] = useState(false);
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<number | null>(null);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [idEquipamento, setIdEquipamento] = useState('');
  const [selectedEquipamentoId, setSelectedEquipamentoId] = useState<number | null>(null);

  const [statusLista, setStatusLista] = useState<any[]>([]);
  const statusDescricao = statusLista.find(s => s.id_status === Number(statusInterno))?.descricao || '';
  const [showTecnicoAutoModal, setShowTecnicoAutoModal] = useState(false);

  /** ------------ IMAGENS: estado e refs ------------ */
  const [imagens, setImagens] = useState<PreviewFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        const statusRecebido = res.data.find((s: any) =>
          String(s.descricao || '').toLowerCase().includes("recebido")
        );
        if (statusRecebido) {
          setStatusInterno(statusRecebido.id_status);
        }
      })
      .catch(err => console.error("Erro ao buscar status:", err));

    // Buscar locais
    api.get('/api/locais')
      .then(res => {
        setLocais(res.data);
        const recepcao = (res.data as Local[]).find((loc: Local) =>
          String(loc.local_instalado || '').toLowerCase().includes("recepção")
        );
        if (recepcao) {
          setIdLocal(recepcao.id_scanner);
        }
      })
      .catch(err => console.error("Erro ao buscar locais:", err));

    // cleanup dos object URLs se o usuário sair da página
    return () => {
      imagens.forEach(p => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ------------ SUBMIT ------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Quando houver imagens, enviamos tudo via FormData (multipart)
      if (imagens.length > 0) {
        const form = new FormData();
        if (selectedClienteId != null) form.append('id_cliente', String(selectedClienteId));
        if (selectedTecnicoId != null) form.append('id_tecnico', String(selectedTecnicoId));
        if (selectedEquipamentoId != null) form.append('id_equipamento', String(selectedEquipamentoId));
        form.append('id_local', idLocal);
        form.append('id_status_os', String(statusInterno));
        form.append('descricao_problema', descricaoProblema);
        form.append('data_criacao', dataCriacao);

        imagens.forEach(p => form.append('imagens', p.file));

        const response = await api.post('/api/ordens', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        console.log("🟢 RESPOSTA:", response.status, response.data);

        if (response.status === 201) {
          setShowSuccessModal(true);
        }
      } else {
        // Sem imagens → JSON como antes
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
        if (response.status === 201) {
          setShowSuccessModal(true);
        }
      }
    } catch (error: any) {
      console.error("❌ Erro ao cadastrar OS:", error);
      alert(error?.response?.data?.erro || "Erro ao cadastrar ordem de serviço.");
    }
  };

  /** ------------ EQUIPAMENTO / TÉCNICO AUTO ------------ */
  const handleEquipamentoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const equipamentoId = Number(e.target.value);
    setSelectedEquipamentoId(equipamentoId);

    const equipamentoSelecionado = equipamentos.find(eq => eq.id_equipamento === equipamentoId);
    if (!equipamentoSelecionado) {
      alert("Equipamento não encontrado.");
      return;
    }

    const tipoEquipamento = equipamentoSelecionado.tipo;

    try {
      const encodedTipo = encodeURIComponent(tipoEquipamento);
      const response = await api.get(`/api/tecnicos/menos-carregados/${encodedTipo}`);
      const tecnico = response.data;

      setIdTecnico(`${tecnico.nome} - AUTO`);
      setSelectedTecnicoId(tecnico.id_tecnico);

      // ✅ Toast de sucesso
      const toast = document.createElement('div');
      toast.textContent = `👨‍🔧 Técnico ${tecnico.nome} atribuído automaticamente`;
      toast.style.cssText = `
        position: fixed;
        top: 20px; right: 20px;
        background: #4caf50; color: white;
        padding: 10px 15px; border-radius: 5px;
        z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);

    } catch (error: any) {
      console.error("Erro ao buscar técnico automaticamente:", error);

      // 🟠 Toast de aviso
      const aviso = document.createElement('div');
      aviso.textContent = "⚠️ Nenhum técnico disponível com essa especialização. Escolha manualmente.";
      aviso.style.cssText = `
        position: fixed;
        top: 20px; right: 20px;
        background: #ff9800; color: white;
        padding: 10px 15px; border-radius: 5px;
        z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(aviso);
      setTimeout(() => aviso.remove(), 3500);
    }
  };

  const handleClienteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = Number(e.target.value);
    setSelectedClienteId(clienteId);
    setIdCliente(clienteId.toString());
    try {
      const response = await api.get(`/api/equipamentos/por-cliente/${clienteId}`);
      setEquipamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar equipamentos por cliente:", error);
    }
  };

  function formatarCPF(cpf: string) {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  }

  /** ------------ IMAGENS: handlers ------------ */
  const handleSelectImagens = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const accepted = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    const maxEach = 5 * 1024 * 1024; // 5MB
    const maxTotal = 20;

    const atuais = [...imagens];
    for (const f of files) {
      if (!accepted.includes(f.type)) continue;
      if (f.size > maxEach) continue;
      if (atuais.length >= maxTotal) break;

      const preview: PreviewFile = {
        id: genId(),
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      };
      atuais.push(preview);
    }
    setImagens(atuais);

    // limpa o input pra permitir adicionar o mesmo arquivo novamente se quiser
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removerImagem = (id: string) => {
    setImagens((prev) => {
      const alvo = prev.find(p => p.id === id);
      if (alvo) URL.revokeObjectURL(alvo.url);
      return prev.filter(p => p.id !== id);
    });
  };

  const limparTodasImagens = () => {
    imagens.forEach(p => URL.revokeObjectURL(p.url));
    setImagens([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">CADASTRAR ORDEM DE SERVIÇO</h1>
      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>

            {/* CLIENTE */}
            <label>
              <span>👤 CLIENTE</span>
              <select value={selectedClienteId ?? ''} onChange={handleClienteChange}>
                <option value="">Selecione o cliente</option>
                {clientes.map(cli => (
                  <option key={cli.id_cliente} value={cli.id_cliente}>
                    {cli.nome} - {formatarCPF(cli.cpf)}
                  </option>
                ))}
              </select>
            </label>

            {/* EQUIPAMENTO */}
            <label>
              <span>🔧 EQUIPAMENTO</span>
              <select
                value={selectedEquipamentoId ?? ''}
                onChange={handleEquipamentoChange}
                required
              >
                <option value="">Selecione o equipamento</option>
                {equipamentos.map(eq => (
                  <option key={eq.id_equipamento} value={eq.id_equipamento}>
                    {eq.tipo} - {eq.marca} - {eq.numero_serie}
                  </option>
                ))}
              </select>
            </label>

            {/* DESCRIÇÃO */}
            <label>
              <span>📝 DESCRIÇÃO DO PROBLEMA</span>
              <textarea
                value={descricaoProblema}
                onChange={(e) => setDescricaoProblema(e.target.value)}
                rows={4}
                placeholder="Informe o que o cliente relatou sobre o problema"
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  resize: "vertical"
                }}
                required
              />
            </label>

            {/* TÉCNICO (auto + pesquisa) */}
            <label className="autocomplete-container">
              <span>👨‍🔧 TÉCNICO</span>
              <input
                type="text"
                className="input-pesquisavel"
                placeholder="Busque por nome ou CPF"
                value={idTecnico}
                onChange={(e) => {
                  const input = e.target.value;
                  const cpfFormatado = formatarCPF(input);
                  setIdTecnico(cpfFormatado);
                  setShowDropdownTecnico(true);
                }}
                onFocus={() => setShowDropdownTecnico(true)}
                onBlur={() => setTimeout(() => setShowDropdownTecnico(false), 200)}
              />

              {showDropdownTecnico && (
                <ul className="autocomplete-dropdown">
                  {tecnicos
                    .filter(tec =>
                      `${tec.nome} ${tec.cpf}`.replace(/\D/g, '').toLowerCase()
                        .includes(idTecnico.replace(/\D/g, '').toLowerCase())
                    )
                    .map(tec => (
                      <li
                        key={tec.id_tecnico}
                        onClick={() => {
                          setIdTecnico(`${tec.nome} - ${tec.cpf}`);
                          setSelectedTecnicoId(tec.id_tecnico);
                          setShowDropdownTecnico(false);
                        }}
                      >
                        {tec.nome} - {tec.cpf}
                      </li>
                    ))}
                </ul>
              )}
            </label>

            {/* LOCAL (travado em Recepção) */}
            <label>
              <span>🏢 LOCAL</span>
              <select
                value={idLocal}
                disabled
                title="Este campo está travado para 'Recepção'"
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  cursor: "not-allowed",
                  border: "1px solid #555"
                }}
              >
                {locais.map(loc => (
                  <option key={loc.id_scanner} value={loc.id_scanner}>
                    {loc.local_instalado}
                  </option>
                ))}
              </select>
            </label>

            {/* STATUS (somente leitura) */}
            <label>
              <span>📌 STATUS</span>
              <input
                type="text"
                value={statusDescricao}
                readOnly
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  cursor: "not-allowed",
                  border: "1px solid #555"
                }}
              />
            </label>

            {/* DATA DE ENTRADA */}
            <label>
              <span>📅 DATA DE ENTRADA</span>
              <input
                type="date"
                value={dataCriacao}
                onChange={(e) => setDataCriacao(e.target.value)}
                required
              />
            </label>

            {/* ====== IMAGENS (NOVO) ====== */}
            <div style={{ marginTop: 16 }}>
              <span style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                📷 IMAGENS (opcional)
              </span>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <label
                  htmlFor="imagens-os"
                  style={{
                    border: "1px dashed #777",
                    borderRadius: 8,
                    padding: "10px 14px",
                    cursor: "pointer",
                    userSelect: "none",
                    background: "#0c0c0c",
                  }}
                  title="Clique para selecionar imagens"
                >
                  + Adicionar imagens
                </label>

                {imagens.length > 0 && (
                  <button
                    type="button"
                    onClick={limparTodasImagens}
                    style={{
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: "#444",
                      color: "#fff",
                    }}
                    title="Remover todas as imagens selecionadas"
                  >
                    Limpar todas
                  </button>
                )}
              </div>

              <input
                id="imagens-os"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectImagens}
                style={{ display: "none" }}
              />

              {/* GRID de previews */}
              {imagens.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 12,
                  }}
                >
                  {imagens.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        border: "1px solid #333",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#111",
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                      />
                      <button
                        type="button"
                        onClick={() => removerImagem(img.id)}
                        title="Remover imagem"
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "rgba(0,0,0,0.65)",
                          border: "1px solid #666",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ====== /IMAGENS ====== */}

            <div className="acoes-clientes" style={{ marginTop: 16 }}>
              <button type="submit" className="btn azul">SALVAR</button>
              <button type="button" className="btn preto" onClick={() => navigate('/ordemservico')}>CANCELAR</button>
            </div>
          </form>
        </div>
      </section>

      <section className="container">{/* todo o conteúdo do form */}</section>

      {/* ✅ MODAL DE SUCESSO */}
      {showSuccessModal && (
        <ModalSucesso
          onClose={() => {
            setShowSuccessModal(false);
            navigate('/ordemservico');
          }}
        />
      )}
    </MenuLateral>
  );
};

export default CadastrarOrdem;
