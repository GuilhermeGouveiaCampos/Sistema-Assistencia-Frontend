import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from "react-dom";
const ModalLoginSucesso = ({ onClose, nome, titulo, mensagem, botaoLabel, }) => {
    const tituloFinal = titulo ?? "✅ Bem-vindo!";
    const mensagemFinal = mensagem ??
        (_jsxs(_Fragment, { children: ["Ol\u00E1, ", _jsx("strong", { children: nome ?? "usuário" }), " \uD83D\uDC4B", _jsx("br", {}), "Seu login foi realizado com sucesso."] }));
    return ReactDOM.createPortal(_jsx("div", { style: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
        }, children: _jsxs("div", { style: {
                backgroundColor: "#1a1a2e",
                color: "#e0e0e0",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 0 15px rgba(0, 255, 128, 0.4)",
                textAlign: "center",
                maxWidth: "420px",
                width: "90%",
            }, children: [_jsx("h2", { style: { marginBottom: "15px", color: "#00ff99" }, children: tituloFinal }), _jsx("p", { style: { fontSize: "1.05rem", lineHeight: 1.5 }, children: mensagemFinal }), _jsx("button", { onClick: onClose, style: {
                        marginTop: "20px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#00ff99",
                        color: "#000",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }, children: botaoLabel ?? "Continuar" })] }) }), document.body);
};
export default ModalLoginSucesso;
