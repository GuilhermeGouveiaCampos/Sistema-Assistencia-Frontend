import { jsx as _jsx } from "react/jsx-runtime";
import MenuLateral from '../../components/MenuLateral';
const Dashboard = () => {
    return (_jsx(MenuLateral, { children: _jsx("div", { className: "logo-central", children: _jsx("img", { src: "/logo.png", alt: "Logotipo Eletrotek Central" }) }) }));
};
export default Dashboard;
