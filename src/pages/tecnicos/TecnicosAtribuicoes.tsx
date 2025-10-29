import React, { useEffect, useMemo, useState } from 'react';
import MenuLateral from '../../components/MenuLateral';
import '../dashboard/Dashboard.css';
import '../Css/Pesquisa.css';

// ✅ cliente axios central (usa import.meta.env.VITE_API_URL)
import api from '../../services/api';

type Row = {
  id_tecnico: number;
  nome_tecnico: string;
  telefone: string | null;
  id_os: number;
  nome_cliente: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  status_os: string;
  data_criacao: string;
  data_inicio_reparo: string | null;
  data_fim_reparo: string | null;
  tempo_servico: number | null;
  minutos_total: number; // já vem calculado do backend
};

type Group = {
  id_tecnico: number;
  nome_tecnico: string;
  telefone: string | null;
  total_os: number;
  total_minutos: number;
  ordens: Row[];
};

function mmToHuman(m: number) {
  if (!m || m <= 0) return '0 min';
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min} min`;
  if (min === 0) return `${h} h`;
  return `${h} h ${min} min`;
}

// remove acentos e normaliza caixa
function norm(s: string) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const TecnicosAtribuicoes: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [carregando, setCarregando] = useState(true);

  // filtros ao digitar
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState('');

  const carregar = async () => {
    setCarregando(true);
    try {
      const { data } = await api.get<Row[]>('/api/tecnicos/atribuicoes');
      setRows(data);
    } catch (e) {
      console.error('❌ Erro ao buscar atribuições:', e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
    // auto-refresh a cada 60s, para o tempo “andar”
    const t = setInterval(carregar, 60000);
    return () => clearInterval(t);
  }, []);

  // Grupos completos (sem filtro)
  const gruposBase = useMemo<Group[]>(() => {
    const map = new Map<number, Group>();
    for (const r of rows) {
      const g = map.get(r.id_tecnico) || {
        id_tecnico: r.id_tecnico,
        nome_tecnico: r.nome_tecnico,
        telefone: r.telefone,
        total_os: 0,
        total_minutos: 0,
        ordens: [],
      };
      g.ordens.push(r);
      g.total_os += 1;
      g.total_minutos += r.minutos_total || 0;
      map.set(r.id_tecnico, g);
    }
    return Array.from(map.values());
  }, [rows]);

  // Grupos filtrados ao digitar
  const gruposFiltrados = useMemo<Group[]>(() => {
    const fCli = norm(filtroCliente);
    const fTec = norm(filtroTecnico);

    return gruposBase
      .map((g) => {
        // filtro por técnico (aplica no grupo)
        const tecnicoOk = !fTec || norm(g.nome_tecnico).includes(fTec);
        if (!tecnicoOk) return null;

        // filtro por cliente (aplica por OS dentro do grupo)
        const ordensFiltradas = g.ordens.filter((o) =>
          !fCli || norm(o.nome_cliente).includes(fCli)
        );

        if (ordensFiltradas.length === 0) return null;

        // recalcula totais conforme filtrado
        const totalMin = ordensFiltradas.reduce((acc, o) => acc + (o.minutos_total || 0), 0);

        return {
          ...g,
          ordens: ordensFiltradas,
          total_os: ordensFiltradas.length,
          total_minutos: totalMin,
        };
      })
      .filter(Boolean) as Group[];
  }, [gruposBase, filtroCliente, filtroTecnico]);

  return (
    <MenuLateral>
      <h1 className="titulo-clientes">ATRIBUIÇÕES DOS TÉCNICOS</h1>

      <section className="clientes-section">
        <div className="container-central">

          {/* 🔎 Barra de filtros */}
          <div className="filtros-wrap" style={{ marginBottom: 12 }}>
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
              <input
                type="text"
                className="input-pesquisa"
                placeholder="Filtrar por nome do cliente..."
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
              />
              <input
                type="text"
                className="input-pesquisa"
                placeholder="Filtrar por nome do técnico..."
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
              />
              <button
                type="button"
                className="btn preto"
                onClick={() => {
                  setFiltroCliente('');
                  setFiltroTecnico('');
                }}
                title="Limpar filtros"
              >
                LIMPAR
              </button>
            </div>
            {/* contador resumido */}
            <div className="muted" style={{ marginTop: 6 }}>
              {carregando
                ? 'Atualizando...'
                : `${gruposFiltrados.length} técnico(s) — ` +
                  `${gruposFiltrados.reduce((acc, g) => acc + g.total_os, 0)} OS filtradas`}
            </div>
          </div>

          {carregando ? (
            <p>Carregando...</p>
          ) : gruposFiltrados.length === 0 ? (
            <p>Nenhuma OS atribuída.</p>
          ) : (
            gruposFiltrados.map((g) => (
              <div key={g.id_tecnico} className="card-atr">
                <div className="card-atr__header">
                  <div>
                    <strong>{g.nome_tecnico}</strong>
                    <div className="muted">{g.telefone ? `📞 ${g.telefone}` : '📞 N/D'}</div>
                  </div>
                  <div className="card-atr__resume">
                    <span>
                      <b>{g.total_os}</b> OS
                    </span>
                    <span>⏱ {mmToHuman(g.total_minutos)}</span>
                  </div>
                </div>

                <div className="tabela-clientes">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cliente</th>
                        <th>Equipamento</th>
                        <th>Status</th>
                        <th>Criada em</th>
                        <th>Tempo (acumulado)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.ordens.map((o) => (
                        <tr key={o.id_os}>
                          <td>{o.id_os}</td>
                          <td>{o.nome_cliente}</td>
                          <td>
                            {o.tipo || 'N/D'} {o.marca || ''} {o.modelo || ''} ·{' '}
                            {o.numero_serie || 's/ série'}
                          </td>
                          <td>{o.status_os}</td>
                          <td>{new Date(o.data_criacao).toLocaleDateString()}</td>
                          <td>
                            <b>{mmToHuman(o.minutos_total || 0)}</b>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </MenuLateral>
  );
};

export default TecnicosAtribuicoes;
