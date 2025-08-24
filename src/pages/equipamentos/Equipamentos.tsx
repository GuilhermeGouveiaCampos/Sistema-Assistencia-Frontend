import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import MenuLateral from '../../components/MenuLateral';
import '../Css/Pesquisa.css';

// ✅ cliente axios central
import api from '../../services/api';

interface Equipamento {
  id_equipamento: number;
  id_cliente: number;
  nome_cliente: string;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  estado: string;
  status: string;
}

const Equipamentos: React.FC = () => {
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id");
  const navigate = useNavigate();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [nomeClienteFiltro, setNomeClienteFiltro] = useState("");
  const [modeloFiltro, setModeloFiltro] = useState("");
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const consultarEquipamentos = async () => {
    try {
      const response = await api.get("/api/equipamentos", {
        params: {
          tipo: tipoFiltro,
          nome_cliente: nomeClienteFiltro,
          modelo: modeloFiltro,
        },
      });
      setEquipamentos(response.data);
      setEquipamentoSelecionado(null);
    } catch (error) {
      console.error("Erro ao consultar equipamentos:", error);
    }
  };

  useEffect(() => {
    consultarEquipamentos();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      consultarEquipamentos();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [tipoFiltro, nomeClienteFiltro, modeloFiltro]);

  const selecionarEquipamento = (equip: Equipamento) => {
    if (!equip?.id_equipamento) {
      console.warn("⚠️ Equipamento inválido:", equip);
      return;
    }
    setEquipamentoSelecionado(equip.id_equipamento);
  };

  const abrirModalExclusao = () => {
    if (equipamentoSelecionado !== null) setMostrarModal(true);
  };

  const excluirEquipamento = async () => {
    if (equipamentoSelecionado === null) return;

    try {
      const id = equipamentoSelecionado;
      setMostrarModal(false);

      setEquipamentos(prev =>
        prev.filter(equip => equip.id_equipamento !== id)
      );

      setEquipamentoSelecionado(null);
      await api.delete(`/api/equipamentos/${id}`);
    } catch (error) {
      console.error("❌ Erro ao excluir equipamento:", error);
    }
  };

  const equipamentoAtual = equipamentos.find(e => e.id_equipamento === equipamentoSelecionado);

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">EQUIPAMENTOS</h1>
      <section className="clientes-section">
        <div className="container-central">
          <div className="filtros-clientes">
            <input
              type="text"
              placeholder="TIPO"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
            />
            <input
              type="text"
              placeholder="NOME DO CLIENTE"
              value={nomeClienteFiltro}
              onChange={(e) => setNomeClienteFiltro(e.target.value)}
            />
            <input
              type="text"
              placeholder="MODELO"
              value={modeloFiltro}
              onChange={(e) => setModeloFiltro(e.target.value)}
            />
            <button className="btn roxo-claro" onClick={consultarEquipamentos}>
              CONSULTAR
            </button>
          </div>

          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>TIPO</th>
                  <th>MARCA</th>
                  <th>MODELO</th>
                  <th>Nº SÉRIE</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {equipamentos.map((e) => (
                  <tr
                    key={e.id_equipamento}
                    onClick={() => selecionarEquipamento(e)}
                    className={equipamentoSelecionado === e.id_equipamento ? 'linha-selecionada' : ''}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{e.nome_cliente}</td>
                    <td>{e.tipo}</td>
                    <td>{e.marca}</td>
                    <td>{e.modelo}</td>
                    <td>{e.numero_serie}</td>
                    <td>
                      <button
                        className="btn detalhes"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          navigate(`/equipamentos/detalhes/${e.id_equipamento}`);
                        }}
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
            <button className="btn azul" onClick={() => navigate('/equipamentos/cadastrar')}>
              CADASTRAR
            </button>
            <button
              className="btn preto"
              disabled={equipamentoSelecionado === null}
              onClick={() => {
                const eq = equipamentos.find(e => e.id_equipamento === equipamentoSelecionado);
                if (eq) {
                  localStorage.setItem('equipamentoSelecionado', JSON.stringify(eq));
                  navigate('/equipamentos/editar');
                }
              }}
            >
              ALTERAR
            </button>
            <button
              className="btn vermelho"
              disabled={equipamentoSelecionado === null}
              onClick={abrirModalExclusao}
            >
              EXCLUIR
            </button>
            <button
              className="btn vermelho-claro"
              onClick={() => navigate('/equipamentos/inativos')}
            >
              INATIVOS
            </button>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate('/')}>
              VOLTAR
            </button>
          </div>
        </div>
      </section>

      {mostrarModal && equipamentoAtual && (
        <ConfirmarExclusao
          nomeCliente={`${equipamentoAtual.nome_cliente} - ${equipamentoAtual.tipo} - ${equipamentoAtual.numero_serie}`}
          onConfirmar={excluirEquipamento}
          onFechar={() => setMostrarModal(false)}
        />
      )}
    </MenuLateral>
  );
};

export default Equipamentos;
