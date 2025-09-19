import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";

// ✅ cliente axios central
import api from "../../services/api";

type TecnicoDetalhe = {
  id_tecnico: number;
  nome: string;
  telefone?: string | null;
  data_nascimento?: string | null; // o backend deve enviar esse campo
};

const fmtData = (iso?: string | null) => {
  if (!iso) return "N/D";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso; // se vier "YYYY-MM-DD" sem timezone, ainda mostra algo
  return d.toLocaleDateString("pt-BR");
};

const TecnicoDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tec, setTec] = useState<TecnicoDetalhe | null | undefined>(null);

  useEffect(() => {
    const fetchTec = async () => {
      try {
        const { data } = await api.get(`/api/tecnicos/${id}`);
        if (!data || (data as any)?.erro) {
          setTec(undefined);
        } else {
          setTec(data as TecnicoDetalhe);
        }
      } catch (e) {
        console.error("❌ Erro ao buscar técnico:", e);
        setTec(undefined);
      }
    };
    fetchTec();
  }, [id]);

  if (tec === null) {
    return (
      <MenuLateral>
        <p>Carregando...</p>
      </MenuLateral>
    );
  }
  if (tec === undefined) {
    return (
      <MenuLateral>
        <p>Técnico não encontrado.</p>
      </MenuLateral>
    );
  }

  return (
    <MenuLateral>
      <div className="clientes-content">
        <h1 className="titulo-clientes">DETALHES DO TÉCNICO</h1>

        <table className="tabela-detalhes">
          <tbody>
            <tr>
              <th>Nome completo</th>
              <td>{tec.nome || "N/D"}</td>
            </tr>
            <tr>
              <th>Telefone</th>
              <td>{tec.telefone || "N/D"}</td>
            </tr>
            <tr>
              <th>Data de nascimento</th>
              <td>{fmtData(tec.data_nascimento)}</td>
            </tr>
          </tbody>
        </table>

        <div className="voltar-container">
          <button className="btn roxo" onClick={() => navigate(-1)}>
            VOLTAR
          </button>
        </div>
      </div>
    </MenuLateral>
  );
};

export default TecnicoDetalhe;
