import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import '../dashboard/Dashboard.css';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import MenuLateral from "../../components/MenuLateral";

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

interface Tecnico {
  id_tecnico: number;
  nome: string;
  cpf: string;
  telefone: string;
}

const Tecnicos: React.FC = () => {
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id");
  const navigate = useNavigate();

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [cpfFiltro, setCpfFiltro] = useState("");
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const formatarCPF = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  };

  const consultarTecnicos = async () => {
    try {
      const response = await api.get<Tecnico[]>("/api/tecnicos", {
        params: { nome: nomeFiltro, cpf: cpfFiltro }
      });
      setTecnicos(response.data);
      setTecnicoSelecionado(null);
    } catch (error) {
      console.error("Erro ao buscar técnicos:", error);
    }
  };

  useEffect(() => {
    consultarTecnicos();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      consultarTecnicos();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [nomeFiltro, cpfFiltro]);

  const selecionarTecnico = (tec: Tecnico) => {
    if (!tec || !tec.id_tecnico) return;
    setTecnicoSelecionado(tec.id_tecnico);
  };

  const abrirModalExclusao = () => {
    if (tecnicoSelecionado !== null) setMostrarModal(true);
  };

  const excluirTecnico = async () => {
    try {
      await api.delete(`/api/tecnicos/${tecnicoSelecionado}`);
      setMostrarModal(false);
      consultarTecnicos();
    } catch (error) {
      console.error("Erro ao excluir técnico:", error);
    }
  };

  const tecnicoAtual = tecnicos.find(t => t.id_tecnico === tecnicoSelecionado);

  return (
    <MenuLateral>
      <header className="titulo-bar">
        <h1 className="titulo-clientes">TÉCNICOS</h1>
        <button
          className="btn roxo-claro titulo-atr-btn"
          onClick={() => navigate('/tecnicos/atribuicoes')}
        >
          VER ATRIBUIÇÕES
        </button>
      </header>

      <section className="clientes-section">
        <div className="container-central">
          <div className="filtros-clientes">
            <input
              type="text"
              placeholder="NOME COMPLETO"
              value={nomeFiltro}
              onChange={(e) => setNomeFiltro(e.target.value)}
            />
            <input
              type="text"
              placeholder="CPF"
              value={cpfFiltro}
              onChange={(e) => setCpfFiltro(formatarCPF(e.target.value))}
            />
            <button className="btn roxo-claro" onClick={consultarTecnicos}>CONSULTAR</button>
          </div>

          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>CPF</th>
                  <th>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>TELEFONE</span>
                      {tecnicoSelecionado !== null && (
                        <button
                          onClick={() => setTecnicoSelecionado(null)}
                          style={{
                            marginLeft: '0.5rem',
                            padding: '0.2rem 0.6rem',
                            fontSize: '0.75rem',
                            backgroundColor: '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          DESMARCAR
                        </button>
                      )}
                    </div>
                  </th>
                  <th style={{ width: 140, textAlign: 'center' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {tecnicos.map((tec) => (
                  <tr
                    key={tec.id_tecnico}
                    onClick={() => selecionarTecnico(tec)}
                    className={tecnicoSelecionado === tec.id_tecnico ? 'linha-selecionada' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{tec.nome}</td>
                    <td>{tec.cpf}</td>
                    <td>{tec.telefone}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn detalhes"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          localStorage.setItem('tecnicoSelecionado', JSON.stringify(tec));
                          navigate(`/tecnicos/detalhes/${tec.id_tecnico}`);
                        }}
                        title="Ver detalhes do técnico"
                      >
                        DETALHES
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="acoes-clientes">
            <button className="btn azul" onClick={() => navigate('/usuarios/cadastrar')}>CADASTRAR</button>
            <button
              className="btn preto"
              disabled={tecnicoSelecionado === null}
              onClick={() => {
                const tecnico = tecnicos.find(t => t.id_tecnico === tecnicoSelecionado);
                if (tecnico) {
                  localStorage.setItem('tecnicoSelecionado', JSON.stringify(tecnico));
                  navigate('/tecnicos/editar');
                }
              }}
            >
              ALTERAR
            </button>
            <button
              className="btn vermelho"
              disabled={tecnicoSelecionado === null}
              onClick={abrirModalExclusao}
            >
              EXCLUIR
            </button>
            <button className="btn vermelho-claro" onClick={() => navigate('/tecnicos/inativos')}>INATIVOS</button>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate('/')}>VOLTAR</button>
          </div>
        </div>
      </section>

      {mostrarModal && tecnicoAtual && (
        <ConfirmarExclusao
          nomeCliente={tecnicoAtual.nome}
          onConfirmar={excluirTecnico}
          onFechar={() => setMostrarModal(false)}
        />
      )}
    </MenuLateral>
  );
};

export default Tecnicos;
