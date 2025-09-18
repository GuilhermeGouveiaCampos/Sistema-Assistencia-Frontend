import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../../components/MenuLateral";
import "../dashboard/Dashboard.css";
import "../Css/Cadastrar.css";
import "../Css/Alterar.css";
import "../Css/Pesquisa.css";
import Select, { SingleValue, StylesConfig } from "react-select";

// ✅ cliente axios central
import api from "../../services/api";

interface Cliente {
  id_cliente: number;
  nome: string;
  cpf: string;
}

interface Equipamento {
  id_equipamento: number;
  id_cliente: number;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  status: string;
}

/** Tipagem das opções do react-select */
interface ClienteOption {
  value: number;
  label: string;
  cpf: string;
}

/** ====== Imagens (mesmo comportamento da tela de OS) ====== */
type PreviewFile = {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
};

const genId = () =>
  (window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

const CadastrarEquipamento: React.FC = () => {
  const navigate = useNavigate();

  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [selectedEquipamentoId, setSelectedEquipamentoId] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formulario, setFormulario] = useState({
    id_cliente: "",
    tipo: "",
    marca: "",
    modelo: "",
    numero_serie: "",
  });
  const [cpfCliente, setCpfCliente] = useState<string>("");
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  /** Opções tipadas para o Select */
  const optionsClientes: ClienteOption[] = clientes.map((cliente) => ({
    value: cliente.id_cliente,
    label: cliente.nome,
    cpf: cliente.cpf,
  }));

  /** Estilos tipados do react-select (evita 'any') */
  const selectStyles: StylesConfig<ClienteOption, false> = {
    control: (base) => ({
      ...base,
      backgroundColor: "#000",
      borderColor: "#444",
      color: "#fff",
      borderRadius: "8px",
      boxShadow: "none",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#ccc",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1e1e1e",
      color: "#fff",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#007bff"
        : state.isFocused
        ? "#333"
        : "#1e1e1e",
      color: "#fff",
      cursor: "pointer",
    }),
  };

  /** ====== Estado e handlers de imagens (igual OS) ====== */
  const [imagens, setImagens] = useState<PreviewFile[]>([]);
  const [imagensErro, setImagensErro] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // estados para upload
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState<number>(0);

  const removerImagem = (id: string) => {
    setImagens((prev) => {
      const alvo = prev.find((p) => p.id === id);
      if (alvo) URL.revokeObjectURL(alvo.url);
      const novo = prev.filter((p) => p.id !== id);
      if (novo.length === 0) setImagensErro("Adicione pelo menos 1 imagem do equipamento.");
      return novo;
    });
  };

  const limparTodasImagens = () => {
    imagens.forEach((p) => URL.revokeObjectURL(p.url));
    setImagens([]);
    setImagensErro("Adicione pelo menos 1 imagem do equipamento.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSelectImagens = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const accepted = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    const maxEach = 5 * 1024 * 1024; // 5MB
    const maxTotal = 20;

    const atuais = [...imagens];
    for (const f of files) {
      if (!accepted.includes(f.type)) continue;
      if (f.size > maxEach) continue;
      if (atuais.length >= maxTotal) break;

      const preview: PreviewFile = {
        id: genId(),
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      };
      atuais.push(preview);
    }
    setImagens(atuais);
    setImagensErro("");

    // permite re-selecionar o mesmo arquivo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const response = await api.get("/api/clientes");
        setClientes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };
    carregarClientes();
  }, []);

  useEffect(() => {
    const carregarEquipamentos = async () => {
      try {
        const response = await api.get("/api/equipamentos");
        setEquipamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
      }
    };
    carregarEquipamentos();
  }, []);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("novoEquipamento");
    if (dadosSalvos) {
      const { id_cliente, id_equipamento } = JSON.parse(dadosSalvos);
      setSelectedClienteId(id_cliente);
      setSelectedEquipamentoId(id_equipamento);
      localStorage.removeItem("novoEquipamento");
    }
  }, []);

  // cleanup dos Object URLs ao sair da tela
  useEffect(() => {
    return () => {
      imagens.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "id_cliente") {
      const clienteSelecionado = clientes.find(
        (c) => c.id_cliente === parseInt(value)
      );
      setCpfCliente(clienteSelecionado ? clienteSelecionado.cpf : "");
    }
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // imagens obrigatórias (igual OS)
    if (imagens.length === 0) {
      setImagensErro("Adicione pelo menos 1 imagem do equipamento.");
      document.getElementById("secao-imagens-eqp")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const dados = new FormData();
    dados.append("id_cliente", formulario.id_cliente);
    dados.append("tipo", formulario.tipo);
    dados.append("marca", formulario.marca);
    dados.append("modelo", formulario.modelo);
    dados.append("numero_serie", formulario.numero_serie);
    dados.append("status", "ativo");

    imagens.forEach((p) => {
      dados.append("imagens", p.file);
    });

    try {
      setEnviando(true);
      setProgresso(0);

      const response = await api.post("/api/equipamentos", dados, {
        headers: {
          Accept: "application/json",
          // deixar o axios definir o boundary automaticamente
        },
        timeout: 120000, // ⏱️ 120s para redes lentas
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgresso(pct);
        },
      });

      if (response.status === 201 || response.status === 200) {
        setMostrarModalSucesso(true);
        if (response.data?.id_equipamento) {
          localStorage.setItem(
            "novoEquipamento",
            JSON.stringify({
              id_cliente: formulario.id_cliente,
              id_equipamento: response.data.id_equipamento,
            })
          );
        }
      } else {
        alert("Algo deu errado. Verifique o console.");
      }
    } catch (err: any) {
      console.error("❌ Erro ao cadastrar equipamento:", err);

      // mensagens mais amigáveis
      const msg =
        err?.code === "ECONNABORTED" || /timeout/i.test(err?.message || "")
          ? "Tempo de envio excedido. Sua conexão pode estar lenta. Tente novamente, de preferência com menos imagens ou imagens menores."
          : err?.response?.status === 413
          ? "As imagens são muito grandes (413). Reduza o tamanho/resolução e tente novamente."
          : "Erro ao cadastrar equipamento. Veja o console para detalhes.";

      alert(msg);
    } finally {
      setEnviando(false);
      // não zerar progresso de imediato para o usuário ver o resultado final
      setTimeout(() => setProgresso(0), 800);
    }
  };

  return (
    <MenuLateral>
      {/* MODAL DE SUCESSO */}
      {mostrarModalSucesso && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>✅ Equipamento cadastrado com sucesso!</h2>
            <p>Deseja criar uma nova Ordem de Serviço para este equipamento?</p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "15px",
              }}
            >
              <button
                className="btn azul"
                onClick={() => {
                  setMostrarModalSucesso(false);
                  navigate("/ordemservico/cadastrar");
                }}
              >
                SIM
              </button>
              <button
                className="btn preto"
                onClick={() => {
                  setMostrarModalSucesso(false);
                  navigate("/equipamentos");
                }}
              >
                NÃO
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="titulo-clientes">CADASTRAR EQUIPAMENTO</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form
            className="form-cadastro-clientes"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <div className="cliente-select-group">
              <label>
                <span>👤 CLIENTE</span>
                <Select
                  options={optionsClientes}
                  onChange={(optionSelecionada: SingleValue<ClienteOption>) => {
                    const id_cliente = optionSelecionada
                      ? optionSelecionada.value.toString()
                      : "";
                    const cliente = optionSelecionada || null;

                    setFormulario({ ...formulario, id_cliente });
                    setCpfCliente(cliente?.cpf || "");
                  }}
                  placeholder="Digite o nome do cliente"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </label>

              <label>
                <span>📄 CPF DO CLIENTE</span>
                <div className="cpf-disabled-wrapper">
                  <input
                    type="text"
                    value={cpfCliente}
                    disabled
                    className="input-estilizado"
                  />
                </div>
              </label>
            </div>

            <label>
              <span>⚙️ TIPO DO EQUIPAMENTO</span>
              <input
                type="text"
                name="tipo"
                placeholder="Ex: Liquidificador"
                value={formulario.tipo}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>🏷️ MARCA</span>
              <input
                type="text"
                name="marca"
                placeholder="Ex: Mondial"
                value={formulario.marca}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>📦 MODELO</span>
              <input
                type="text"
                name="modelo"
                placeholder="Ex: Power 600W"
                value={formulario.modelo}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <span>🔢 NÚMERO DE SÉRIE</span>
              <input
                type="text"
                name="numero_serie"
                placeholder="Ex: AB123456"
                value={formulario.numero_serie}
                onChange={handleChange}
                required
              />
            </label>

            {/* ====== IMAGENS (igual OS) ====== */}
            <div id="secao-imagens-eqp" style={{ marginTop: 16 }}>
              <span style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
                📷 IMAGENS <span style={{ color: "#ff4d4f" }}>(obrigatório)</span>
              </span>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <label
                  htmlFor="imagens-equipo"
                  style={{
                    border: "1px dashed #777",
                    borderRadius: 8,
                    padding: "10px 14px",
                    cursor: "pointer",
                    userSelect: "none",
                    background: "#0c0c0c",
                  }}
                  title="Clique para selecionar imagens"
                >
                  + Adicionar imagens
                </label>

                {imagens.length > 0 && (
                  <button
                    type="button"
                    onClick={limparTodasImagens}
                    style={{
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: "#444",
                      color: "#fff",
                    }}
                    title="Remover todas as imagens selecionadas"
                    disabled={enviando}
                  >
                    Limpar todas
                  </button>
                )}
              </div>

              <input
                id="imagens-equipo"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectImagens}
                style={{ display: "none" }}
                disabled={enviando}
              />

              {/* erro/validação */}
              {imagensErro && (
                <div style={{ color: "#ff4d4f", marginTop: 8, fontWeight: 600 }}>
                  {imagensErro}
                </div>
              )}

              {/* Barra de progresso */}
              {enviando && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>
                    Enviando imagens… {progresso}%
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      background: "#2a2a2a",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progresso}%`,
                        height: "100%",
                        background: "#4caf50",
                        transition: "width .2s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* GRID de previews */}
              {imagens.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 12,
                  }}
                >
                  {imagens.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        border: "1px solid #333",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#111",
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removerImagem(img.id)}
                        title="Remover imagem"
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "#ff4d4f", // lixeira vermelha
                          border: "1px solid #cc3a3c",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "4px 6px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                        disabled={enviando}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ====== /IMAGENS ====== */}

            <div className="acoes-clientes" style={{ marginTop: 16 }}>
              <button
                type="submit"
                className="btn azul"
                disabled={imagens.length === 0 || enviando}
              >
                {enviando ? `SALVANDO... ${progresso}%` : "SALVAR"}
              </button>
              <button
                type="button"
                className="btn preto"
                onClick={() => navigate("/equipamentos")}
                disabled={enviando}
              >
                CANCELAR
              </button>
            </div>

            <div className="voltar-container">
              <button
                className="btn roxo"
                type="button"
                onClick={() => navigate("/equipamentos")}
                disabled={enviando}
              >
                VOLTAR
              </button>
            </div>
          </form>
        </div>
      </section>
    </MenuLateral>
  );
};

export default CadastrarEquipamento;
