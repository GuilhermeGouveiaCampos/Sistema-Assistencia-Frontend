// src/pages/dashboard/Dashboard.tsx
import React from 'react';
import MenuLateral from '../../components/MenuLateral'

const Dashboard: React.FC = () => {
  return (
    <MenuLateral>
      <div className="logo-central">
        <img src="/logo.png" alt="Logotipo Eletrotek Central" />
      </div>
    </MenuLateral>
  );
};

export default Dashboard;
