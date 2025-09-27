// src/pages/dashboard/Dashboard.tsx
import React, { useEffect, useState } from "react";
import MenuLateral from "../../components/MenuLateral";
import api from "../../services/api";

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

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<"day" | "month">("day");
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Summary>(`/dashboard/summary?period=${period}`);
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
  }, [period]);

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

        {/* Estados */}
        {loading && <div className="opacity-70">Carregando...</div>}
        {error && (
          <div className="text-red-500 bg-red-500/10 border border-red-500/30 rounded p-3">
            {error}
          </div>
        )}

        {/* Cards principais */}
        {!loading && !error && data && (
          <>
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

            {/* Listas e métricas adicionais */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Por Status */}
              <Box title="Por Status">
                <ul className="space-y-1 text-sm">
                  {data.por_status.length ? (
                    data.por_status.map((s) => (
                      <li key={s.status} className="flex justify-between">
                        <span>{s.status}</span>
                        <span className="font-semibold">{s.total}</span>
                      </li>
                    ))
                  ) : (
                    <li className="opacity-60">Nenhum item</li>
                  )}
                </ul>
              </Box>

              {/* Por Técnico (abertas) */}
              <Box title="Por Técnico (Abertas)">
                <ul className="space-y-1 text-sm">
                  {data.por_tecnico.length ? (
                    data.por_tecnico.map((t) => (
                      <li key={t.nome} className="flex justify-between">
                        <span>{t.nome}</span>
                        <span className="font-semibold">{t.abertas}</span>
                      </li>
                    ))
                  ) : (
                    <li className="opacity-60">Nenhum item</li>
                  )}
                </ul>
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

const Card: React.FC<{ title: string; value: number | string }> = ({
  title,
  value,
}) => (
  <div className="rounded-2xl p-4 border">
    <div className="text-sm opacity-70">{title}</div>
    <div className="text-3xl font-bold mt-1">{value}</div>
  </div>
);

const Box: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="rounded-2xl p-4 border">
    <h2 className="font-medium mb-2">{title}</h2>
    {children}
  </div>
);

export default Dashboard;
