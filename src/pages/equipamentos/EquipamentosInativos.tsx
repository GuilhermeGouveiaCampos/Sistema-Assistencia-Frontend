import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";

// ✅ cliente axios central
import api from "../../services/api";

interface Equipamento {
  id_equipamento: number;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado: string;
  status: string;
}

const EquipamentosInativos: React.FC = () => {
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id");
  const navigate = useNavigate();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  const carregarEquipamentos = async () => {
    try {
      const response = await api.get("/api/equipamentos/inativos");
      setEquipamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar equipamentos inativos:", error);
    }
  };

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  const ativarEquipamento = async (id: number) => {
    try {
      await api.put(`/api/equipamentos/ativar/${id}`);
      setEquipamentos(prev => prev.filter(eq => eq.id_equipamento !== id));
    } catch (error) {
      console.error("Erro ao reativar equipamento:", error);
    }
  };

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">EQUIPAMENTOS INATIVOS</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>TIPO</th>
                  <th>MARCA</th>
                  <th>MODELO</th>
                  <th>Nº SÉRIE</th>
                  <th>ESTADO</th>
                  <th>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {equipamentos.map((eq) => (
                  <tr key={eq.id_equipamento}>
                    <td>{eq.tipo}</td>
                    <td>{eq.marca}</td>
                    <td>{eq.modelo}</td>
                    <td>{eq.numero_serie}</td>
                    <td>{eq.estado}</td>
                    <td>
                      <button
                        className="btn verde"
                        onClick={() => ativarEquipamento(eq.id_equipamento)}
                      >
                        ATIVAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate("/equipamentos")}>
              VOLTAR
            </button>
          </div>
        </div>
      </section>
    </MenuLateral>
  );
};

export default EquipamentosInativos;
