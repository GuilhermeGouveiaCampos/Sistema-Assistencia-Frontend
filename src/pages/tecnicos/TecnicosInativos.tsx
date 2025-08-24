import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
import MenuLateral from "../../components/MenuLateral";

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";

interface Tecnico {
  id_tecnico: number;
  nome: string;
  cpf: string;
  telefone: string;
}

const TecnicosInativos: React.FC = () => {
  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const [tecnicosInativos, setTecnicosInativos] = useState<Tecnico[]>([]);

  const formatarCPF = (valor?: string): string => {
    if (!valor) return "";
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  };

  const formatarTelefone = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const buscarInativos = async () => {
    try {
      const res = await api.get<Tecnico[]>("/api/tecnicos/inativos");
      setTecnicosInativos(res.data);
    } catch (error) {
      console.error("Erro ao buscar técnicos inativos:", error);
    }
  };

  const ativarTecnico = async (id: number) => {
    try {
      await api.put(`/api/tecnicos/ativar/${id}`);
      buscarInativos(); // atualiza a lista
    } catch (error) {
      console.error("Erro ao ativar técnico:", error);
    }
  };

  useEffect(() => {
    buscarInativos();
  }, []);

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">TÉCNICOS INATIVOS</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>CPF</th>
                  <th>TELEFONE</th>
                  <th>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {tecnicosInativos.map((tec) => (
                  <tr key={tec.id_tecnico}>
                    <td>{tec.nome}</td>
                    <td>{formatarCPF(tec.cpf)}</td>
                    <td>{formatarTelefone(tec.telefone)}</td>
                    <td>
                      <button className="btn verde" onClick={() => ativarTecnico(tec.id_tecnico)}>
                        ATIVAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate("/tecnicos")}>VOLTAR</button>
          </div>
        </div>
      </section>
    </MenuLateral>
  );
};

export default TecnicosInativos;
