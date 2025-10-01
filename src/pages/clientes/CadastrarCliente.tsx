import React, { useState } from 'react';
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

// ✅ usa o cliente axios central (src/services/api.ts)
import api from '../../services/api';

const CadastrarCliente: React.FC = () => {
  const nomeUsuario = localStorage.getItem("nome") || "Usuário";
  const idUsuario = localStorage.getItem("id");
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cpfValido, setCpfValido] = useState(true);

  // 🏠 Endereço (preenchimento manual)
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

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

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const validarCPF = (cpfStr: string): boolean => {
    let cpf = cpfStr.replace(/[^\d]+/g, '');
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

    // validações simples
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      alert('Informe um CEP válido.');
      return;
    }
    if (!rua || !bairro || !cidade || !estado) {
      const ok = confirm('Endereço incompleto. Deseja continuar mesmo assim?');
      if (!ok) return;
    }

    const novoCliente = {
      nome,
      cpf, // se o backend exigir só dígitos, use: cpf.replace(/\D/g, '')
      telefone,
      data_nascimento: dataNascimento,
      status: 'ativo',
      // 🔽 campos de endereço (todos manuais agora)
      cep: cep.replace(/\D/g, ''),
      rua,
      numero,
      bairro,
      cidade,
      estado,
    };

    try {
      const response = await api.post('/api/clientes', novoCliente);
      console.log("✅ Cliente cadastrado com sucesso:", response.data);
      setShowModal(true);
    } catch (error) {
      console.error("❌ Erro ao cadastrar cliente:", error);
      alert("Erro ao cadastrar cliente");
    }
  };

  return (
    <MenuLateral>
      {/* Modal de sucesso */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>SUCESSO ✅</strong>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  navigate('/clientes');
                }}
              >
                X
              </button>
            </div>
            <div className="modal-body">
              <p>Cliente <strong>{nome}</strong> cadastrado com sucesso!</p>
              <button className="btn azul" onClick={() => navigate('/clientes')}>OK</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="titulo-clientes">CADASTRAR CLIENTES</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>👤 NOME</span>
              <input
                type="text"
                placeholder="Digite o nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </label>

            <label>
              <span>📄 CPF</span>
              <input
                type="text"
                placeholder="Digite o CPF"
                value={cpf}
                onChange={e => {
                  const formatado = formatCPF(e.target.value);
                  setCpf(formatado);
                  setCpfValido(validarCPF(formatado));
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
                placeholder="Digite o telefone"
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
                  selected={dataNascimento ? new Date(dataNascimento) : null}
                  onChange={(date: Date | null) =>
                    setDataNascimento(date?.toISOString().split('T')[0] || '')
                  }
                  locale={ptBR}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione a data"
                  className="custom-datepicker"
                  showIcon
                  icon={<FaCalendarAlt color="#fff" />}
                />
              </div>
            </label>

            {/* 🏠 ENDEREÇO (manual) */}
            <div className="subtitulo" style={{ marginTop: 10, marginBottom: 4, fontWeight: 700 }}>
              Endereço
            </div>

            <label>
              <span>📍 CEP</span>
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={e => setCep(formatCEP(e.target.value))}
                maxLength={9}
                required
              />
            </label>

            <label>
              <span>🛣️ RUA (Logradouro)</span>
              <input
                type="text"
                placeholder="Ex.: Avenida Brasil"
                value={rua}
                onChange={e => setRua(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🏠 NÚMERO</span>
              <input
                type="text"
                placeholder="Ex.: 123"
                value={numero}
                onChange={e => setNumero(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🏘️ BAIRRO</span>
              <input
                type="text"
                placeholder="Ex.: Centro"
                value={bairro}
                onChange={e => setBairro(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🏙️ CIDADE</span>
              <input
                type="text"
                placeholder="Ex.: São Paulo"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🗺️ ESTADO (UF)</span>
              <input
                type="text"
                placeholder="UF"
                value={estado}
                onChange={e => setEstado(e.target.value.toUpperCase().slice(0,2))}
                maxLength={2}
                required
              />
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">SALVAR</button>
              <button type="button" className="btn preto" onClick={() => navigate('/clientes')}>CANCELAR</button>
            </div>

            <div className="voltar-container">
              <button className="btn roxo" onClick={() => navigate('/clientes')}>VOLTAR</button>
            </div>
          </form>
        </div>
      </section>
    </MenuLateral>
  );
};

export default CadastrarCliente;
