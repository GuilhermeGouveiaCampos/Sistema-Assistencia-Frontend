// src/pages/relatorios/RelatorioOS.tsx
import React, { useEffect, useMemo, useState } from "react";
import MenuLateral from "../../components/MenuLateral";
import api from "../../services/api";

type ItemSel = { id: number; label: string };

const RelatorioOS: React.FC = () => {
  // Somente gerente (id === "1") vê esta página
  const isGerente = (localStorage.getItem("id") || "") === "1";

  const [statusList, setStatusList] = useState<ItemSel[]>([]);
  const [tecnicos, setTecnicos] = useState<ItemSel[]>([]);

  const [statusSel, setStatusSel] = useState<number[]>([]);
  const [tecnicosSel, setTecnicosSel] = useState<number[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const carregando = useMemo(
    () => statusList.length === 0 && tecnicos.length === 0,
    [statusList.length, tecnicos.length]
  );

  // ---- Carregar STATUS (usa /api/status) ----
  const loadStatus = async () => {
    try {
      const r = await api.get("/api/status");
      const list: ItemSel[] = (Array.isArray(r.data) ? r.data : []).map((s: any) => ({
        id: Number(s.id_status ?? s.id ?? 0),
        label: String(s.descricao ?? s.nome ?? ""),
      }));
      setStatusList(list);
    } catch (e) {
      console.error("Falha ao carregar status:", e);
      setStatusList([]);
    }
  };

  // ---- Carregar TÉCNICOS (usa /api/tecnicos) ----
  const loadTecnicos = async () => {
    try {
      const r = await api.get("/api/tecnicos");
      const list: ItemSel[] = (Array.isArray(r.data) ? r.data : []).map((t: any) => ({
        id: Number(t.id_tecnico ?? t.id ?? 0),
        label: String(t.nome ?? ""),
      }));
      setTecnicos(list);
    } catch (e) {
      console.error("Falha ao carregar técnicos:", e);
      setTecnicos([]);
    }
  };

  useEffect(() => {
    if (!isGerente) return;
    loadStatus();
    loadTecnicos();
  }, [isGerente]);

  // Util: trata múltiplos selects numéricos
  const handleMultiNumber = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setter: (ids: number[]) => void
  ) => {
    const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
    setter(values);
  };

  // ---- Gerar PDF ----
  const gerarPDF = async () => {
    try {
      // Monta query. Se nada selecionado, usa "all"
      const statusParam = statusSel.length ? statusSel.join(",") : "all";
      const tecParam = tecnicosSel.length ? tecnicosSel.join(",") : "all";
      const params = new URLSearchParams();
      params.set("status", statusParam);
      params.set("tecnico", tecParam);
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      // Requisição de arquivo (blob)
      const res = await api.get(`/api/relatorios/os?${params.toString()}`, {
        responseType: "blob",
      });

      // Baixar
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-os.pdf";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error("Falha ao gerar PDF:", e);
      alert("Não foi possível gerar o PDF. Tente novamente.");
    }
  };

  if (!isGerente) {
    return (
      <MenuLateral>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Relatório de Ordens de Serviço</h1>
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
        <h1 className="text-2xl font-semibold">Relatório de Ordens de Serviço</h1>

        {/* STATUS */}
        <div className="rounded-2xl p-4 border shadow-sm">
          <div className="mb-2 font-medium">Status</div>
          <select
            multiple
            value={statusSel.map(String)}
            onChange={(e) => handleMultiNumber(e, setStatusSel)}
            className="w-full border rounded p-2 min-h-[52px]"
          >
            {statusList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* TÉCNICOS */}
        <div className="rounded-2xl p-4 border shadow-sm">
          <div className="mb-2 font-medium">Técnicos</div>
          <select
            multiple
            value={tecnicosSel.map(String)}
            onChange={(e) => handleMultiNumber(e, setTecnicosSel)}
            className="w-full border rounded p-2 min-h-[52px]"
          >
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* PERÍODO */}
        <div className="rounded-2xl p-4 border shadow-sm">
          <div className="mb-2 font-medium">Período (de/até)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm opacity-80 mb-1">De</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border rounded p-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm opacity-80 mb-1">Até</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border rounded p-2"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:opacity-90 disabled:opacity-60"
            onClick={gerarPDF}
            disabled={carregando}
          >
            Gerar PDF
          </button>
        </div>
      </div>
    </MenuLateral>
  );
};

export default RelatorioOS;
