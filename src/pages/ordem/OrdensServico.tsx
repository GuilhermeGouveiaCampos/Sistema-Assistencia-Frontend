import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";
import MenuLateral from "../../components/MenuLateral";

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from "../../services/api";

interface OrdemServico {
  id_ordem: number;
  nome_cliente: string;
  tipo_equipamento: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  data_entrada: string;
  status: string;
  descricao_problema: string;
  id_local: number;
  id_status: number;
}

const OrdensServico: React.FC = () => {
  const navigate = useNavigate();

  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clienteFiltro, setClienteFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [ordemSelecionada, setOrdemSelecionada] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // ✅ apenas gerente vê o botão de relatórios
  const isGerente = typeof window !== "undefined" && localStorage.getItem("id") === "1";

  const consultarOrdens = async (signal?: AbortSignal) => {
    try {
      setCarregando(true);

      // Só manda params quando tem valor (evita "" atrapalhar o back)
      const p: Record<string, string> = {};
      const nomeTrim = clienteFiltro.trim();
      const statusTrim = statusFiltro.trim();
      if (nomeTrim) p.nome_cliente = nomeTrim;
      if (statusTrim) p.status = statusTrim;

      const resp = await api.get("/api/ordens-consulta", {
        params: p,
        signal,
      });

      setOrdens(resp.data || []);
      setOrdemSelecionada(null);
    } catch (err: any) {
      // se foi cancelada, só ignoramos
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        console.error("Erro ao consultar ordens de serviço:", err);
      }
    } finally {
      setCarregando(false);
    }
  };

  // Carrega de cara
  useEffect(() => {
    const controller = new AbortController();
    consultarOrdens(controller.signal);
    return () => controller.abort();
  }, []);

  // Busca automática enquanto digita (debounce + cancelamento da anterior)
  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(() => consultarOrdens(controller.signal), 350);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [clienteFiltro, statusFiltro]);

  const selecionarOrdem = (ordem: OrdemServico) => {
    if (!ordem?.id_ordem) return;
    setOrdemSelecionada(ordem.id_ordem);
    localStorage.setItem("ordemSelecionada", JSON.stringify(ordem));
  };

  const excluirOrdem = async () => {
    if (ordemSelecionada == null) return;
    try {
      await api.delete(`/api/ordens/${ordemSelecionada}`);
      setOrdens((prev) => prev.filter((o) => o.id_ordem !== ordemSelecionada));
      setOrdemSelecionada(null);
      setMostrarModal(false);
    } catch (error) {
      console.error("Erro ao excluir ordem:", error);
    }
  };

  const ordemAtual = ordens.find((o) => o.id_ordem === ordemSelecionada);

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">ORDENS DE SERVIÇO</h1>

      <section className="clientes-section">
        <div className="container-central">
          {/* 🔗 Botão de Relatórios (PDF) — só gerente vê */}
          {isGerente && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button
                className="btn roxo"
                onClick={() => navigate("/relatorios/os")}
                title="Gerar relatórios em PDF"
              >
                📄 RELATÓRIOS (PDF)
              </button>
            </div>
          )}

          <div className="filtros-clientes">
            <input
              type="text"
              placeholder="NOME DO CLIENTE"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="STATUS"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              autoComplete="off"
            />
            <button className="btn roxo-claro" onClick={() => consultarOrdens()}>
              CONSULTAR
            </button>
          </div>

          <div className="tabela-clientes">
            {carregando && <p style={{ marginBottom: 8 }}>Carregando…</p>}
            <table>
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>EQUIPAMENTO</th>
                  <th>MARCA</th>
                  <th>MODELO</th>
                  <th>Nº SÉRIE</th>
                  <th>DATA ENTRADA</th>
                  <th>STATUS</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {ordens.map((o, index) => (
                  <tr
                    key={o.id_ordem ?? `ordem-${index}`}
                    onClick={() => selecionarOrdem(o)}
                    className={ordemSelecionada === o.id_ordem ? "linha-selecionada" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{o.nome_cliente}</td>
                    <td>{o.tipo_equipamento || "N/D"}</td>
                    <td>{o.marca || "N/D"}</td>
                    <td>{o.modelo || "N/D"}</td>
                    <td>{o.numero_serie || "N/D"}</td>
                    <td>{o.data_entrada}</td>
                    <td>{o.status}</td>
                    <td>
                      <button
                        className="btn detalhes"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          navigate(`/ordemservico/detalhes/${o.id_ordem}`);
                        }}
                      >
                        DETALHES
                      </button>
                    </td>
                  </tr>
                ))}

                {!carregando && ordens.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: 12 }}>
                      Nenhuma ordem encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="acoes-clientes">
            <button
              className="btn azul"
              onClick={() => navigate("/ordemservico/cadastrar")}
            >
              NOVA ORDEM DE SERVIÇO
            </button>

            <button
              className="btn preto"
              disabled={ordemSelecionada === null}
              onClick={() => {
                const ordem = ordens.find((o) => o.id_ordem === ordemSelecionada);
                if (ordem) {
                  localStorage.setItem("ordemSelecionada", JSON.stringify(ordem));
                  navigate("/ordemservico/alterar");
                }
              }}
            >
              ALTERAR
            </button>

            <button
              className="btn vermelho"
              disabled={ordemSelecionada === null}
              onClick={() => setMostrarModal(true)}
            >
              EXCLUIR
            </button>

            <button
              className="btn vermelho-claro"
              onClick={() => navigate("/ordemservico/inativos")}
            >
              INATIVAS
            </button>
          </div>
        </div>
      </section>

      <div className="voltar-container">
        <button className="btn roxo" onClick={() => navigate("/")}>
          VOLTAR
        </button>
      </div>

      {mostrarModal && ordemAtual && (
        <ConfirmarExclusao
          entidadeLabel="Ordem de Serviço"
          artigo="a"
          nome={`${ordemAtual.nome_cliente} - ${ordemAtual.tipo_equipamento}`}
          onConfirmar={excluirOrdem}
          onFechar={() => setMostrarModal(false)}
        />
      )}
    </MenuLateral>
  );
};

export default OrdensServico;
