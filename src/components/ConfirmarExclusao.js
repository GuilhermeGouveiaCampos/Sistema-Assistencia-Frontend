import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './ConfirmarExclusao.css';
const ConfirmarExclusao = ({ nomeCliente, onConfirmar, onFechar }) => {
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR ?" }), _jsx("button", { className: "modal-close", onClick: onFechar, children: "X" })] }), _jsx("p", { children: "Deseja mesmo excluir o cliente?" }), _jsxs("p", { children: [_jsx("strong", { children: "Cliente:" }), " ", nomeCliente] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn azul", onClick: onConfirmar, children: "CONFIRMAR" }) })] }) }));
};
export default ConfirmarExclusao;
