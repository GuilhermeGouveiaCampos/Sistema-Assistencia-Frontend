import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuLateral from '../../components/MenuLateral';
import "../dashboard/Dashboard.css";
import "../Css/Cadastrar.css";
import "../Css/Alterar.css";
import "../Css/Pesquisa.css";
// ✅ cliente axios central
import api from '../../services/api';
const AlterarEquipamento = () => {
    const navigate = useNavigate();
    const [idEquipamento, setIdEquipamento] = useState(null);
    const [tipo, setTipo] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [numeroSerie, setNumeroSerie] = useState('');
    const [imagem, setImagem] = useState('');
    const [novasImagens, setNovasImagens] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useEffect(() => {
        const equipamentoString = localStorage.getItem("equipamentoSelecionado");
        if (!equipamentoString) {
            alert("Nenhum equipamento selecionado.");
            navigate('/equipamentos');
            return;
        }
        const equipamento = JSON.parse(equipamentoString);
        setIdEquipamento(equipamento.id_equipamento);
        setTipo(equipamento.tipo);
        setMarca(equipamento.marca);
        setModelo(equipamento.modelo);
        setNumeroSerie(equipamento.numero_serie);
        setImagem(equipamento.imagem || '');
    }, [navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idEquipamento) {
            alert("ID do equipamento inválido.");
            return;
        }
        const formData = new FormData();
        formData.append("tipo", tipo);
        formData.append("marca", marca);
        formData.append("modelo", modelo);
        formData.append("numero_serie", numeroSerie);
        formData.append("imagem", imagem);
        novasImagens.forEach((file) => {
            formData.append("imagens", file);
        });
        try {
            await api.put(`/api/equipamentos/${idEquipamento}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setShowSuccessModal(true);
        }
        catch (error) {
            console.error("Erro ao atualizar equipamento:", error);
            alert("Erro ao atualizar equipamento.");
        }
    };
    return (_jsxs(MenuLateral, { children: [_jsx("h1", { className: "titulo-clientes", children: "ALTERAR EQUIPAMENTO" }), _jsx("section", { className: "clientes-section", children: _jsx("div", { className: "container-central", children: _jsxs("form", { className: "form-cadastro-clientes", onSubmit: handleSubmit, children: [_jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCDF TIPO" }), _jsx("input", { type: "text", value: tipo, onChange: e => setTipo(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83C\uDFF7\uFE0F MARCA" }), _jsx("input", { type: "text", value: marca, onChange: e => setMarca(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD27 MODELO" }), _jsx("input", { type: "text", value: modelo, onChange: e => setModelo(e.target.value), required: true })] }), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDD22 N\u00DAMERO DE S\u00C9RIE" }), _jsx("input", { type: "text", value: numeroSerie, onChange: e => setNumeroSerie(e.target.value), required: true })] }), imagem && (_jsxs("div", { className: "imagem-preview", children: [_jsx("p", { children: "\uD83D\uDDBC\uFE0F IMAGENS ATUAIS" }), _jsx("div", { className: "imagens-container", children: imagem.split(',').map((nome, index) => (_jsxs("div", { className: "imagem-wrapper", children: [_jsx("img", { 
                                                    // ✅ usa a URL base da API para montar o caminho da imagem
                                                    src: `${import.meta.env.VITE_API_URL}/uploads/${nome}`, alt: `Imagem ${index + 1}`, className: "imagem-equipamento" }), _jsx("button", { type: "button", className: "btn remover-imagem", onClick: () => {
                                                        const novas = imagem
                                                            .split(',')
                                                            .filter((img) => img !== nome)
                                                            .join(',');
                                                        setImagem(novas);
                                                    }, children: "Remover" })] }, index))) })] })), _jsxs("label", { children: [_jsx("span", { children: "\uD83D\uDCE4 ADICIONAR NOVAS IMAGENS" }), _jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: (e) => {
                                            if (e.target.files) {
                                                setNovasImagens(Array.from(e.target.files));
                                            }
                                        } })] }), _jsxs("div", { className: "acoes-clientes", children: [_jsx("button", { type: "submit", className: "btn azul", children: "SALVAR" }), _jsx("button", { type: "button", className: "btn preto", onClick: () => {
                                            localStorage.removeItem("equipamentoSelecionado");
                                            navigate('/equipamentos');
                                        }, children: "CANCELAR" })] }), _jsx("div", { className: "voltar-container", children: _jsx("button", { className: "btn roxo", type: "button", onClick: () => setShowModal(true), children: "VOLTAR" }) })] }) }) }), showModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "CONFIRMAR ?" }), _jsx("button", { className: "close-btn", onClick: () => setShowModal(false), children: "X" })] }), _jsx("p", { children: "Deseja sair sem salvar?" }), _jsxs("p", { children: [_jsx("strong", { children: "Equipamento:" }), " ", modelo] }), _jsx("button", { className: "btn azul", onClick: () => {
                                localStorage.removeItem("equipamentoSelecionado");
                                navigate('/equipamentos');
                            }, children: "CONFIRMAR" })] }) })), showSuccessModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-content", children: [_jsxs("div", { className: "modal-header", children: [_jsx("strong", { children: "\u2705 Sucesso!" }), _jsx("button", { className: "close-btn", onClick: () => {
                                        setShowSuccessModal(false);
                                        localStorage.removeItem("equipamentoSelecionado");
                                        navigate('/equipamentos');
                                    }, children: "X" })] }), _jsxs("p", { children: ["Equipamento ", _jsx("strong", { children: modelo }), " atualizado com sucesso!"] }), _jsx("div", { className: "modal-footer", children: _jsx("button", { className: "btn azul", onClick: () => {
                                    setShowSuccessModal(false);
                                    localStorage.removeItem("equipamentoSelecionado");
                                    navigate('/equipamentos');
                                }, children: "OK" }) })] }) }))] }));
};
export default AlterarEquipamento;
