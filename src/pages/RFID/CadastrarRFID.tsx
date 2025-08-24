import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import MenuLateral from '../../components/MenuLateral';

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

const CadastrarLocalRFID: React.FC = () => {
  const navigate = useNavigate();

  const [idScanner, setIdScanner] = useState('');
  const [localInstalado, setLocalInstalado] = useState('');
  const [statusInterno, setStatusInterno] = useState('');
  const [status, setStatus] = useState('ativo');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/api/locais', {
        id_scanner: idScanner,
        local_instalado: localInstalado,
        status_interno: statusInterno,
        status: status,
      });
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao cadastrar local:', error);
      alert('Erro ao cadastrar local.');
    }
  };

  return (
    <MenuLateral>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>SUCESSO ✅</strong>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  navigate('/rfid');
                }}
              >
                X
              </button>
            </div>
            <div className="modal-body">
              <p>
                Local <strong>{idScanner}</strong> cadastrado com sucesso!
              </p>
              <button className="btn azul" onClick={() => navigate('/rfid')}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="titulo-clientes">CADASTRAR LOCAL RFID</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>🔤 ID SCANNER</span>
              <input
                type="text"
                placeholder="Ex: LOC001"
                value={idScanner}
                onChange={(e) => setIdScanner(e.target.value)}
                required
              />
            </label>

            <label>
              <span>📍 LOCAL INSTALADO</span>
              <input
                type="text"
                placeholder="Ex: Bancada de Teste"
                value={localInstalado}
                onChange={(e) => setLocalInstalado(e.target.value)}
                required
              />
            </label>

            <label>
              <span>📌 STATUS INTERNO</span>
              <input
                type="text"
                placeholder="Ex: Finalizado"
                value={statusInterno}
                onChange={(e) => setStatusInterno(e.target.value)}
                required
              />
            </label>

            <label>
              <span>📊 STATUS</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">
                SALVAR
              </button>
              <button
                type="button"
                className="btn vermelho-claro"
                onClick={() => navigate('/rfid')}
              >
                CANCELAR
              </button>
            </div>

            <div className="voltar-container">
              <button className="btn roxo" onClick={() => navigate('/rfid')}>
                VOLTAR
              </button>
            </div>
          </form>
        </div>
      </section>
    </MenuLateral>
  );
};

export default CadastrarLocalRFID;
