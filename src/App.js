import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
const App = () => {
    const token = localStorage.getItem("token");
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: token ? _jsx(Navigate, { to: "/dashboard" }) : _jsx(Login, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/recuperar-senha", element: _jsx(RecuperarSenha, {}) }), token && (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/clientes", element: _jsx(Clientes, {}) }), _jsx(Route, { path: "/clientes/inativos", element: _jsx(ClientesInativos, {}) }), _jsx(Route, { path: "/clientes/cadastrar", element: _jsx(CadastrarCliente, {}) }), _jsx(Route, { path: "/clientes/editar", element: _jsx(AlterarCliente, {}) }), _jsx(Route, { path: "/equipamentos", element: _jsx(Equipamentos, {}) }), _jsx(Route, { path: "/equipamentos/inativos", element: _jsx(EquipamentosInativos, {}) }), _jsx(Route, { path: "/equipamentos/cadastrar", element: _jsx(CadastrarEquipamento, {}) }), _jsx(Route, { path: "/equipamentos/detalhes/:id", element: _jsx(DetalhesEquipamento, {}) }), _jsx(Route, { path: "/equipamentos/editar", element: _jsx(AlterarEquipamento, {}) }), _jsx(Route, { path: "/rfid", element: _jsx(RFID, {}) }), _jsx(Route, { path: "/rfid/cadastrar", element: _jsx(CadastrarRFID, {}) }), _jsx(Route, { path: "/rfid/editar", element: _jsx(EditarRFID, {}) }), _jsx(Route, { path: "/rfid/inativos", element: _jsx(LocaisInativos, {}) }), _jsx(Route, { path: "/tecnicos", element: _jsx(Tecnicos, {}) }), _jsx(Route, { path: "/tecnicos/cadastrar", element: _jsx(CadastrarTecnico, {}) }), _jsx(Route, { path: "/tecnicos/editar", element: _jsx(AlterarTecnico, {}) }), _jsx(Route, { path: "/tecnicos/inativos", element: _jsx(TecnicosInativos, {}) }), _jsx(Route, { path: "/tecnicos/atribuicoes", element: _jsx(TecnicosAtribuicoes, {}) }), _jsx(Route, { path: "/usuarios", element: _jsx(Usuarios, {}) }), _jsx(Route, { path: "/usuarios/cadastrar", element: _jsx(CadastrarUsuario, {}) }), _jsx(Route, { path: "/usuarios/editar", element: _jsx(EditarUsuario, {}) }), _jsx(Route, { path: "/usuarios/inativos", element: _jsx(UsuariosInativos, {}) }), _jsx(Route, { path: "/ordemservico", element: _jsx(OrdensServico, {}) }), _jsx(Route, { path: "/ordemservico/cadastrar", element: _jsx(CadastrarOrdem, {}) }), _jsx(Route, { path: "/ordemservico/alterar", element: _jsx(AlterarOrdem, {}) }), _jsx(Route, { path: "/ordemservico/inativos", element: _jsx(OrdensInativas, {}) }), _jsx(Route, { path: "/ordemservico/detalhes/:id", element: _jsx(OrdemDetalhe, {}) })] })), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] }));
};
export default App;
