import React from 'react';
import './ConfirmarExclusao.css';

interface ConfirmarExclusaoProps {
  /** Nome a ser exibido no modal. */
  nome?: string;
  /** (Legado) Alguns lugares ainda passam nomeCliente — continua funcionando. */
  nomeCliente?: string;

  /**
   * Rótulo/título da entidade, ex.: "Cliente", "Usuário", "Técnico",
   * "Ordem de Serviço". Default mais neutro: "Item".
   */
  entidadeLabel?: string;

  /**
   * Artigo para a frase "Deseja mesmo excluir ...?"
   * Use "o" ou "a". Default: "o".
   */
  artigo?: 'o' | 'a';

  /** Callback ao confirmar. */
  onConfirmar: () => void;
  /** Callback para fechar. */
  onFechar: () => void;
}

const ConfirmarExclusao: React.FC<ConfirmarExclusaoProps> = ({
  nome,
  nomeCliente,
  entidadeLabel = 'Item',
  artigo = 'o',
  onConfirmar,
  onFechar,
}) => {
  const displayName = (nome ?? nomeCliente) || '';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <strong>CONFIRMAR ?</strong>
          <button className="modal-close" onClick={onFechar}>X</button>
        </div>

        {/* Frase com artigo correto e label completo */}
        <p>Deseja mesmo excluir {artigo} {entidadeLabel.toLowerCase()}?</p>

        <p>
          <strong>{entidadeLabel}:</strong> {displayName}
        </p>

        <div className="modal-footer">
          <button className="btn azul" onClick={onConfirmar}>CONFIRMAR</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarExclusao;
