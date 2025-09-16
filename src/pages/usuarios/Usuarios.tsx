import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import '../dashboard/Dashboard.css';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css'; 
import '../Css/Pesquisa.css';
import MenuLateral from "../../components/MenuLateral";

import api from "../../services/api";

interface Usuario {
  id_usuario: number;
  nome: string;
  cpf: string;
  id_nivel: number;
  nome_nivel: string;
}

const Usuarios: React.FC = () => {
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id");
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [cpfFiltro, setCpfFiltro] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const formatarCPF = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  };

  const consultarUsuarios = async () => {
    try {
      const response = await api.get("/api/usuarios", {
        params: { nome: nomeFiltro, cpf: cpfFiltro }
      });
      setUsuarios(response.data);
      setUsuarioSelecionado(null);
    } catch (error) {
      console.error("Erro ao consultar usuários:", error);
    }
  };

  useEffect(() => {
    consultarUsuarios();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => consultarUsuarios(), 400);
    return () => clearTimeout(delay);
  }, [nomeFiltro, cpfFiltro]);

  const selecionarUsuario = (user: Usuario) => {
    if (!user?.id_usuario) return;
    setUsuarioSelecionado(user.id_usuario);
  };

  const abrirModalExclusao = () => {
    if (usuarioSelecionado !== null) setMostrarModal(true);
  };

  const excluirUsuario = async () => {
    try {
      await api.delete(`/api/usuarios/${usuarioSelecionado}`);
      setMostrarModal(false);
      consultarUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  const usuarioAtual = usuarios.find(u => u.id_usuario === usuarioSelecionado);

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">USUÁRIOS</h1>

      <section className="clientes-section">
        <div className="container-central">
          <div className="filtros-clientes">
            <input
              type="text"
              placeholder="NOME"
              value={nomeFiltro}
              onChange={(e) => setNomeFiltro(e.target.value)}
            />
            <input
              type="text"
              placeholder="CPF"
              value={cpfFiltro}
              onChange={(e) => setCpfFiltro(formatarCPF(e.target.value))}
            />
            <button className="btn roxo-claro" onClick={consultarUsuarios}>CONSULTAR</button>
          </div>

          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>NÍVEL</th>
                  <th>CPF</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr
                    key={u.id_usuario}
                    onClick={() => selecionarUsuario(u)}
                    className={usuarioSelecionado === u.id_usuario ? 'linha-selecionada' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{u.nome}</td>
                    <td>{u.nome_nivel}</td>
                    <td>{formatarCPF(u.cpf)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="acoes-clientes">
            <button className="btn azul" onClick={() => navigate('/usuarios/cadastrar')}>
              CADASTRAR
            </button>
            <button
              className="btn preto"
              disabled={usuarioSelecionado === null}
              onClick={() => {
                const usuario = usuarios.find(u => u.id_usuario === usuarioSelecionado);
                if (usuario) {
                  localStorage.setItem("usuarioSelecionado", JSON.stringify(usuario));
                  navigate('/usuarios/editar');
                }
              }}
            >
              ALTERAR
            </button>
            <button
              className="btn vermelho"
              disabled={usuarioSelecionado === null}
              onClick={abrirModalExclusao}
            >
              EXCLUIR
            </button>
            <button className="btn vermelho-claro" onClick={() => navigate('/usuarios/inativos')}>
              INATIVOS
            </button>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate('/')}>VOLTAR</button>
          </div>
        </div>
      </section>

      {mostrarModal && usuarioAtual && (
  <ConfirmarExclusao
    entidadeLabel="Usuário"
    nome={usuarioAtual.nome}
    onConfirmar={excluirUsuario}
    onFechar={() => setMostrarModal(false)}
  />
)}
    </MenuLateral>
  );
};

export default Usuarios;
