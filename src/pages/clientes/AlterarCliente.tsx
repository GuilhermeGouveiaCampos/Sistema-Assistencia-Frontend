import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';
import { FaCalendarAlt } from 'react-icons/fa';

// ✅ use o cliente axios central com baseURL = import.meta.env.VITE_API_URL
import api from '../../services/api';

const AlterarCliente: React.FC = () => {
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id");
  const navigate = useNavigate();

  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cpfValido, setCpfValido] = useState(true);

  useEffect(() => {
    const clienteString = localStorage.getItem("clienteSelecionado");

    if (!clienteString) {
      alert("Nenhum cliente selecionado.");
      navigate('/clientes');
      return;
    }

    const cliente = JSON.parse(clienteString);
    setIdCliente(cliente.id_cliente);
    setNome(cliente.nome);
    setCpf(cliente.cpf);
    setTelefone(cliente.telefone);
    if (cliente.data_nascimento) {
      setDataNascimento(new Date(cliente.data_nascimento));
    }
  }, [navigate]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let digito1 = 11 - (soma % 11);
    if (digito1 >= 10) digito1 = 0;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    let digito2 = 11 - (soma % 11);
    if (digito2 >= 10) digito2 = 0;

    return digito1 === parseInt(cpf[9]) && digito2 === parseInt(cpf[10]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCliente || !dataNascimento) {
      alert("Dados inválidos.");
      return;
    }

    const clienteAtualizado = {
      nome,
      cpf, // se o backend exigir só dígitos, use: cpf.replace(/\D/g, '')
      telefone,
      data_nascimento: dataNascimento.toISOString().split('T')[0]
    };

    try {
      // 🔁 trocado para usar o cliente axios central
      await api.put(`/api/clientes/${idCliente}`, clienteAtualizado);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar cliente.');
    }
  };

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">ALTERAR CLIENTES</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>👤 NOME</span>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
            </label>

            <label>
              <span>📄 CPF</span>
              <input
                type="text"
                value={cpf}
                onChange={(e) => {
                  const valorFormatado = formatCPF(e.target.value);
                  setCpf(valorFormatado);
                  setCpfValido(validarCPF(valorFormatado));
                }}
                maxLength={14}
                required
                className={cpfValido || cpf.length < 14 ? "" : "input-invalido"}
              />

              {cpf.length === 14 && (
                cpfValido ? (
                  <span className="cpf-valido">CPF válido ✅</span>
                ) : (
                  <span className="cpf-invalido">CPF inválido ❌</span>
                )
              )}
            </label>

            <label>
              <span>📞 TELEFONE</span>
              <input
                type="text"
                value={telefone}
                onChange={e => setTelefone(formatTelefone(e.target.value))}
                maxLength={15}
                required
              />
            </label>

            <label>
              <span>📅 DATA DE NASCIMENTO</span>
              <div className="data-picker-wrapper">
                <DatePicker
                  selected={dataNascimento}
                  onChange={(date: Date | null) => setDataNascimento(date)}
                  locale={ptBR}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione a data"
                  className="custom-datepicker"
                  showIcon
                  icon={<FaCalendarAlt color="#fff" />}
                />
              </div>
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">SALVAR</button>
              <button
                type="button"
                className="btn preto"
                onClick={() => {
                  localStorage.removeItem("clienteSelecionado");
                  navigate('/clientes');
                }}
              >
                CANCELAR
              </button>
            </div>

            <div className="voltar-container">
              <button
                className="btn roxo"
                type="button"
                onClick={() => setShowModal(true)}
              >
                VOLTAR
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Modal de confirmação de saída */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR ?</strong>
              <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
            </div>
            <p>Deseja mesmo sair sem salvar?</p>
            <p><strong>Cliente:</strong> {nome}</p>
            <button
              className="btn azul"
              onClick={() => {
                localStorage.removeItem("clienteSelecionado");
                navigate('/clientes');
              }}
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>✅ Sucesso!</strong>
              <button
                className="close-btn"
                onClick={() => {
                  setShowSuccessModal(false);
                  localStorage.removeItem("clienteSelecionado");
                  navigate('/clientes');
                }}
              >X</button>
            </div>
            <p>Cliente <strong>{nome}</strong> atualizado com sucesso!</p>
            <div className="modal-footer">
              <button
                className="btn azul"
                onClick={() => {
                  setShowSuccessModal(false);
                  localStorage.removeItem("clienteSelecionado");
                  navigate('/clientes');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </MenuLateral>
  );
};

export default AlterarCliente;
