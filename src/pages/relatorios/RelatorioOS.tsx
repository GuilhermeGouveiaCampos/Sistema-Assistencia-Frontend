// src/pages/relatorios/RelatorioOS.tsx
import React, { useEffect, useState } from "react";
import MenuLateral from "../../components/MenuLateral";
import api from "../../services/api";

type StatusItem = { id_status: number; descricao: string };
type TecnicoItem = { id_tecnico: number; nome: string };

const RelatorioOS: React.FC = () => {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoItem[]>([]);

  const [statusSel, setStatusSel] = useState<string[]>([]);
  const [tecnicoSel, setTecnicoSel] = useState<string[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    // Carrega opções
    (async () => {
      try {
        // Se seu api.ts já usa /api na baseURL, remova /api daqui.
        const st = await api.get<StatusItem[]>("/api/status");         // já existe no seu backend
        const tec = await api.get<TecnicoItem[]>("/api/ordens/tecnicos"); // já existe no seu backend
        setStatuses(st.data);
        setTecnicos(tec.data);
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggleSel = (value: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const gerarPDF = async () => {
    const statusParam = statusSel.length ? statusSel.join(",") : "all";
    const tecnicoParam = tecnicoSel.length ? tecnicoSel.join(",") : "all";
    const q = new URLSearchParams();
    q.set("status", statusParam);
    q.set("tecnico", tecnicoParam);
    if (from) q.set("from", from);
    if (to) q.set("to", to);

    const url = `/api/relatorios/os?${q.toString()}`;

    const resp = await api.get(url, { responseType: "blob" });
    const blob = new Blob([resp.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-os.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <MenuLateral>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Relatório de Ordens de Serviço</h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status */}
          <div className="rounded-2xl p-4 border shadow-sm bg-white">
            <h2 className="font-medium mb-2">Status</h2>
            <div className="max-h-56 overflow-auto space-y-1">
              {statuses.map((s) => (
                <label key={s.id_status} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={statusSel.includes(String(s.id_status))}
                    onChange={() => toggleSel(String(s.id_status), statusSel, setStatusSel)}
                  />
                  <span>{s.descricao}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Técnicos */}
          <div className="rounded-2xl p-4 border shadow-sm bg-white">
            <h2 className="font-medium mb-2">Técnicos</h2>
            <div className="max-h-56 overflow-auto space-y-1">
              {tecnicos.map((t) => (
                <label key={t.id_tecnico} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={tecnicoSel.includes(String(t.id_tecnico))}
                    onChange={() => toggleSel(String(t.id_tecnico), tecnicoSel, setTecnicoSel)}
                  />
                  <span>{t.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Período */}
          <div className="rounded-2xl p-4 border shadow-sm bg-white">
            <h2 className="font-medium mb-2">Período (de/até)</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="w-20 text-sm opacity-80">De</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 text-sm opacity-80">Até</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-end">
          <button
            onClick={gerarPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Gerar PDF
          </button>
        </div>
      </div>
    </MenuLateral>
  );
};

export default RelatorioOS;
