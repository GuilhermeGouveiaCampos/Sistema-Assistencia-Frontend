import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';
// ✅ cliente axios central
import api from '../../services/api';
const DetalhesEquipamento = () => {
    const { id } = useParams();
    const [equipamento, setEquipamento] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchEquipamento = async () => {
            try {
                console.log("🔄 Buscando detalhes do equipamento ID:", id);
                const response = await api.get(`/api/equipamentos/${id}`);
                console.log("📦 Dados recebidos:", response.data);
                if (!response.data || response.data.erro) {
                    console.warn("⚠️ Equipamento não encontrado.");
                    setEquipamento(undefined);
                }
                else {
                    setEquipamento(response.data);
                }
            }
            catch (error) {
                console.error("❌ Erro ao buscar detalhes do equipamento:", error);
                setEquipamento(undefined);
            }
        };
        fetchEquipamento();
    }, [id]);
    if (equipamento === null)
        return _jsx("p", { children: "Carregando..." });
    if (equipamento === undefined)
        return _jsx("p", { children: "Equipamento n\u00E3o encontrado." });
    const imagens = equipamento.imagem?.split(',') || [];
    const baseURL = import.meta.env.VITE_API_URL; // ✅ para montar src das imagens
    return (_jsx(MenuLateral, { children: _jsxs("div", { className: "clientes-content", children: [_jsx("table", { className: "tabela-detalhes", children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("th", { children: "Cliente" }), _jsx("td", { children: equipamento.nome_cliente })] }), _jsxs("tr", { children: [_jsx("th", { children: "CPF" }), _jsx("td", { children: equipamento.cpf })] }), _jsxs("tr", { children: [_jsx("th", { children: "Tipo" }), _jsx("td", { children: equipamento.tipo })] }), _jsxs("tr", { children: [_jsx("th", { children: "Marca" }), _jsx("td", { children: equipamento.marca })] }), _jsxs("tr", { children: [_jsx("th", { children: "Modelo" }), _jsx("td", { children: equipamento.modelo })] }), _jsxs("tr", { children: [_jsx("th", { children: "N\u00BA S\u00E9rie" }), _jsx("td", { children: equipamento.numero_serie })] })] }) }), _jsx("h2", { style: { marginTop: "2rem" }, children: "Imagens" }), _jsx("div", { className: "galeria-imagens", children: imagens.length === 0 ? (_jsx("p", { children: "Nenhuma imagem dispon\u00EDvel." })) : (imagens.map((img, index) => (_jsx("img", { src: `${baseURL}/uploads/${img}`, alt: `Imagem ${index + 1}`, onError: () => console.error(`❌ Falha ao carregar imagem: ${img}`) }, index)))) }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", onClick: () => navigate(-1), children: "VOLTAR" }) })] }) }));
};
export default DetalhesEquipamento;
