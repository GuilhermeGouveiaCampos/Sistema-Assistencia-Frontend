import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Pesquisa.css";
import "../dashboard/Dashboard.css";
import MenuLateral from "../../components/MenuLateral";

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";

interface OrdemInativa {
  id_ordem: number;
  nome_cliente: string;
  tipo_equipamento: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  data_entrada: string;
  descricao_problema: string | null;
  motivo_inativacao: string | null;
}

const OrdensInativas: React.FC = () => {
  const navigate = useNavigate();

  const [ordensInativas, setOrdensInativas] = useState<OrdemInativa[]>([]);
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemInativa | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const carregarOrdens = async () => {
    setCarregando(true);
    try {
      console.log("📡 GET /api/ordens/inativas");
      const { data } = await api.get<OrdemInativa[]>("/api/ordens/inativas");
      console.log("📦 Inativas recebidas:", data);
      setOrdensInativas(data);
    } catch (error) {
      console.error("❌ Erro ao carregar ordens inativas:", error);
    } finally {
      setCarregando(false);
    }
  };

  const ativarOrdem = async (id: number) => {
    try {
      console.log("🛠️ PUT /api/ordens/ativar/" + id);
      await api.put(`/api/ordens/ativar/${id}`);
      setShowModal(false);
      await carregarOrdens();
    } catch (error) {
      console.error("❌ Erro ao ativar ordem:", error);
    }
  };

  const confirmarAtivacao = (ordem: OrdemInativa) => {
    setOrdemSelecionada(ordem);
    setShowModal(true);
  };

  const cancelar = () => {
    setShowModal(false);
    setOrdemSelecionada(null);
  };

  useEffect(() => {
    carregarOrdens();
  }, []);

  return (
    <MenuLateral>
      {showModal && ordemSelecionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR ✅</strong>
              <button className="close-btn" onClick={cancelar}>X</button>
            </div>
            <div className="modal-body">
              <p>
                Deseja reativar a ordem do equipamento{" "}
                <strong>
                  {ordemSelecionada.tipo_equipamento || "Equipamento"}{" "}
                  {ordemSelecionada.marca || ""} {ordemSelecionada.modelo || ""}
                </strong>
                ?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn azul" onClick={() => ativarOrdem(ordemSelecionada.id_ordem)}>CONFIRMAR</button>
              <button className="btn preto" onClick={cancelar}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="titulo-clientes">ORDENS INATIVAS</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="tabela-clientes inativos">
            <table>
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>EQUIPAMENTO</th>
                  <th>MARCA</th>
                  <th>MODELO</th>
                  <th>SÉRIE</th>
                  <th>MOTIVO</th>
                  <th>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr><td colSpan={7}>Carregando...</td></tr>
                ) : ordensInativas.length === 0 ? (
                  <tr><td colSpan={7}>Nenhuma ordem inativa.</td></tr>
                ) : (
                  ordensInativas.map((ord) => (
                    <tr key={ord.id_ordem}>
                      <td>{ord.nome_cliente}</td>
                      <td>{ord.tipo_equipamento || "N/D"}</td>
                      <td>{ord.marca || "N/D"}</td>
                      <td>{ord.modelo || "N/D"}</td>
                      <td>{ord.numero_serie || "N/D"}</td>
                      <td>{ord.motivo_inativacao || "—"}</td>
                      <td>
                        <button className="btn verde" onClick={() => confirmarAtivacao(ord)}>
                          ATIVAR
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate("/ordemservico")}>VOLTAR</button>
          </div>
        </div>
      </section>
    </MenuLateral>
  );
};

export default OrdensInativas;
