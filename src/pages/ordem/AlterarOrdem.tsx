import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css'; 
import '../Css/Pesquisa.css';
import MenuLateral from "../../components/MenuLateral"; 

// ✅ cliente axios central
import api from '../../services/api';

const AlterarOrdem: React.FC = () => {
  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";

  const [idOrdem, setIdOrdem] = useState<number | null>(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [equipamentoInfo, setEquipamentoInfo] = useState('');
  const [status, setStatus] = useState<number>(0);
  const [descricao, setDescricao] = useState('');
  const [dataCriacao, setDataCriacao] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [idLocal, setIdLocal] = useState<string>('');
  const [statusDescricao, setStatusDescricao] = useState('');

  const [locais, setLocais] = useState<{
    id_local: number;
    id_scanner: number;
    local_instalado: string;
    status_interno: string;
    id_status: number;
  }[]>([]);

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
        const localAtual = res.data.find((loc: any) => loc.id_scanner === ordem.id_local);
        if (localAtual) {
          setStatusDescricao(localAtual.status_interno);
          setStatus(localAtual.id_status);
        }
      })
      .catch(err => console.error("Erro ao buscar locais:", err));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      alert('Erro ao atualizar ordem.');
    }
  };

  return (
    <MenuLateral>
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

                  const localSelecionado = locais.find(loc => loc.id_scanner.toString() === novoId);
                  if (localSelecionado) {
                    setStatusDescricao(localSelecionado.status_interno);
                    setStatus(localSelecionado.id_status);
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

            <label>
              <span>📝 DESCRIÇÃO DO PROBLEMA</span>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                placeholder="Informe o que o cliente relatou sobre o problema"
                required
                className="input-estilizado"
                style={{ resize: 'vertical' }}
              />
            </label>                                                                      

            <label>
              <span>📅 DATA DE CRIAÇÃO</span>
              <input
                type="text"
                value={dataCriacao}
                disabled
                className="input-estilizado"
              />
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">SALVAR</button>
              <button type="button" className="btn preto" onClick={() => {
                localStorage.removeItem("ordemSelecionada");
                navigate('/ordemservico');
              }}>CANCELAR</button>
            </div>

            <div className="voltar-container">
              <button className="btn roxo" type="button" onClick={() => setShowModal(true)}>VOLTAR</button>
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
