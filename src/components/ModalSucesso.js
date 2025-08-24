import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from "react-dom";
const ModalSucesso = ({ onClose }) => {
    return ReactDOM.createPortal(_jsx("div", { style: {
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
        }, children: _jsxs("div", { style: {
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '10px',
                textAlign: 'center',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
            }, children: [_jsx("h2", { children: "\u2705 SUCESSO!" }), _jsx("p", { children: "Ordem cadastrada com sucesso." }), _jsx("button", { onClick: onClose, style: { marginTop: '15px', padding: '10px 20px' }, children: "OK" })] }) }), document.body);
};
export default ModalSucesso;
