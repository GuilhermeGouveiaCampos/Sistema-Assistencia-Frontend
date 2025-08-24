import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/MenuLateral.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MenuLateral.css";
const MenuLateral = ({ children }) => {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const idUsuario = localStorage.getItem("id") || "";
    const idNivel = (localStorage.getItem("id_nivel") || "").toString(); // "3" = Técnico
    // Normalização do gênero
    const generoRaw = (localStorage.getItem("genero") || "")
        .toString()
        .trim()
        .toLowerCase();
    const femininoTokens = new Set(["f", "feminino", "mulher", "female"]);
    const isFeminino = femininoTokens.has(generoRaw);
    const AVATAR_FEM = "/feminino.png";
    const AVATAR_MASC = "/masculino.png";
    useEffect(() => {
        console.log("[MenuLateral] generoRaw:", generoRaw, "-> isFeminino:", isFeminino);
    }, [generoRaw, isFeminino]);
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const fazerLogout = () => {
        localStorage.clear();
        navigate("/login");
    };
    // Flags de permissão
    const isTecnico = idNivel === "3";
    return (_jsxs("div", { className: "dashboard-container", children: [_jsxs("aside", { className: "sidebar", children: [_jsx("div", { className: "sidebar-logo", onClick: () => navigate(isTecnico ? "/ordemservico" : "/dashboard"), style: { cursor: "pointer" }, children: _jsx("img", { src: "/logo.png", alt: "Logo Eletrotek" }) }), _jsx("nav", { className: "sidebar-menu", children: isTecnico ? (_jsxs("button", { type: "button", className: "menu-btn", onClick: () => navigate("/ordemservico"), children: [_jsx("img", { src: "/icon-os.png", alt: "\u00CDcone Ordem de Servi\u00E7o" }), _jsx("span", { children: "ORDEM DE SERVI\u00C7O" })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", className: "menu-btn", onClick: () => navigate("/clientes"), children: [_jsx("img", { src: "/icon-clientes.png", alt: "\u00CDcone Clientes" }), _jsx("span", { children: "CLIENTES" })] }), _jsxs("button", { type: "button", className: "menu-btn", onClick: () => navigate("/equipamentos"), children: [_jsx("img", { src: "/icon-equipamentos.png", alt: "\u00CDcone Equipamentos" }), _jsx("span", { children: "EQUIPAMENTOS" })] }), _jsxs("button", { type: "button", className: "menu-btn", onClick: () => navigate("/ordemservico"), children: [_jsx("img", { src: "/icon-os.png", alt: "\u00CDcone Ordem de Servi\u00E7o" }), _jsx("span", { children: "ORDEM DE SERVI\u00C7O" })] }), idUsuario === "1" && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "menu-btn", onClick: () => navigate("/tecnicos"), children: [_jsx("img", { src: "/icon-tecnicos.png", alt: "\u00CDcone T\u00E9cnicos" }), _jsx("span", { children: "T\u00C9CNICOS" })] }), _jsxs("button", { className: "menu-btn", onClick: () => navigate("/rfid"), children: [_jsx("img", { src: "/icon-rfid.png", alt: "\u00CDcone RFID" }), _jsx("span", { children: "RFID" })] }), _jsxs("button", { className: "menu-btn", onClick: () => navigate("/usuarios"), children: [_jsx("img", { src: "/icon-usuarios.png", alt: "\u00CDcone Usu\u00E1rios" }), _jsx("span", { children: "USU\u00C1RIOS" })] })] }))] })) })] }), _jsxs("main", { className: "main-content", children: [_jsxs("header", { className: "top-bar", children: [_jsxs("div", { className: "user-info", onClick: () => setMostrarMenu(!mostrarMenu), children: [_jsx("img", { src: isFeminino ? AVATAR_FEM : AVATAR_MASC, alt: "Avatar", className: "avatar-img" }), _jsxs("span", { children: ["Ol\u00E1, ", nomeUsuario] })] }), mostrarMenu && (_jsx("div", { className: "menu-dropdown", children: _jsx("button", { onClick: fazerLogout, children: "\uD83D\uDEAA Logout" }) }))] }), _jsx("div", { className: "conteudo-pagina", children: children })] })] }));
};
export default MenuLateral;
