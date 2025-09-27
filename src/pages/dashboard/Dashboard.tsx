// src/pages/dashboard/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import MenuLateral from "../../components/MenuLateral";
import api from "../../services/api";

// Tipos do resumo
type PorStatus = { status: string; total: number };
type PorTecnico = { nome: string; abertas: number; finalizadas_periodo: number };
type UltimaOS = {
  id_ordem: number;
  cliente: string;
  local: string | null;
  data_criacao: string;
  data_atualizacao: string;
  status: string;
};
type Summary = {
  total_clientes: number;
  em_aberto: number;
  entregues: number;
  em_diagnostico: number;
  por_status: PorStatus[];
  por_tecnico: PorTecnico[]; // agora inclui finalizadas_periodo
  ultimas_ordens: UltimaOS[];
  msgs_hoje: number;
};

// Gráficos (recharts)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";

const periodOptions = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "15d", label: "Últimos 15 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Mês atual" },
];

// paleta básica pra “dar vida” ao gráfico de status
const palette = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#e11d48"];

const Dashboard: React.FC = () => {
  // ✅ Restringir a dashboard ao gerente (id=1 no localStorage)
  const userId = localStorage.getItem("id");
  const isGerente = userId === "1";

  const [period, setPeriod] = useState<string>("today");
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = async () => {
    if (!isGerente) return;
    setLoading(true);
    setError("");
    try {
      // IMPORTANTE: ajuste conforme seu api.ts:
      // - Se baseURL já inclui /api, use "/dashboard/summary?..."
      // - Se NÃO inclui, mantenha "/api/dashboard/summary?..."
      const res = await api.get<Summary>(`/api/dashboard/summary?period=${period}`);
      setData(res.data);
    } catch (e) {
      setError("Falha ao carregar a dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, isGerente]);

  // Dados para gráficos
  const chartStatus = useMemo(() => {
    if (!data) return [];
    // Normaliza rótulos longos e aplica cores
    return data.por_status.map((s, i) => ({
      status: s.status.length > 14 ? s.status.slice(0, 12) + "…" : s.status,
      total: s.total,
      fill: palette[i % palette.length],
    }));
  }, [data]);

  // Técnicos: barras horizontais com Abertas (snapshot) e Finalizadas (no período selecionado)
  const chartTecnicos = useMemo(() => {
    if (!data) return [];
    return data.por_tecnico.map((t) => ({
      tecnico: t.nome,
      Abertas: t.abertas,
      Finalizadas: t.finalizadas_periodo,
    }));
  }, [data]);

  // Para não-gerente: saudação simples
  if (!isGerente) {
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    const mensagens = [
      "Tenha um ótimo dia!",
      "Bons atendimentos por aí!",
      "Foco no cliente 😀",
      "Conte com a equipe!",
    ];
    const msg = mensagens[hora % mensagens.length];

    return (
      <MenuLateral>
        <div className="p-8">
          <div className="rounded-2xl p-6 border shadow-sm bg-gradient-to-r from-indigo-50 to-cyan-50">
            <h1 className="text-2xl font-semibold mb-2">{saudacao}!</h1>
            <p className="text-lg opacity-80">{msg}</p>
          </div>
        </div>
      </MenuLateral>
    );
  }

  return (
    <MenuLateral>
      <div className="p-6 space-y-6">
        {/* Topo: Título + filtro */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm opacity-80">Período:</label>
            <select
              className="border rounded px-2 py-1 bg-white"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {periodOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <div className="opacity-70">Carregando...</div>}

        {error && (
          <div className="text-red-500 bg-red-500/10 border border-red-500/30 rounded p-3">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Cards principais — agora coloridinhos */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card title="Clientes" value={data.total_clientes} color="from-blue-500 to-blue-600" />
              <Card title="OS em Aberto" value={data.em_aberto} color="from-emerald-500 to-emerald-600" />
              <Card
                title={
                  period === "today"
                    ? "Entregues Hoje"
                    : period === "yesterday"
                    ? "Entregues Ontem"
                    : "Entregues (Período)"
                }
                value={data.entregues}
                color="from-amber-500 to-amber-600"
              />
              <Card title="Em Diagnóstico" value={data.em_diagnostico} color="from-fuchsia-500 to-fuchsia-600" />
              <Card title="WhatsApp (Hoje)" value={data.msgs_hoje} color="from-cyan-500 to-cyan-600" />
            </div>

            {/* Linha de gráficos e feed */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Barras: OS por Status */}
              <Box title="OS por Status">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="total">
                        {chartStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Box>

              {/* Técnicos — Barras horizontais: Abertas vs Finalizadas (no período) */}
              <Box title="Técnicos — Abertas (agora) vs Finalizadas (período)">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartTecnicos} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="tecnico" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Abertas" fill="#2563eb" />
                      <Bar dataKey="Finalizadas" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Box>

              {/* Últimas OS */}
              <Box title="Últimas OS">
                <ul className="space-y-2 text-sm max-h-72 overflow-auto pr-2">
                  {data.ultimas_ordens.length ? (
                    data.ultimas_ordens.map((o) => (
                      <li key={o.id_ordem} className="flex justify-between gap-2">
                        <div className="truncate">
                          <span className="font-semibold">#{o.id_ordem}</span>{" "}
                          <span className="opacity-80">• {o.cliente}</span>{" "}
                          <span className="opacity-60">
                            • {o.local ?? "-"} • {o.status}
                          </span>
                        </div>
                        <span className="opacity-60">
                          {new Date(o.data_criacao).toLocaleDateString()}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="opacity-60">Nenhuma OS</li>
                  )}
                </ul>
              </Box>
            </div>
          </>
        )}
      </div>
    </MenuLateral>
  );
};

const Card: React.FC<{ title: string; value: number | string; color: string }> = ({
  title,
  value,
  color,
}) => (
  <div className="rounded-2xl p-4 border shadow-sm bg-white">
    <div className={`text-xs uppercase tracking-wide mb-1 bg-gradient-to-r ${color} text-white inline-block px-2 py-0.5 rounded`}>
      {title}
    </div>
    <div className="text-3xl font-bold mt-1">{value}</div>
  </div>
);

const Box: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl p-4 border shadow-sm bg-white">
    <h2 className="font-medium mb-2">{title}</h2>
    {children}
  </div>
);

export default Dashboard;
