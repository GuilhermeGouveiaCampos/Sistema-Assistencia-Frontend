import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import MenuLateral from '../../components/MenuLateral';

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

interface Local {
  id_scanner: string;
  local_instalado: string;
  status: string;
  status_interno: string;
}

const AlterarRFID: React.FC = () => {
  const navigate = useNavigate();

  const [local, setLocal] = useState<Local | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!local) return;

    const localAtualizado = {
      local_instalado: localInstalado,
      status_interno: statusInterno,
      status: status
    };

    try {
      await api.put(`/api/locais/${local.id_scanner}`, localAtualizado);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao atualizar local:', error);
      alert('Erro ao atualizar local.');
    }
  };

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">ALTERAR LOCAL RFID</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>🔠 ID SCANNER</span>
              <input type="text" value={local?.id_scanner || ''} disabled />
            </label>

            <label>
              <span>📍 LOCAL INSTALADO</span>
              <input type="text" value={localInstalado} onChange={(e) => setLocalInstalado(e.target.value)} required />
            </label>

            <label>
              <span>📌 STATUS INTERNO</span>
              <input type="text" value={statusInterno} onChange={(e) => setStatusInterno(e.target.value)} required />
            </label>

            <label>
              <span>📊 STATUS</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="">Selecione</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">SALVAR</button>
              <button
                type="button"
                className="btn preto"
                onClick={() => {
                  localStorage.removeItem("localSelecionado");
                  navigate('/rfid');
                }}
              >
                CANCELAR
              </button>
            </div>

            <div className="voltar-container">
              <button className="btn roxo" type="button" onClick={() => setShowModal(true)}>VOLTAR</button>
            </div>
          </form>
        </div>
      </section>

      {/* Modal de confirmação de saída */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR ?</strong>
              <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
            </div>
            <p>Deseja mesmo sair sem salvar?</p>
            <p><strong>Local:</strong> {local?.local_instalado}</p>
            <button
              className="btn azul"
              onClick={() => {
                localStorage.removeItem("localSelecionado");
                navigate('/rfid');
              }}
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>✅ Sucesso!</strong>
              <button
                className="close-btn"
                onClick={() => {
                  setShowSuccessModal(false);
                  localStorage.removeItem("localSelecionado");
                  navigate('/rfid');
                }}
              >X</button>
            </div>
            <p>Local <strong>{local?.local_instalado}</strong> atualizado com sucesso!</p>
            <div className="modal-footer">
              <button
                className="btn azul"
                onClick={() => {
                  setShowSuccessModal(false);
                  localStorage.removeItem("localSelecionado");
                  navigate('/rfid');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </MenuLateral>
  );
};

export default AlterarRFID;
