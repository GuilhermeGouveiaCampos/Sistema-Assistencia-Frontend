// src/pages/tecnicos/TecnicoDetalhe.tsx
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
  especializacao?: string | null;
  status?: string | null;
  id_usuario?: number | null;
  cpf?: string | null;               // vem do join com usuário
  data_nascimento?: string | null;   // se existir na tabela de usuário, mostramos
};

const fmtData = (iso?: string | null) => {
  if (!iso) return "N/D";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString("pt-BR");
};

const fmtCPF = (cpf?: string | null) => {
  if (!cpf) return "N/D";
  const d = cpf.replace(/\D/g, "").slice(0, 11);
  if (d.length !== 11) return cpf; // mostra cru se vier fora do padrão
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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
              <th>CPF</th>
              <td>{fmtCPF(tec.cpf)}</td>
            </tr>
            <tr>
              <th>Especialização</th>
              <td>{tec.especializacao || "N/D"}</td>
            </tr>
            <tr>
              <th>Telefone</th>
              <td>{tec.telefone || "N/D"}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{tec.status || "N/D"}</td>
            </tr>
            {/* Campos opcionais (mostramos se vierem do backend) */}
            <tr>
              <th>Data de nascimento</th>
              <td>{fmtData(tec.data_nascimento)}</td>
            </tr>
            <tr>
              <th>ID do usuário (vínculo)</th>
              <td>{tec.id_usuario ?? "N/D"}</td>
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
