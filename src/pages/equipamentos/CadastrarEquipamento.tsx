import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../../components/MenuLateral"; 
import "../dashboard/Dashboard.css";
import "../Css/Cadastrar.css";
import "../Css/Alterar.css";
import "../Css/Pesquisa.css";
import Select from 'react-select';

// ✅ cliente axios central
import api from '../../services/api';

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
  const [imagens, setImagens] = useState<File[]>([]);
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  const optionsClientes = clientes.map(cliente => ({
    value: cliente.id_cliente,
    label: cliente.nome
  }));

  const removerImagem = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const response = await api.get("/api/clientes");
        setClientes(response.data);
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
        setEquipamentos(response.data);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "id_cliente") {
      const clienteSelecionado = clientes.find(c => c.id_cliente === parseInt(value));
      setCpfCliente(clienteSelecionado ? clienteSelecionado.cpf : "");
    }
    setFormulario({ ...formulario, [name]: value });
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 20);
      setImagens(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dados = new FormData();
    dados.append("id_cliente", formulario.id_cliente);
    dados.append("tipo", formulario.tipo);
    dados.append("marca", formulario.marca);
    dados.append("modelo", formulario.modelo);
    dados.append("numero_serie", formulario.numero_serie);
    dados.append("status", "ativo");

    imagens.forEach((imagem) => {
      dados.append("imagens", imagem);
    });

    try {
      const response = await api.post("/api/equipamentos", dados, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        setMostrarModalSucesso(true);
        if (response.data.id_equipamento) {
          localStorage.setItem("novoEquipamento", JSON.stringify({
            id_cliente: formulario.id_cliente,
            id_equipamento: response.data.id_equipamento
          }));
        }
      } else {
        alert("Algo deu errado. Verifique o console.");
      }
    } catch (error: unknown) {
      console.error("❌ Erro ao cadastrar equipamento:", error);
      alert("Erro ao cadastrar equipamento. Veja o console.");
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
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
          <form className="form-cadastro-clientes" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="cliente-select-group">
              <label>
                <span>👤 CLIENTE</span>
                <Select
                  options={optionsClientes}
                  onChange={(optionSelecionada) => {
                    const id_cliente = optionSelecionada?.value.toString() || "";
                    const cliente = clientes.find(c => c.id_cliente === Number(id_cliente));
                    setFormulario({ ...formulario, id_cliente });
                    setCpfCliente(cliente?.cpf || "");
                  }}
                  placeholder="Digite o nome do cliente"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
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
                  }}
                />
              </label>

              <label>
                <span>📄 CPF DO CLIENTE</span>
                <div className="cpf-disabled-wrapper">
                  <input type="text" value={cpfCliente} disabled className="input-estilizado" />
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

            <label>
              <span>📷 FOTOS DO EQUIPAMENTO</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagemChange}
              />
              {imagens.length > 0 && (
                <div className="preview-imagens">
                  {imagens.map((img, index) => (
                    <div key={index} className="preview-item">
                      <img src={URL.createObjectURL(img)} alt={`Prévia ${index + 1}`} />
                      <button type="button" onClick={() => removerImagem(index)} className="btn-remover">❌</button>
                    </div>
                  ))}
                </div>
              )}
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">SALVAR</button>
              <button type="button" className="btn preto" onClick={() => navigate("/equipamentos")}>CANCELAR</button>
            </div>

            <div className="voltar-container">
              <button className="btn roxo" type="button" onClick={() => navigate("/equipamentos")}>VOLTAR</button>
            </div>
          </form>
        </div>
      </section>
    </MenuLateral>
  );
};

export default CadastrarEquipamento;
