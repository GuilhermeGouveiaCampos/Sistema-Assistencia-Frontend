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

import api from '../../services/api';

const AlterarCliente: React.FC = () => {
  const navigate = useNavigate();

  // Identificação
  const [idCliente, setIdCliente] = useState<number | null>(null);

  // Dados pessoais
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<string>(''); // ISO yyyy-mm-dd

  // Endereço (manual)
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // UI
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cpfValido, setCpfValido] = useState(true);

  useEffect(() => {
    const clienteString = localStorage.getItem('clienteSelecionado');

    if (!clienteString) {
      alert('Nenhum cliente selecionado.');
      navigate('/clientes');
      return;
    }

    try {
      const c = JSON.parse(clienteString);

      setIdCliente(c.id_cliente ?? c.id); // fallback, caso venha com outro nome

      setNome(c.nome || '');
      setCpf(c.cpf || '');
      setTelefone(c.telefone || '');

      // Normaliza data_nascimento -> yyyy-mm-dd
      const dn = c.data_nascimento
        ? String(c.data_nascimento).slice(0, 10) // se vier "2024-01-01T00:00:00.000Z"
        : '';
      setDataNascimento(dn);

      // Endereço (se não vier, mantém vazio)
      setCep(formatCEP(c.cep || ''));
      setRua(c.rua || '');
      setNumero(c.numero || '');
      setBairro(c.bairro || '');
      setCidade(c.cidade || '');
      setEstado((c.estado || '').toUpperCase().slice(0, 2));
    } catch {
      alert('Dados do cliente inválidos.');
      navigate('/clientes');
    }
  }, [navigate]);

  // ====== FORMATADORES ======
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

  // ====== VALIDAÇÕES ======
  const validarCPF = (cpfStr: string): boolean => {
    const s = cpfStr.replace(/[^\d]+/g, '');
    if (s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(s[i]) * (10 - i);
    let d1 = 11 - (soma % 11);
    if (d1 >= 10) d1 = 0;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(s[i]) * (11 - i);
    let d2 = 11 - (soma % 11);
    if (d2 >= 10) d2 = 0;

    return d1 === parseInt(s[9]) && d2 === parseInt(s[10]);
  };

  // ====== SUBMIT ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idCliente) {
      alert('Cliente inválido.');
      return;
    }

    if (!dataNascimento) {
      alert('Informe a data de nascimento.');
      return;
    }

    const cepNumerico = cep.replace(/\D/g, '');
    if (!cepNumerico || cepNumerico.length !== 8) {
      alert('Informe um CEP válido.');
      return;
    }

    if (!rua || !bairro || !cidade || !estado) {
      const ok = confirm('Endereço incompleto. Deseja continuar mesmo assim?');
      if (!ok) return;
    }

    const payload = {
      nome,
      cpf, // se o backend exigir só dígitos: cpf.replace(/\D/g, '')
      telefone,
      data_nascimento: dataNascimento, // já está em yyyy-mm-dd
      // Endereço
      cep: cepNumerico,
      rua,
      numero,
      bairro,
      cidade,
      estado: estado.toUpperCase().slice(0, 2),
      status: 'ativo', // mantém status ativo
    };

    try {
      await api.put(`/api/clientes/${idCliente}`, payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar.');
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
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
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
                className={cpfValido || cpf.length < 14 ? '' : 'input-invalido'}
              />
              {cpf.length === 14 &&
                (cpfValido ? (
                  <span className="cpf-valido">CPF válido ✅</span>
                ) : (
                  <span className="cpf-invalido">CPF inválido ❌</span>
                ))}
            </label>

            <label>
              <span>📞 TELEFONE</span>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(formatTelefone(e.target.value))}
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
                    setDataNascimento(date ? date.toISOString().split('T')[0] : '')
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

            {/* ===== ENDEREÇO ===== */}
            <div className="subtitulo" style={{ marginTop: 10, marginBottom: 4, fontWeight: 700 }}>
              Endereço
            </div>

            <label>
              <span>📍 CEP</span>
              <input
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(formatCEP(e.target.value))}
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
                onChange={(e) => setRua(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🏠 NÚMERO</span>
              <input
                type="text"
                placeholder="Ex.: 123"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🏘️ BAIRRO</span>
              <input
                type="text"
                placeholder="Ex.: Centro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🏙️ CIDADE</span>
              <input
                type="text"
                placeholder="Ex.: Rio Verde"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
              />
            </label>

            <label>
              <span>🗺️ ESTADO (UF)</span>
              <input
                type="text"
                placeholder="UF"
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                required
              />
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">
                SALVAR
              </button>
              <button
                type="button"
                className="btn preto"
                onClick={() => {
                  localStorage.removeItem('clienteSelecionado');
                  navigate('/clientes');
                }}
              >
                CANCELAR
              </button>
            </div>

            <div className="voltar-container">
              <button className="btn roxo" type="button" onClick={() => setShowModal(true)}>
                VOLTAR
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Modal de confirmação de saída sem salvar */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR ?</strong>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                X
              </button>
            </div>
            <p>Deseja mesmo sair sem salvar?</p>
            <p>
              <strong>Cliente:</strong> {nome}
            </p>
            <button
              className="btn azul"
              onClick={() => {
                localStorage.removeItem('clienteSelecionado');
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
                  localStorage.removeItem('clienteSelecionado');
                  navigate('/clientes');
                }}
              >
                X
              </button>
            </div>
            <p>
              Cliente <strong>{nome}</strong> atualizado com sucesso!
            </p>
            <div className="modal-footer">
              <button
                className="btn azul"
                onClick={() => {
                  setShowSuccessModal(false);
                  localStorage.removeItem('clienteSelecionado');
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
