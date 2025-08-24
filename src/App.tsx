import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Telas principais
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/login/Login';
import RecuperarSenha from "./pages/login/RecuperarSenha";

// CLIENTES
import Clientes from './pages/clientes/Clientes';
import AlterarCliente from './pages/clientes/AlterarCliente';
import CadastrarCliente from './pages/clientes/CadastrarCliente';
import ClientesInativos from './pages/clientes/ClientesInativos';

// EQUIPAMENTOS
import Equipamentos from './pages/equipamentos/Equipamentos';
import EquipamentosInativos from './pages/equipamentos/EquipamentosInativos';
import CadastrarEquipamento from './pages/equipamentos/CadastrarEquipamento';
import DetalhesEquipamento from './pages/equipamentos/DetalhesEquipamento';
import AlterarEquipamento from './pages/equipamentos/AlterarEquipamento';

// RFID
import RFID from './pages/RFID/RFID';
import CadastrarRFID from './pages/RFID/CadastrarRFID';
import EditarRFID from './pages/RFID/EditarRFID';
import LocaisInativos from './pages/RFID/LocaisInativos';

// TÉCNICOS
import Tecnicos from './pages/tecnicos/Tecnicos';
import CadastrarTecnico from './pages/tecnicos/CadastrarTecnico';
import AlterarTecnico from './pages/tecnicos/AlterarTecnico';
import TecnicosInativos from './pages/tecnicos/TecnicosInativos';
import TecnicosAtribuicoes from "./pages/tecnicos/TecnicosAtribuicoes";

// USUÁRIOS
import Usuarios from "./pages/usuarios/Usuarios";
import CadastrarUsuario from "./pages/usuarios/CadastrarUsuario";
import EditarUsuario from "./pages/usuarios/EditarUsuario";
import UsuariosInativos from "./pages/usuarios/UsuariosInativos";

// ORDENS DE SERVIÇO
import OrdensServico from './pages/ordem/OrdensServico';
import CadastrarOrdem from './pages/ordem/CadastrarOrdem';
import AlterarOrdem from './pages/ordem/AlterarOrdem';
import OrdensInativas from './pages/ordem/OrdensInativas';
import OrdemDetalhe from './pages/ordem/OrdemDetalhe';

const App: React.FC = () => {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* ROTAS PÚBLICAS */}
      <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />

      {/* ROTAS PRIVADAS (renderizadas só quando há token) */}
      {token && (
        <>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/inativos" element={<ClientesInativos />} />
          <Route path="/clientes/cadastrar" element={<CadastrarCliente />} />
          <Route path="/clientes/editar" element={<AlterarCliente />} />

          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/equipamentos/inativos" element={<EquipamentosInativos />} />
          <Route path="/equipamentos/cadastrar" element={<CadastrarEquipamento />} />
          <Route path="/equipamentos/detalhes/:id" element={<DetalhesEquipamento />} />
          <Route path="/equipamentos/editar" element={<AlterarEquipamento />} />

          <Route path="/rfid" element={<RFID />} />
          <Route path="/rfid/cadastrar" element={<CadastrarRFID />} />
          <Route path="/rfid/editar" element={<EditarRFID />} />
          <Route path="/rfid/inativos" element={<LocaisInativos />} />

          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/tecnicos/cadastrar" element={<CadastrarTecnico />} />
          <Route path="/tecnicos/editar" element={<AlterarTecnico />} />
          <Route path="/tecnicos/inativos" element={<TecnicosInativos />} />
          <Route path="/tecnicos/atribuicoes" element={<TecnicosAtribuicoes />} />

          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/usuarios/cadastrar" element={<CadastrarUsuario />} />
          <Route path="/usuarios/editar" element={<EditarUsuario />} />
          <Route path="/usuarios/inativos" element={<UsuariosInativos />} />

          <Route path="/ordemservico" element={<OrdensServico />} />
          <Route path="/ordemservico/cadastrar" element={<CadastrarOrdem />} />
          <Route path="/ordemservico/alterar" element={<AlterarOrdem />} />
          <Route path="/ordemservico/inativos" element={<OrdensInativas />} />
          <Route path="/ordemservico/detalhes/:id" element={<OrdemDetalhe />} />
        </>
      )}

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
