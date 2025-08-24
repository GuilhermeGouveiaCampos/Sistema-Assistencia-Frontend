import React from 'react';
import './ConfirmarExclusao.css';

interface ConfirmarExclusaoProps {
  nomeCliente: string;
  onConfirmar: () => void;
  onFechar: () => void;
}

const ConfirmarExclusao: React.FC<ConfirmarExclusaoProps> = ({ nomeCliente, onConfirmar, onFechar }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <strong>CONFIRMAR ?</strong>
          <button className="modal-close" onClick={onFechar}>X</button>
        </div>

        <p>Deseja mesmo excluir o cliente?</p>
        <p><strong>Cliente:</strong> {nomeCliente}</p>

        <div className="modal-footer">
          <button className="btn azul" onClick={onConfirmar}>CONFIRMAR</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarExclusao;
