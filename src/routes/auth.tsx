import Login from '../pages/login/Login';
import RecuperarSenha from '../pages/login/RecuperarSenha';
import Dashboard from '../pages/dashboard/Dashboard';
import Clientes from '../pages/clientes/Clientes';
import Equipamentos from '../pages/equipamentos/Equipamentos'; 

export const authRoutes = [
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/recuperar-senha',
    element: <RecuperarSenha />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/clientes',
    element: <Clientes /> 
  },
  {
    path: '/equipamentos',
    element: <Equipamentos /> 
  }
];
