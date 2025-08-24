import { jsx as _jsx } from "react/jsx-runtime";
import Login from '../pages/login/Login';
import RecuperarSenha from '../pages/login/RecuperarSenha';
import Dashboard from '../pages/dashboard/Dashboard';
import Clientes from '../pages/clientes/Clientes';
import Equipamentos from '../pages/equipamentos/Equipamentos';
export const authRoutes = [
    {
        path: '/',
        element: _jsx(Login, {})
    },
    {
        path: '/recuperar-senha',
        element: _jsx(RecuperarSenha, {})
    },
    {
        path: '/dashboard',
        element: _jsx(Dashboard, {})
    },
    {
        path: '/clientes',
        element: _jsx(Clientes, {})
    },
    {
        path: '/equipamentos',
        element: _jsx(Equipamentos, {})
    }
];
