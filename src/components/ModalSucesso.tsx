import React from "react";
import ReactDOM from "react-dom";

interface ModalSucessoProps {
  onClose: () => void;
}

const ModalSucesso: React.FC<ModalSucessoProps> = ({ onClose }) => {
  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h2>✅ SUCESSO!</h2>
        <p>Ordem cadastrada com sucesso.</p>
        <button
          onClick={onClose}
          style={{ marginTop: '15px', padding: '10px 20px' }}
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ModalSucesso;
