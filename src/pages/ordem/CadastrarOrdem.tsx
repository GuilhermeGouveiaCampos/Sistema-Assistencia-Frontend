import React, { useState, useEffect } from 'react';
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
    return hoje.toISOString().split('T')[0]; // ✅ formato yyyy-MM-dd
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
          s.descricao.toLowerCase().includes("recebido")
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
        const recepcao = res.data.find((loc: Local) =>
          loc.local_instalado.toLowerCase().includes("recepção")
        );
        if (recepcao) {
          setIdLocal(recepcao.id_scanner);
        }
      })
      .catch(err => console.error("Erro ao buscar locais:", err));
  }, []);

  interface Equipamento {
    id_equipamento: number;
    tipo: string;
    marca: string;
    modelo: string;
    numero_serie: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    } catch (error: any) {
      console.error("❌ Erro ao cadastrar OS:", error);
      alert("Erro ao cadastrar ordem de serviço.");
    }
  };

  const handleEquipamentoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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

    } catch (error: any) {
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

  const handleClienteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = Number(e.target.value);
    setSelectedClienteId(clienteId);
    setIdCliente(clienteId.toString()); // ✅ sincroniza o value
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

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">CADASTRAR ORDEM DE SERVIÇO</h1>
        <section className="clientes-section">
          <div className="container-central">
            <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
              
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

              <label>
                <span>🏢 LOCAL</span>
                <select
                  value={idLocal}
                  disabled
                  title="Este campo está travado para 'Recepção'"
                  style={{
                    backgroundColor: "#000",   // preto
                    color: "#fff",             // texto branco
                    cursor: "not-allowed",     // cursor travado
                    border: "1px solid #555"   // borda discreta (opcional)
                  }}
                >
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
                  readOnly
                  style={{
                    backgroundColor: "#000",
                    color: "#fff",
                    cursor: "not-allowed",
                    border: "1px solid #555"
                  }}
                />
              </label>

              <label>
                <span>📅 DATA DE ENTRADA</span>
                <input type="date" value={dataCriacao} onChange={(e) => setDataCriacao(e.target.value)} required />
              </label>

              <div className="acoes-clientes">
                <button type="submit" className="btn azul">SALVAR</button>
                <button type="button" className="btn preto" onClick={() => navigate('/ordemservico')}>CANCELAR</button>
              </div>
            </form>
          </div>
        </section>

        <section className="container">
          {/* todo o conteúdo do form */}
        </section>

        {/* ✅ MODAL DE SUCESSO NO LUGAR CERTO */}
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
