import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';
import MenuLateral from '../../components/MenuLateral'; // ✅ novo import

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

interface Local {
  id_scanner: string;
  local_instalado: string;
  status: string;
  motivo_inativacao: string;
}

const LocaisInativos: React.FC = () => {
  const navigate = useNavigate();
  const [locaisInativos, setLocaisInativos] = useState<Local[]>([]);

  const buscarInativos = async () => {
    try {
      const res = await api.get<Local[]>('/api/locais/inativos');
      setLocaisInativos(res.data);
    } catch (error) {
      console.error('Erro ao buscar locais inativos:', error);
    }
  };

  const ativarLocal = async (id: string) => {
    try {
      await api.put(`/api/locais/ativar/${id}`);
      buscarInativos(); // atualiza a lista
    } catch (error) {
      console.error('Erro ao ativar local:', error);
    }
  };

  useEffect(() => {
    buscarInativos();
  }, []);

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">LOCAIS INATIVOS</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>ID SCANNER</th>
                  <th>LOCAL INSTALADO</th>
                  <th>MOTIVO</th>
                  <th>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {locaisInativos.map((loc) => (
                  <tr key={loc.id_scanner}>
                    <td>{loc.id_scanner}</td>
                    <td>{loc.local_instalado}</td>
                    <td>{loc.motivo_inativacao}</td>
                    <td>
                      <button className="btn verde" onClick={() => ativarLocal(loc.id_scanner)}>
                        ATIVAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate('/rfid')}>VOLTAR</button>
          </div>
        </div>
      </section>
    </MenuLateral>
  );
};

export default LocaisInativos;
