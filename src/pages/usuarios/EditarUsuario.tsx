import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Alterar.css';
import '../Css/Cadastrar.css';
import '../Css/Pesquisa.css';
import '../dashboard/Dashboard.css';
import MenuLateral from '../../components/MenuLateral';

// ✅ Cliente axios centralizado (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

const AlterarUsuario: React.FC = () => {
  const nomeUsuario = localStorage.getItem('nome') || 'Usuário';
  const idUsuarioLogado = localStorage.getItem('id');
  const navigate = useNavigate();

  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [idNivel, setIdNivel] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'feminino'>('masculino');
  const [telefone, setTelefone] = useState(''); // ✅ NOVO

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);

  const validarCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cleaned[i]) * (10 - i);
    let digito1 = (soma * 10) % 11;
    if (digito1 === 10) digito1 = 0;
    if (digito1 !== parseInt(cleaned[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cleaned[i]) * (11 - i);
    let digito2 = (soma * 10) % 11;
    if (digito2 === 10) digito2 = 0;

    return digito2 === parseInt(cleaned[10]);
  };

  // ✅ máscara de telefone (mesma lógica do cadastro)
  const formatarTelefone = (valor: string): string => {
    const n = valor.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 2) return `(${n}`;
    if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
  };

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioSelecionado');
    if (!usuarioString) {
      alert('Nenhum usuário selecionado.');
      navigate('/usuarios');
      return;
    }
    const usuario = JSON.parse(usuarioString);
    setIdUsuario(usuario.id_usuario);
    setNome(usuario.nome);
    setCpf(usuario.cpf);
    setEmail(usuario.email);
    setIdNivel(usuario.id_nivel);
    setGenero((usuario.genero as 'masculino' | 'feminino') || 'masculino');
    // ✅ se vier telefone do backend/localStorage, preenche; senão, deixa vazio
    setTelefone(usuario.telefone || '');
  }, [navigate]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idUsuario) return;

    const cpfNumerico = cpf.replace(/\D/g, '');
    if (!validarCPF(cpfNumerico)) {
      alert('CPF inválido.');
      return;
    }

    const telefoneNumerico = telefone.replace(/\D/g, '');
    if (telefoneNumerico.length < 10) {
      alert('Informe um telefone válido.');
      return;
    }

    try {
      await api.put(`/api/usuarios/${idUsuario}`, {
        nome,
        cpf: cpfNumerico,
        email,
        id_nivel: idNivel,
        genero,
        telefone: telefoneNumerico, // ✅ envia telefone para o backend
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário.');
    }
  };

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">ALTERAR USUÁRIO</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>👤 NOME</span>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </label>

            <label>
              <span>📄 CPF</span>
              <input
                type="text"
                value={cpf}
                onChange={(e) => {
                  const novoCPF = formatCPF(e.target.value);
                  setCpf(novoCPF);

                  const somenteNumeros = novoCPF.replace(/\D/g, '');
                  if (somenteNumeros.length === 11) {
                    setCpfValido(validarCPF(somenteNumeros));
                  } else {
                    setCpfValido(null);
                  }
                }}
                maxLength={14}
                required
              />
              {cpfValido !== null && (
                <p
                  style={{
                    color: cpfValido ? 'green' : 'red',
                    fontSize: '0.9rem',
                    marginTop: '5px',
                    fontWeight: 'bold',
                  }}
                >
                  {cpfValido ? 'CPF válido ✅' : 'CPF inválido ❌'}
                </p>
              )}
            </label>

            <label>
              <span>📧 EMAIL</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            {/* ✅ NOVO CAMPO: TELEFONE */}
            <label>
              <span>📞 TELEFONE</span>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                required
                maxLength={15}
                placeholder="(64) 99999-9999"
              />
            </label>

            <label>
              <span>⚧️ GÊNERO</span>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value as 'masculino' | 'feminino')}
                required
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </label>

            <label>
              <span>🧑‍💼 NÍVEL</span>
              <select value={idNivel} onChange={(e) => setIdNivel(e.target.value)} required>
                <option value="1">Administrador</option>
                <option value="2">Atendente</option>
                <option value="3">Técnico</option>
              </select>
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">
                SALVAR
              </button>
              <button type="button" className="btn preto" onClick={() => navigate('/usuarios')}>
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Modal confirmação de saída */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR SAÍDA?</strong>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                X
              </button>
            </div>
            <p>Deseja mesmo sair sem salvar?</p>
            <p>
              <strong>Usuário:</strong> {nome}
            </p>
            <button
              className="btn azul"
              onClick={() => {
                localStorage.removeItem('usuarioSelecionado');
                navigate('/usuarios');
              }}
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      )}

      {/* Modal sucesso */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>✅ Sucesso!</strong>
              <button
                className="close-btn"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/usuarios');
                }}
              >
                X
              </button>
            </div>
            <p>
              Usuário <strong>{nome}</strong> atualizado com sucesso!
            </p>
            <div className="modal-footer">
              <button
                className="btn azul"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/usuarios');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="voltar-container">
        <button className="btn roxo" type="button" onClick={() => setShowModal(true)}>
          VOLTAR
        </button>
      </div>
    </MenuLateral>
  );
};

export default AlterarUsuario;
