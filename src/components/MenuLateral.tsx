// src/components/MenuLateral.tsx
import React, { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MenuLateral.css";

interface MenuLateralProps {
  children: ReactNode;
}

const MenuLateral: React.FC<MenuLateralProps> = ({ children }) => {
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="sidebar-logo"
          onClick={() => navigate(isTecnico ? "/ordemservico" : "/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.png" alt="Logo Eletrotek" />
        </div>

        <nav className="sidebar-menu">
          {/* Técnico enxerga apenas ORDEM DE SERVIÇO */}
          {isTecnico ? (
              <button
                type="button"
                className="menu-btn"
                onClick={() => navigate("/ordemservico")}
              >
                <img src="/icon-os.png" alt="Ícone Ordem de Serviço" />
                <span>ORDEM DE SERVIÇO</span>
              </button>
            ) : (
              <>
                <button type="button" className="menu-btn" onClick={() => navigate("/clientes")}>
                  <img src="/icon-clientes.png" alt="Ícone Clientes" />
                  <span>CLIENTES</span>
                </button>

                <button type="button" className="menu-btn" onClick={() => navigate("/equipamentos")}>
                  <img src="/icon-equipamentos.png" alt="Ícone Equipamentos" />
                  <span>EQUIPAMENTOS</span>
                </button>

                <button type="button" className="menu-btn" onClick={() => navigate("/ordemservico")}>
                  <img src="/icon-os.png" alt="Ícone Ordem de Serviço" />
                  <span>ORDEM DE SERVIÇO</span>
                </button>

              {/* Exemplo: permissões extras (ajuste conforme sua regra) */}
              {idUsuario === "1" && (
                <>
                  <button className="menu-btn" onClick={() => navigate("/tecnicos")}>
                    <img src="/icon-tecnicos.png" alt="Ícone Técnicos" />
                    <span>TÉCNICOS</span>
                  </button>

                  <button className="menu-btn" onClick={() => navigate("/rfid")}>
                    <img src="/icon-rfid.png" alt="Ícone RFID" />
                    <span>RFID</span>
                  </button>

                  <button className="menu-btn" onClick={() => navigate("/usuarios")}>
                    <img src="/icon-usuarios.png" alt="Ícone Usuários" />
                    <span>USUÁRIOS</span>
                  </button>
                </>
              )}
            </>
          )}
        </nav>
      </aside>

      {/* Topo e Conteúdo */}
      <main className="main-content">
        <header className="top-bar">
          <div className="user-info" onClick={() => setMostrarMenu(!mostrarMenu)}>
            <img
              src={isFeminino ? AVATAR_FEM : AVATAR_MASC}
              alt="Avatar"
              className="avatar-img"
            />
            <span>Olá, {nomeUsuario}</span>
          </div>

          {mostrarMenu && (
            <div className="menu-dropdown">
              <button onClick={fazerLogout}>🚪 Logout</button>
            </div>
          )}
        </header>

        <div className="conteudo-pagina">{children}</div>
      </main>
    </div>
  );
};

export default MenuLateral;
