// src/pages/login/RecuperarSenha.tsx
import React, { useState } from 'react';
import './RecuperarSenha.css';
import { useNavigate } from 'react-router-dom';
import ModalLoginSucesso from '../../components/ModalLoginSucesso';
import api from '../../services/api';

const formatarCPF = (valor: string): string =>
  valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const validarCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cleaned[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cleaned[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cleaned[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cleaned[10]);
};

type Etapa = 'cpf' | 'codigo' | 'senha';

const RecuperarSenha: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState<boolean | null>(null);

  const [etapa, setEtapa] = useState<Etapa>('cpf');

  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCPF(e.target.value);
    setCpf(formatado);
    setCpfValido(validarCPF(formatado));
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCodigo(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cpfNumerico = cpf.replace(/\D/g, '');

    if (!validarCPF(cpf)) {
      alert('CPF inválido');
      return;
    }

    try {
      setLoading(true);

      if (etapa === 'cpf') {
        // 1ª etapa: solicitar envio do código via WhatsApp
        await api.post('/api/recuperar-senha', { cpf: cpfNumerico });

        alert('Código de recuperação enviado para o WhatsApp cadastrado.');
        setEtapa('codigo');
      } else if (etapa === 'codigo') {
        // 2ª etapa: validar código
        if (codigo.length !== 6) {
          alert('Digite os 6 dígitos do código.');
          return;
        }

        await api.post('/api/validar-codigo', {
          cpf: cpfNumerico,
          codigo,
        });

        alert('Código validado com sucesso. Agora defina a nova senha.');
        setEtapa('senha');
      } else if (etapa === 'senha') {
        // 3ª etapa: trocar senha
        if (novaSenha.trim().length < 6) {
          alert('A nova senha deve ter pelo menos 6 caracteres.');
          return;
        }

        await api.post('/api/trocar-senha', {
          cpf: cpfNumerico,
          codigo,
          nova_senha: novaSenha,
        });

        setShowModal(true);
      }
    } catch (err: any) {
      console.error('Erro no fluxo de recuperação:', err?.response?.data || err);
      alert(err?.response?.data?.erro || 'Erro ao processar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => {
    setShowModal(false);
    navigate('/login');
  };

  const textoBotaoPrincipal = () => {
    if (etapa === 'cpf') {
      return loading ? 'ENVIANDO...' : 'SOLICITAR ENVIO DO CÓDIGO';
    }
    if (etapa === 'codigo') {
      return loading ? 'VALIDANDO...' : 'CONFIRMAR';
    }
    // etapa === 'senha'
    return loading ? 'SALVANDO...' : 'REDEFINIR SENHA';
  };

  const botaoDesabilitado = () => {
    if (loading) return true;
    if (etapa === 'cpf') {
      return !cpfValido;
    }
    if (etapa === 'codigo') {
      return codigo.length !== 6;
    }
    if (etapa === 'senha') {
      return novaSenha.trim().length < 6;
    }
    return false;
  };

  return (
    <div className="login-box">
      <div className="login-left">
        <img src="/logo.png" alt="Logo Eletrotek" className="logo" />

        <form className="form-area" onSubmit={handleSubmit}>
          {/* CPF – sempre aparece, mas trava após enviar código */}
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={handleCpfChange}
              maxLength={14}
              disabled={etapa !== 'cpf'} // trava depois da 1ª etapa
            />
            {cpf.length === 14 && (
              <span
                style={{
                  color: cpfValido ? 'lightgreen' : 'red',
                  fontSize: '0.8rem',
                }}
              >
                {cpfValido ? 'CPF válido' : 'CPF inválido'}
              </span>
            )}
          </div>

          {/* Mensagem explicando o passo atual */}
          {etapa === 'cpf' && (
            <p className="info-text">
              Informe seu CPF e clique em <strong>“Solicitar envio do código”</strong>.
              Você receberá um código de 6 dígitos no WhatsApp cadastrado.
            </p>
          )}

          {etapa === 'codigo' && (
            <>
              <div className="form-group">
                <label htmlFor="codigo">CÓDIGO DE VERIFICAÇÃO</label>
                <input
                  type="text"
                  id="codigo"
                  placeholder="Digite o código de 6 dígitos"
                  value={codigo}
                  onChange={handleCodigoChange}
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
              <p className="info-text">
                Enviamos um código de 6 dígitos para o seu WhatsApp. Digite-o acima para
                continuar.
              </p>
            </>
          )}

          {etapa === 'senha' && (
            <>
              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="novaSenha">NOVA SENHA</label>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  id="novaSenha"
                  placeholder="Digite a nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '65%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                  }}
                  title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? '🚫' : '👁️'}
                </button>
              </div>
              <p className="info-text">
                Defina uma nova senha para acessar o sistema. Ela deve ter pelo menos 6
                caracteres.
              </p>
            </>
          )}

          <button
            type="submit"
            className="btn-entrar"
            disabled={botaoDesabilitado()}
          >
            {textoBotaoPrincipal()}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              marginTop: '1rem',
              backgroundColor: '#cccccc',
              color: '#1c1740',
              padding: '10px',
              borderRadius: '6px',
              fontWeight: 'bold',
              width: '100%',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            VOLTAR PARA LOGIN
          </button>
        </form>
      </div>

      <div className="login-right">
        <img src="/eletricista.png" alt="Ilustração técnico" className="ilustracao" />
      </div>

      {showModal && (
        <ModalLoginSucesso
          titulo="✅ Sucesso!"
          mensagem="Senha redefinida com sucesso! Faça login com a nova senha."
          botaoLabel="Ir para o login"
          onClose={goLogin}
          onTimeout={goLogin}
          initialSeconds={3}
        />
      )}
    </div>
  );
};

export default RecuperarSenha;
