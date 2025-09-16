import React from 'react';
import './ConfirmarExclusao.css';

/**
 * Componente genérico de confirmação de exclusão.
 * ⚠️ Mantém compatibilidade com usos antigos (nomeCliente).
 */
interface ConfirmarExclusaoProps {
  /** Nome a ser exibido no modal (preferível usar este). */
  nome?: string;
  /** (Legacy) Alguns lugares ainda passam nomeCliente — continua funcionando. */
  nomeCliente?: string;
  /** Texto da entidade: "Cliente", "Usuário", "Técnico", etc. Default: "Cliente". */
  entidadeLabel?: string;
  /** Callback ao confirmar. */
  onConfirmar: () => void;
  /** Callback para fechar. */
  onFechar: () => void;
}

const ConfirmarExclusao: React.FC<ConfirmarExclusaoProps> = ({
  nome,
  nomeCliente,
  entidadeLabel = 'Cliente',
  onConfirmar,
  onFechar,
}) => {
  // Mantém compatibilidade: usa `nome` se vier, senão `nomeCliente`
  const displayName = (nome ?? nomeCliente) || '';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <strong>CONFIRMAR ?</strong>
          <button className="modal-close" onClick={onFechar}>X</button>
        </div>

        <p>Deseja mesmo excluir o {entidadeLabel.toLowerCase()}?</p>
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
