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
  cpf?: string | null;
  especializacao?: string | null;
};

const show = (v?: string | null) =>
  v && String(v).trim() ? String(v) : "N/D";

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
              <td>{show(tec.nome)}</td>
            </tr>
            <tr>
              <th>Telefone</th>
              <td>{show(tec.telefone)}</td>
            </tr>
            <tr>
              <th>CPF</th>
              <td>{show(tec.cpf)}</td>
            </tr>
            <tr>
              <th>Especialização</th>
              <td>{show(tec.especializacao)}</td>
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
