import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';

// ✅ cliente axios central
import api from '../../services/api';

interface Equipamento {
  id_equipamento: number;
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  status: string;
  imagem: string; 
  nome_cliente: string;
  cpf: string;
}

const DetalhesEquipamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipamento, setEquipamento] = useState<Equipamento | null | undefined>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipamento = async () => {
      try {
        console.log("🔄 Buscando detalhes do equipamento ID:", id);
        const response = await api.get(`/api/equipamentos/${id}`);
        console.log("📦 Dados recebidos:", response.data);

        if (!response.data || (response.data as any).erro) {
          console.warn("⚠️ Equipamento não encontrado.");
          setEquipamento(undefined);
        } else {
          setEquipamento(response.data as Equipamento);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar detalhes do equipamento:", error);
        setEquipamento(undefined);
      }
    };

    fetchEquipamento();
  }, [id]);

  if (equipamento === null) return <p>Carregando...</p>;
  if (equipamento === undefined) return <p>Equipamento não encontrado.</p>;

  const imagens = equipamento.imagem?.split(',') || [];
  const baseURL = import.meta.env.VITE_API_URL; // ✅ para montar src das imagens

  return (
    <MenuLateral>
      <div className="clientes-content">
        <table className="tabela-detalhes">
          <tbody>
            <tr><th>Cliente</th><td>{equipamento.nome_cliente}</td></tr>
            <tr><th>CPF</th><td>{equipamento.cpf}</td></tr>
            <tr><th>Tipo</th><td>{equipamento.tipo}</td></tr>
            <tr><th>Marca</th><td>{equipamento.marca}</td></tr>
            <tr><th>Modelo</th><td>{equipamento.modelo}</td></tr>
            <tr><th>Nº Série</th><td>{equipamento.numero_serie}</td></tr>
          </tbody>
        </table>

        <h2 style={{ marginTop: "2rem" }}>Imagens</h2>
        <div className="galeria-imagens">
          {imagens.length === 0 ? (
            <p>Nenhuma imagem disponível.</p>
          ) : (
            imagens.map((img, index) => (
              <img
                key={index}
                src={`${baseURL}/uploads/${img}`} // ✅ sem localhost fixo
                alt={`Imagem ${index + 1}`}
                onError={() => console.error(`❌ Falha ao carregar imagem: ${img}`)}
              />
            ))
          )}
        </div>

        <div className="voltar-container">
          <button className="btn roxo" onClick={() => navigate(-1)}>VOLTAR</button>
        </div>
      </div>
    </MenuLateral>
  );
};

export default DetalhesEquipamento;
