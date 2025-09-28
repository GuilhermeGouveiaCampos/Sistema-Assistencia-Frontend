// src/pages/relatorios/RelatorioOS.tsx
import React, { useEffect, useMemo, useState } from "react";
import MenuLateral from "../../components/MenuLateral";
import api from "../../services/api";
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";

type ItemSel = { id: number; label: string };

// --- Componente auxiliar: lista de checkboxes com cabeçalho colorido ---
function CheckboxCard(props: {
  title: string;
  colorClass: string; // ex: "bg-indigo-600"
  items: ItemSel[];
  selected: number[];
  onChange: (next: number[]) => void;
}) {
  const { title, colorClass, items, selected, onChange } = props;

  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((i) => i !== id));
    else onChange([...selected, id]);
  };

  const allSelected = items.length > 0 && selected.length === items.length;

  return (
    <div
      className="rounded-2xl border shadow-sm"
      style={{ overflow: "hidden", background: "white" }}
    >
      <div
        className={`${colorClass}`}
        style={{
          padding: "10px 14px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 600,
        }}
      >
        <span>{title}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => onChange(items.map((i) => i.id))}
            style={{
              background: "rgba(255,255,255,.18)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "white",
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Selecionar tudo
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            style={{
              background: "rgba(255,255,255,.18)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "white",
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Limpar
          </button>
        </div>
      </div>

      <div style={{ padding: 12 }}>
        {items.length === 0 ? (
          <div style={{ opacity: 0.7, fontSize: 14 }}>Nenhum item.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 8,
              maxHeight: 280,
              overflow: "auto",
              paddingRight: 4,
            }}
          >
            {items.map((it) => (
              <label
                key={it.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #e6e6e6",
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: selected.includes(it.id) ? "#f5f7ff" : "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(it.id)}
                  onChange={() => toggle(it.id)}
                />
                <span>{it.label}</span>
              </label>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
            {selected.length} / {items.length} selecionado(s)
            {allSelected ? " (Todos)" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

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

      const res = await api.get(`/api/relatorios/os?${params.toString()}`, {
        responseType: "blob",
      });

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
        <h1 className="titulo-clientes">RELATÓRIO DE ORDENS DE SERVIÇO</h1>
        <section className="clientes-section">
          <div className="container-central">
            <div className="rounded border p-4" style={{ color: "#b91c1c", background: "#fee2e2" }}>
              Acesso restrito. Esta área é exclusiva do gerente.
            </div>
          </div>
        </section>
      </MenuLateral>
    );
  }

  return (
    <MenuLateral>
      {/* Título padrão da aplicação (caixa alta) */}
      <h1 className="titulo-clientes">RELATÓRIO DE ORDENS DE SERVIÇO</h1>

      <section className="clientes-section">
        <div className="container-central" style={{ display: "grid", gap: 16 }}>
          {/* Linhas de filtros (Status / Técnicos) */}
          <div
            className="grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
            }}
          >
            <CheckboxCard
              title="Status"
              colorClass="bg-indigo-600"
              items={statusList}
              selected={statusSel}
              onChange={setStatusSel}
            />

            <CheckboxCard
              title="Técnicos"
              colorClass="bg-emerald-600"
              items={tecnicos}
              selected={tecnicosSel}
              onChange={setTecnicosSel}
            />
          </div>

          {/* Período */}
          <div
            className="rounded-2xl border shadow-sm"
            style={{ overflow: "hidden", background: "white" }}
          >
            <div
              className="bg-rose-600"
              style={{ padding: "10px 14px", color: "white", fontWeight: 600 }}
            >
              Período (de/até)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-sm" style={{ opacity: 0.8 }}>
                  De
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="text-sm" style={{ opacity: 0.8 }}>
                  Até
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border rounded p-2"
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              className="btn"
              style={{
                background: "#6b7280",
                color: "white",
                padding: "10px 14px",
                borderRadius: 10,
              }}
              onClick={() => {
                setStatusSel([]);
                setTecnicosSel([]);
                setFrom("");
                setTo("");
              }}
              disabled={carregando}
            >
              Limpar filtros
            </button>

            <button
              className="btn"
              style={{
                background: "#6d28d9",
                color: "white",
                padding: "10px 14px",
                borderRadius: 10,
              }}
              onClick={gerarPDF}
              disabled={carregando}
              title="Gerar PDF"
            >
              Gerar PDF
            </button>
          </div>
        </div>
      </section>

      <div className="voltar-container">
        <button className="btn roxo" onClick={() => (window.location.href = "/ordemservico")}>
          VOLTAR
        </button>
      </div>
    </MenuLateral>
  );
};

export default RelatorioOS;
