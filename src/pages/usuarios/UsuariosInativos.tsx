import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
import MenuLateral from "../../components/MenuLateral";

// ✅ Cliente axios centralizado (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";

interface Usuario {
  id_usuario: number;
  nome: string;
  cpf: string;
  id_nivel: number;
  nome_nivel: string;
  status: string;
}

const UsuariosInativos: React.FC = () => {
  const navigate = useNavigate();
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const [usuariosInativos, setUsuariosInativos] = useState<Usuario[]>([]);

  const formatarCPF = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  };

  const buscarUsuariosInativos = async () => {
    try {
      const res = await api.get("/api/usuarios/inativos");
      setUsuariosInativos(res.data);
    } catch (error) {
      console.error("Erro ao buscar usuários inativos:", error);
    }
  };

  const ativarUsuario = async (id: number) => {
    try {
      await api.put(`/api/usuarios/${id}/ativar`);
      buscarUsuariosInativos(); // atualiza a lista
    } catch (error) {
      console.error("Erro ao ativar usuário:", error);
    }
  };

  useEffect(() => {
    buscarUsuariosInativos();
  }, []);

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">USUÁRIOS INATIVOS</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>NÍVEL</th>
                  <th>CPF</th>
                  <th>AÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {usuariosInativos.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td>{usuario.nome}</td>
                    <td>{usuario.nome_nivel}</td>
                    <td>{formatarCPF(usuario.cpf)}</td>
                    <td>
                      <button
                        className="btn verde"
                        onClick={() => ativarUsuario(usuario.id_usuario)}
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
            <button className="btn roxo" onClick={() => navigate("/usuarios")}>
              VOLTAR
            </button>
          </div>
        </div>
      </section>
    </MenuLateral>
  );
};

export default UsuariosInativos;
