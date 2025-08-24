import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';

// ✅ cliente axios central
import api from '../../services/api';

interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
  motivo_inativacao: string;
}

const ClientesInativos: React.FC = () => {
  const navigate = useNavigate();
  const [clientesInativos, setClientesInativos] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const carregarInativos = async () => {
    try {
      const { data } = await api.get("/api/clientes/inativos");

      // 🔒 Normaliza para array SEMPRE
      const lista: Cliente[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.rows)
        ? (data as any).rows
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];

      setClientesInativos(lista);
    } catch (error) {
      console.error("Erro ao buscar clientes inativos:", error);
      setClientesInativos([]); // evita crash no map
    }
  };

  const ativarCliente = async (id: number) => {
    try {
      await api.put(`/api/clientes/ativar/${id}`);
      carregarInativos();
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao ativar cliente:", error);
    }
  };

  const confirmarAtivacao = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setShowModal(true);
  };

  const cancelar = () => {
    setClienteSelecionado(null);
    setShowModal(false);
  };

  useEffect(() => {
    carregarInativos();
  }, []);

  return (
    <MenuLateral>
      {showModal && clienteSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR ✅</strong>
              <button className="close-btn" onClick={cancelar}>X</button>
            </div>
            <div className="modal-body">
              <p>
                Deseja realmente reativar o cliente{" "}
                <strong>{clienteSelecionado.nome}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn azul"
                onClick={() => ativarCliente(clienteSelecionado.id_cliente)}
              >
                CONFIRMAR
              </button>
              <button className="btn preto" onClick={cancelar}>
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="titulo-clientes">CLIENTES INATIVOS</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="tabela-clientes inativos">
            <table>
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>CPF</th>
                  <th>MOTIVO</th>
                  <th>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {clientesInativos.length > 0 ? (
                  clientesInativos.map((cli) => (
                    <tr key={cli.id_cliente}>
                      <td>{cli.nome}</td>
                      <td>{cli.cpf}</td>
                      <td>{cli.motivo_inativacao}</td>
                      <td>
                        <button
                          className="btn verde"
                          onClick={() => confirmarAtivacao(cli)}
                        >
                          ATIVAR
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 12 }}>
                      Nenhum cliente inativo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate('/clientes')}>
              VOLTAR
            </button>
          </div>
        </div>
      </section>
    </MenuLateral>
  );
};

export default ClientesInativos;
