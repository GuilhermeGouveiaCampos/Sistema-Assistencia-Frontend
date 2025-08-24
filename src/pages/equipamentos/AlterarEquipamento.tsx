import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import "../dashboard/Dashboard.css";
import "../Css/Cadastrar.css";
import "../Css/Alterar.css";
import "../Css/Pesquisa.css";

// ✅ cliente axios central
import api from '../../services/api';

const AlterarEquipamento: React.FC = () => {
  const navigate = useNavigate();
  const [idEquipamento, setIdEquipamento] = useState<number | null>(null);
  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [imagem, setImagem] = useState<string>('');
  const [novasImagens, setNovasImagens] = useState<File[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const equipamentoString = localStorage.getItem("equipamentoSelecionado");
    if (!equipamentoString) {
      alert("Nenhum equipamento selecionado.");
      navigate('/equipamentos');
      return;
    }

    const equipamento = JSON.parse(equipamentoString);
    setIdEquipamento(equipamento.id_equipamento);
    setTipo(equipamento.tipo);
    setMarca(equipamento.marca);
    setModelo(equipamento.modelo);
    setNumeroSerie(equipamento.numero_serie);
    setImagem(equipamento.imagem || '');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEquipamento) {
      alert("ID do equipamento inválido.");
      return;
    }

    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("marca", marca);
    formData.append("modelo", modelo);
    formData.append("numero_serie", numeroSerie);
    formData.append("imagem", imagem);

    novasImagens.forEach((file) => {
      formData.append("imagens", file);
    });

    try {
      await api.put(`/api/equipamentos/${idEquipamento}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao atualizar equipamento:", error);
      alert("Erro ao atualizar equipamento.");
    }
  };

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">ALTERAR EQUIPAMENTO</h1>

      <section className="clientes-section">
        <div className="container-central">
          <form className="form-cadastro-clientes" onSubmit={handleSubmit}>
            <label>
              <span>📟 TIPO</span>
              <input type="text" value={tipo} onChange={e => setTipo(e.target.value)} required />
            </label>

            <label>
              <span>🏷️ MARCA</span>
              <input type="text" value={marca} onChange={e => setMarca(e.target.value)} required />
            </label>

            <label>
              <span>🔧 MODELO</span>
              <input type="text" value={modelo} onChange={e => setModelo(e.target.value)} required />
            </label>

            <label>
              <span>🔢 NÚMERO DE SÉRIE</span>
              <input type="text" value={numeroSerie} onChange={e => setNumeroSerie(e.target.value)} required />
            </label>

            {imagem && (
              <div className="imagem-preview">
                <p>🖼️ IMAGENS ATUAIS</p>
                <div className="imagens-container">
                  {imagem.split(',').map((nome: string, index: number) => (
                    <div key={index} className="imagem-wrapper">
                      <img
                        // ✅ usa a URL base da API para montar o caminho da imagem
                        src={`${import.meta.env.VITE_API_URL}/uploads/${nome}`}
                        alt={`Imagem ${index + 1}`}
                        className="imagem-equipamento"
                      />
                      <button
                        type="button"
                        className="btn remover-imagem"
                        onClick={() => {
                          const novas = imagem
                            .split(',')
                            .filter((img: string) => img !== nome)
                            .join(',');
                          setImagem(novas);
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label>
              <span>📤 ADICIONAR NOVAS IMAGENS</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setNovasImagens(Array.from(e.target.files));
                  }
                }}
              />
            </label>

            <div className="acoes-clientes">
              <button type="submit" className="btn azul">SALVAR</button>
              <button
                type="button"
                className="btn preto"
                onClick={() => {
                  localStorage.removeItem("equipamentoSelecionado");
                  navigate('/equipamentos');
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>CONFIRMAR ?</strong>
              <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
            </div>
            <p>Deseja sair sem salvar?</p>
            <p><strong>Equipamento:</strong> {modelo}</p>
            <button
              className="btn azul"
              onClick={() => {
                localStorage.removeItem("equipamentoSelecionado");
                navigate('/equipamentos');
              }}
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <strong>✅ Sucesso!</strong>
              <button
                className="close-btn"
                onClick={() => {
                  setShowSuccessModal(false);
                  localStorage.removeItem("equipamentoSelecionado");
                  navigate('/equipamentos');
                }}
              >
                X
              </button>
            </div>
            <p>Equipamento <strong>{modelo}</strong> atualizado com sucesso!</p>
            <div className="modal-footer">
              <button
                className="btn azul"
                onClick={() => {
                  setShowSuccessModal(false);
                  localStorage.removeItem("equipamentoSelecionado");
                  navigate('/equipamentos');
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

export default AlterarEquipamento;
