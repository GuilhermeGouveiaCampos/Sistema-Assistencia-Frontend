import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Alterar.css";
import "../Css/Cadastrar.css";
import "../Css/Pesquisa.css";

// ✅ cliente axios central
import api from "../../services/api";

interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
  telefone: string;
}

const Clientes: React.FC = () => {
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id");
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [cpfFiltro, setCpfFiltro] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const formatarCPF = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, "");
    return apenasNumeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  };

  const consultarClientes = async (): Promise<void> => {
    try {
      const { data } = await api.get("/api/clientes", {
        params: {
          nome: nomeFiltro?.trim() || undefined,
          cpf: cpfFiltro?.trim() || undefined,
        },
      });

      // 🔒 Normaliza SEMPRE para array (independente do formato do backend)
      const lista: Cliente[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.rows)
        ? (data as any).rows
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];

      setClientes(lista);
      setClienteSelecionado(null);
    } catch (error) {
      console.error("❌ Erro ao consultar clientes:", error);
      setClientes([]); // garante array mesmo no erro
      setClienteSelecionado(null);
    }
  };

  useEffect(() => {
    consultarClientes();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      consultarClientes();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [nomeFiltro, cpfFiltro]);

  const selecionarCliente = (cli: Cliente) => {
    if (!cli || !cli.id_cliente) {
      console.warn("Cliente inválido:", cli);
      return;
    }
    setClienteSelecionado(cli.id_cliente);
  };

  const abrirModalExclusao = () => {
    if (clienteSelecionado !== null) setMostrarModal(true);
  };

  const excluirCliente = async () => {
    try {
      if (clienteSelecionado == null) return;
      await api.delete(`/api/clientes/${clienteSelecionado}`);
      setMostrarModal(false);
      consultarClientes();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    }
  };

  const clienteAtual = Array.isArray(clientes)
    ? clientes.find((c) => c.id_cliente === clienteSelecionado)
    : undefined;

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">CLIENTES</h1>
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
            <button className="btn roxo-claro" onClick={consultarClientes}>
              CONSULTAR
            </button>
          </div>

          <div className="tabela-clientes">
            <table>
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>CPF</th>
                  <th>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>TELEFONE</span>
                      {clienteSelecionado !== null && (
                        <button
                          onClick={() => setClienteSelecionado(null)}
                          style={{
                            marginLeft: "0.5rem",
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.75rem",
                            backgroundColor: "#666",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          DESMARCAR
                        </button>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(clientes) ? clientes : []).map((cli) => (
                  <tr
                    key={cli.id_cliente}
                    onClick={() => selecionarCliente(cli)}
                    className={clienteSelecionado === cli.id_cliente ? "linha-selecionada" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{cli.nome}</td>
                    <td>{cli.cpf}</td>
                    <td>{cli.telefone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="acoes-clientes">
            <button className="btn azul" onClick={() => navigate("/clientes/cadastrar")}>
              CADASTRAR
            </button>

            <button
              className="btn preto"
              disabled={clienteSelecionado === null}
              onClick={() => {
                if (!Array.isArray(clientes)) return;
                const cliente = clientes.find((c) => c.id_cliente === clienteSelecionado);
                if (cliente) {
                  localStorage.setItem("clienteSelecionado", JSON.stringify(cliente));
                  navigate("/clientes/editar");
                }
              }}
            >
              ALTERAR
            </button>

            <button
              className="btn vermelho"
              disabled={clienteSelecionado === null}
              onClick={abrirModalExclusao}
            >
              EXCLUIR
            </button>

            <button className="btn vermelho-claro" onClick={() => navigate("/clientes/inativos")}>
              INATIVOS
            </button>
          </div>

          <div className="voltar-container">
            <button className="btn roxo" onClick={() => navigate("/")}>
              VOLTAR
            </button>
          </div>
        </div>
      </section>

      {mostrarModal && clienteAtual && (
        <ConfirmarExclusao
          nomeCliente={clienteAtual.nome}
          onConfirmar={excluirCliente}
          onFechar={() => setMostrarModal(false)}
        />
      )}
    </MenuLateral>
  );
};

export default Clientes;
