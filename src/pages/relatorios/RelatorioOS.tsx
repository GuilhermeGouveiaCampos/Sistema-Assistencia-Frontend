// src/pages/relatorios/RelatorioOS.tsx
import React, { useEffect, useMemo, useState } from "react";
import MenuLateral from "../../components/MenuLateral";
import api from "../../services/api";

// Reaproveita estilos do projeto (título em caixa alta, containers, botões etc.)
import "../dashboard/Dashboard.css";
import "../Css/Pesquisa.css";

type ItemSel = { id: number; label: string };

/* ================== Componentes auxiliares ================== */
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
        className={colorClass}
        style={{
          padding: "8px 12px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <span>{title}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => onChange(items.map((i) => i.id))}
            style={{
              background: "rgba(255,255,255,.18)",
              border: "1px solid rgba(255,255,255,.35)",
              color: "white",
              padding: "2px 6px",
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
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            Limpar
          </button>
        </div>
      </div>

      <div style={{ padding: 10 }}>
        {items.length === 0 ? (
          <div style={{ opacity: 0.7, fontSize: 13 }}>Nenhum item.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 6,
              maxHeight: 220,
              overflow: "auto",
              paddingRight: 2,
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
                  padding: "6px 8px",
                  borderRadius: 10,
                  background: selected.includes(it.id) ? "#f5f7ff" : "white",
                  fontSize: 14,
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
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
            {selected.length} / {items.length} selecionado(s)
            {allSelected ? " (Todos)" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

type OrdemResumo = {
  id_os: number | string;
  cliente?: string;
  tecnico?: string;
  status?: string;
  criado_em?: string; // ISO ou dd/MM/yyyy
  total?: number;
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 600,
  borderBottom: "1px solid #e5e7eb",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
};

// Tabela enxuta e responsiva
function TabelaResultados({ dados }: { dados: OrdemResumo[] }) {
  if (!dados.length) {
    return (
      <div
        className="rounded-2xl border"
        style={{ background: "white", padding: 12, fontSize: 14 }}
      >
        Nenhum resultado para os filtros aplicados.
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border"
      style={{ background: "white", overflow: "hidden" }}
    >
      <div
        style={{
          padding: "8px 12px",
          background: "#111827",
          color: "white",
          fontWeight: 600,
        }}
      >
        Resultados ({dados.length})
      </div>

      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={th}>ID</th>
              <th style={th}>Cliente</th>
              <th style={th}>Técnico</th>
              <th style={th}>Status</th>
              <th style={th}>Data</th>
              <th style={{ ...th, textAlign: "right" }}>Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((r, idx) => (
              <tr
                key={`${r.id_os}-${idx}`}
                style={{ borderTop: "1px solid #e5e7eb" }}
              >
                <td style={td}>{r.id_os}</td>
                <td style={td}>{r.cliente ?? "-"}</td>
                <td style={td}>{r.tecnico ?? "-"}</td>
                <td style={td}>{r.status ?? "-"}</td>
                <td style={td}>{r.criado_em ? formataData(r.criado_em) : "-"}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  {typeof r.total === "number" ? r.total.toFixed(2) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================== Página ================== */
const RelatorioOS: React.FC = () => {
  // Somente gerente (id === "1") vê esta página
  const isGerente = (localStorage.getItem("id") || "") === "1";

  const [statusList, setStatusList] = useState<ItemSel[]>([]);
  const [tecnicos, setTecnicos] = useState<ItemSel[]>([]);

  const [statusSel, setStatusSel] = useState<number[]>([]);
  const [tecnicosSel, setTecnicosSel] = useState<number[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [carregandoResultados, setCarregandoResultados] = useState(false);
  const [resultados, setResultados] = useState<OrdemResumo[]>([]);

  const carregandoFiltros = useMemo(
    () => statusList.length === 0 && tecnicos.length === 0,
    [statusList.length, tecnicos.length]
  );

  // ---- Carregar STATUS (usa /api/status) ----
  const loadStatus = async () => {
    try {
      const r = await api.get("/api/status");
      const list: ItemSel[] = (Array.isArray(r.data) ? r.data : []).map(
        (s: any) => ({
          id: Number(s.id_status ?? s.id ?? 0),
          label: String(s.descricao ?? s.nome ?? ""),
        })
      );
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
      const list: ItemSel[] = (Array.isArray(r.data) ? r.data : []).map(
        (t: any) => ({
          id: Number(t.id_tecnico ?? t.id ?? 0),
          label: String(t.nome ?? ""),
        })
      );
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

  // ---- Monta query string comum aos dois botões ----
  const montarParams = () => {
    const statusParam = statusSel.length ? statusSel.join(",") : "all";
    const tecParam = tecnicosSel.length ? tecnicosSel.join(",") : "all";
    const params = new URLSearchParams();
    params.set("status", statusParam);
    params.set("tecnico", tecParam);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params;
  };

  // ---- Buscar resultados JSON e mostrar na tela ----
  const buscarResultados = async () => {
    try {
      setCarregandoResultados(true);
      const params = montarParams();
      params.set("format", "json"); // (se o back não suportar, cairá no catch)
      const res = await api.get(`/api/relatorios/os?${params.toString()}`);
      const arr = Array.isArray(res.data) ? res.data : [];
      const norm: OrdemResumo[] = arr.map((x: any) => ({
        id_os: x.id_os ?? x.id ?? x.os ?? "-",
        cliente: x.cliente ?? x.nome_cliente ?? undefined,
        tecnico: x.tecnico ?? x.nome_tecnico ?? undefined,
        status: x.status ?? x.nome_status ?? x.descricao_status ?? undefined,
        criado_em: x.criado_em ?? x.data ?? x.created_at ?? undefined,
        total:
          typeof x.total === "number"
            ? x.total
            : Number(x.total_valor ?? x.valor_total ?? NaN),
      }));
      setResultados(norm);
    } catch (e) {
      console.error("Falha ao buscar resultados JSON:", e);
      setResultados([]);
      alert(
        "Não foi possível obter os resultados em JSON.\n" +
          "Se o backend ainda não suporta ?format=json, use apenas o botão Gerar PDF."
      );
    } finally {
      setCarregandoResultados(false);
    }
  };

  // ---- Gerar PDF (no fim da página) ----
  const gerarPDF = async () => {
    try {
      const params = montarParams();
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
            <div
              className="rounded border p-4"
              style={{ color: "#b91c1c", background: "#fee2e2" }}
            >
              Acesso restrito. Esta área é exclusiva do gerente.
            </div>
          </div>
        </section>
      </MenuLateral>
    );
  }

  return (
    <MenuLateral>
      {/* título padrão (caixa alta + linha) */}
      <h1 className="titulo-clientes">RELATÓRIO DE ORDENS DE SERVIÇO</h1>

      <section className="clientes-section">
        <div
          className="container-central"
          style={{ display: "grid", gap: 14 }}
        >
          {/* ====== Filtros em duas colunas ====== */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 14,
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

          {/* ====== Período ====== */}
          <div
            className="rounded-2xl border shadow-sm"
            style={{ overflow: "hidden", background: "white" }}
          >
            <div
              className="bg-rose-600"
              style={{
                padding: "8px 12px",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Período (de/até)
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
                padding: 10,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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

          {/* ====== Ações dos filtros ====== */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn"
              style={{
                background: "#6b7280",
                color: "white",
                padding: "8px 12px",
                borderRadius: 10,
              }}
              onClick={() => {
                setStatusSel([]);
                setTecnicosSel([]);
                setFrom("");
                setTo("");
                setResultados([]);
              }}
              disabled={carregandoFiltros || carregandoResultados}
            >
              Limpar filtros
            </button>

            <button
              className="btn"
              style={{
                background: "#0ea5e9",
                color: "white",
                padding: "8px 12px",
                borderRadius: 10,
              }}
              onClick={buscarResultados}
              disabled={carregandoFiltros || carregandoResultados}
              title="Aplicar filtros"
            >
              {carregandoResultados ? "Carregando..." : "Aplicar filtros"}
            </button>
          </div>

          {/* ====== Resultados abaixo ====== */}
          <TabelaResultados dados={resultados} />

          {/* ====== Botão Gerar PDF no fim ====== */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn"
              style={{
                background: "#6d28d9",
                color: "white",
                padding: "10px 14px",
                borderRadius: 10,
              }}
              onClick={gerarPDF}
              disabled={carregandoFiltros}
              title="Gerar PDF"
            >
              Gerar PDF
            </button>
          </div>

          {/* Voltar */}
          <div className="voltar-container">
            <button
              className="btn roxo"
              onClick={() => (window.location.href = "/ordemservico")}
            >
              VOLTAR
            </button>
          </div>
        </div>
      </section>
    </MenuLateral>
  );
};

export default RelatorioOS;

/* ================== Helpers ================== */
function formataData(s: string) {
  // aceita ISO (2025-06-20...) ou dd/MM/yyyy
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = d.getFullYear();
      return `${dd}/${mm}/${yy}`;
    }
  }
  return s;
}
