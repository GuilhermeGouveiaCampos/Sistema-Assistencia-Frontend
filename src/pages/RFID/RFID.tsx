import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import MenuLateral from '../../components/MenuLateral'; // ✅

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

interface Local {
  id_scanner: string;
  local_instalado: string;
  status: string;
  status_interno: string;
}

const RFID: React.FC = () => {
  const navigate = useNavigate();
  const [locais, setLocais] = useState<Local[]>([]);
  const [localFiltro, setLocalFiltro] = useState('');
  const [localSelecionado, setLocalSelecionado] = useState<Local | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  const consultarLocais = async () => {
    try {
      const res = await api.get<Local[]>('/api/locais', {
        params: { local: localFiltro },
      });
      setLocais(res.data);
      setLocalSelecionado(null);
    } catch (error) {
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

  const selecionarLocal = (idScanner: string) => {
    const local = locais.find(l => l.id_scanner === idScanner) || null;
    setLocalSelecionado(prev => (prev?.id_scanner === idScanner ? null : local));
    if (local) console.log('✓ Local selecionado:', local.id_scanner);
  };

  const inativarLocal = async () => {
    if (!localSelecionado || motivo.trim() === '') return;

    try {
      await api.put(`/api/locais/${localSelecionado.id_scanner}`, {
        status: 'inativo',
        motivo_inativacao: motivo,
      });
      setMostrarModal(false);
      consultarLocais();
    } catch (error) {
      console.error('Erro ao inativar local:', error);
      alert('Falha ao inativar. Verifique o backend ou os dados enviados.');
      setMostrarModal(false);
    }
  };

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">LOCAL INSTALADO</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="filtros-clientes">
            <input
              type="text"
              placeholder="LOCAL INSTALADO"
              value={localFiltro}
              onChange={(e) => setLocalFiltro(e.target.value)}
            />
            <button className="btn roxo-claro" onClick={consultarLocais}>CONSULTAR</button>
          </div>

          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>ID SCANNER</th>
                  <th>LOCAL INSTALADO</th>
                  <th>STATUS INTERNO</th>
                </tr>
              </thead>
              <tbody>
                {locais.map((loc) => (
                  <tr
                    key={loc.id_scanner}
                    onClick={() => selecionarLocal(loc.id_scanner)}
                    className={localSelecionado?.id_scanner === loc.id_scanner ? 'linha-selecionada' : ''}
                  >
                    <td>{loc.id_scanner}</td>
                    <td>{loc.local_instalado}</td>
                    <td>{loc.status_interno}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="acoes-clientes">
            <button className="btn azul" onClick={() => navigate('/rfid/cadastrar')}>CADASTRAR</button>

            <button
              className="btn preto"
              disabled={!localSelecionado}
              onClick={() => {
                if (localSelecionado) {
                  localStorage.setItem('localSelecionado', JSON.stringify(localSelecionado));
                  navigate('/rfid/editar');
                }
              }}
            >ALTERAR</button>

            <button
              className="btn vermelho"
              disabled={!localSelecionado}
              onClick={() => {
                setMotivo('');
                setMostrarModal(true);
              }}
            >EXCLUIR</button>

            <button
              className="btn roxo-claro"
              onClick={() => navigate('/rfid/inativos')}
            >INATIVOS</button>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate('/')}>VOLTAR</button>
          </div>
        </div>
      </section>

      {/* Modal para motivo da inativação */}
      {mostrarModal && localSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>INATIVAR LOCAL</strong>
              <button className="close-btn" onClick={() => setMostrarModal(false)}>X</button>
            </div>
            <div className="modal-body">
              <p>Deseja inativar o local <strong>{localSelecionado.local_instalado}</strong>?</p>
              <label>
                <span>📝 MOTIVO DA INATIVAÇÃO</span>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o motivo..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '16px',
                    border: 'none',
                    marginTop: '5px'
                  }}
                />
              </label>
              <div className="modal-actions">
                <button className="btn azul" onClick={inativarLocal}>CONFIRMAR</button>
                <button className="btn preto" onClick={() => setMostrarModal(false)}>CANCELAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MenuLateral>
  );
};

export default RFID;
