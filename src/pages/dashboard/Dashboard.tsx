// src/pages/dashboard/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuLateral from "../../components/MenuLateral";
import api from "../../services/api";

// Tipos do resumo
type PorStatus = { status: string; total: number };
type PorTecnico = { nome: string; abertas: number };
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
  por_tecnico: PorTecnico[];
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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // ✅ Restringir a dashboard ao gerente (id=1 no localStorage)
  const userId = localStorage.getItem("id");
  const isGerente = userId === "1";

  const [period, setPeriod] = useState<"day" | "month">("day");
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = async () => {
    if (!isGerente) return;
    setLoading(true);
    setError("");
    try {
      // IMPORTANTE: ajuste a rota conforme seu api.ts:
      // Se o baseURL NÃO inclui /api, use "/api/dashboard/summary"
      // Se o baseURL JÁ inclui /api, use "/dashboard/summary"
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
    // Normaliza rótulos longos
    return data.por_status.map((s) => ({
      status: s.status.length > 14 ? s.status.slice(0, 12) + "…" : s.status,
      total: s.total,
    }));
  }, [data]);

  const chartTecnicos = useMemo(() => {
    if (!data) return [];
    return data.por_tecnico.map((t) => ({
      name: t.nome,
      value: t.abertas,
    }));
  }, [data]);

  // Rosca radial precisa de soma total p/ legenda
  const totalAbertasTecnicos = useMemo(
    () => chartTecnicos.reduce((acc, it) => acc + it.value, 0),
    [chartTecnicos]
  );

  if (!isGerente) {
    return (
      <MenuLateral>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
          <div className="rounded border p-4 bg-red-500/10 border-red-500/30 text-red-600">
            Acesso restrito. Esta área é exclusiva do gerente.
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
            <label className="text-sm opacity-80">Entregues por:</label>
            <select
              className="border rounded px-2 py-1 bg-transparent"
              value={period}
              onChange={(e) => setPeriod(e.target.value as "day" | "month")}
            >
              <option value="day">Hoje</option>
              <option value="month">Mês</option>
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
            {/* Cards principais (linha de “widgets”) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card title="Clientes" value={data.total_clientes} />
              <Card title="OS em Aberto" value={data.em_aberto} />
              <Card
                title={period === "day" ? "Entregues Hoje" : "Entregues no Mês"}
                value={data.entregues}
              />
              <Card title="Em Diagnóstico" value={data.em_diagnostico} />
              <Card title="WhatsApp (Hoje)" value={data.msgs_hoje} />
            </div>

            {/* Linha de gráficos (estilo como sua referência) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Barras: OS por Status */}
              <Box title="OS por Status">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartStatus}>
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="total" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Box>

              {/* Rosca Radial: Abertas por Técnico */}
              <Box title="Abertas por Técnico">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="20%"
                      outerRadius="90%"
                      data={chartTecnicos}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={8}
                        label={{ position: "insideStart", fill: "#444", formatter: (v: any) => (v > 0 ? v : "") }}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        formatter={(value: string) => `${value}`}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm opacity-70 text-right mt-2">
                  Total: <span className="font-semibold">{totalAbertasTecnicos}</span>
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

const Card: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <div className="rounded-2xl p-4 border shadow-sm">
    <div className="text-sm opacity-70">{title}</div>
    <div className="text-3xl font-bold mt-1">{value}</div>
  </div>
);

const Box: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl p-4 border shadow-sm bg-white/40 dark:bg-white/5">
    <h2 className="font-medium mb-2">{title}</h2>
    {children}
  </div>
);

export default Dashboard;
