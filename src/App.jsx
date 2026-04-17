
import { useState, useEffect, useCallback } from "react";

// ─── Static GPU Data (sourced from provider docs, April 2026) ───────────────

const GPU_DATA = {
  aws: {
    label: "Amazon Web Services",
    color: "#FF9900",
    textColor: "#000",
    bgColor: "#FFF8EE",
    borderColor: "#FF9900",
    instances: [
      { family: "p5", instance: "p5.48xlarge", gpu: "H100 80GB SXM", count: 8, vram: "640GB", arch: "Hopper", useCase: "LLM Training", priceHr: 98.32, tier: "flagship",
        regions: ["us-east-1","us-west-2","eu-west-1"] },
      { family: "p5e", instance: "p5e.48xlarge", gpu: "H200 141GB SXM", count: 8, vram: "1.1TB", arch: "Hopper", useCase: "LLM Training", priceHr: 147.0, tier: "flagship",
        regions: ["us-east-1","us-west-2"] },
      { family: "p4d", instance: "p4d.24xlarge", gpu: "A100 40GB", count: 8, vram: "320GB", arch: "Ampere", useCase: "ML Training", priceHr: 32.77, tier: "high",
        regions: ["us-east-1","us-east-2","us-west-2","eu-west-1","ap-northeast-1"] },
      { family: "p4de", instance: "p4de.24xlarge", gpu: "A100 80GB", count: 8, vram: "640GB", arch: "Ampere", useCase: "Large Model Training", priceHr: 40.96, tier: "high",
        regions: ["us-east-1","us-west-2","eu-west-1"] },
      { family: "p3", instance: "p3.16xlarge", gpu: "V100 16GB", count: 8, vram: "128GB", arch: "Volta", useCase: "ML/HPC", priceHr: 24.48, tier: "mid",
        regions: ["us-east-1","us-east-2","us-west-2","eu-west-1","ap-northeast-1","ap-southeast-1","ap-southeast-2"] },
      { family: "g5", instance: "g5.48xlarge", gpu: "A10G 24GB", count: 8, vram: "192GB", arch: "Ampere", useCase: "Inference/Graphics", priceHr: 16.29, tier: "mid",
        regions: ["us-east-1","us-east-2","us-west-2","eu-west-1","ap-northeast-1","ca-central-1"] },
      { family: "g6", instance: "g6.48xlarge", gpu: "L4 24GB", count: 8, vram: "192GB", arch: "Ada Lovelace", useCase: "Inference", priceHr: 13.50, tier: "mid",
        regions: ["us-east-1","us-west-2","eu-west-1"] },
      { family: "g4dn", instance: "g4dn.12xlarge", gpu: "T4 16GB", count: 4, vram: "64GB", arch: "Turing", useCase: "Inference/ML Dev", priceHr: 3.91, tier: "entry",
        regions: ["us-east-1","us-east-2","us-west-1","us-west-2","eu-west-1","eu-central-1","ap-northeast-1","ap-southeast-1","ap-southeast-2","sa-east-1"] },
    ]
  },
  azure: {
    label: "Microsoft Azure",
    color: "#0078D4",
    textColor: "#fff",
    bgColor: "#EEF6FF",
    borderColor: "#0078D4",
    instances: [
      { family: "ND H100 v5", instance: "Standard_ND96isr_H100_v5", gpu: "H100 80GB SXM", count: 8, vram: "640GB", arch: "Hopper", useCase: "LLM Training", priceHr: 96.87, tier: "flagship",
        regions: ["eastus","westus3","eastus2","southcentralus","swedencentral","germanywestcentral"] },
      { family: "ND H200 v5", instance: "Standard_ND96isr_H200_v5", gpu: "H200 141GB SXM", count: 8, vram: "1.1TB", arch: "Hopper", useCase: "LLM Training", priceHr: 142.0, tier: "flagship",
        regions: ["eastus","westus3","swedencentral"] },
      { family: "NC A100 v4", instance: "Standard_NC96ads_A100_v4", gpu: "A100 80GB PCIe", count: 4, vram: "320GB", arch: "Ampere", useCase: "ML Training", priceHr: 13.78, tier: "high",
        regions: ["eastus","westus2","westeurope","northeurope","eastasia","japaneast","australiaeast"] },
      { family: "ND A100 v4", instance: "Standard_ND96amsr_A100_v4", gpu: "A100 80GB SXM", count: 8, vram: "640GB", arch: "Ampere", useCase: "Large Model Training", priceHr: 32.77, tier: "high",
        regions: ["eastus","westus2","westeurope","southcentralus","japaneast"] },
      { family: "NC V100 v3", instance: "Standard_NC24rs_v3", gpu: "V100 16GB", count: 4, vram: "64GB", arch: "Volta", useCase: "ML/HPC", priceHr: 12.24, tier: "mid",
        regions: ["eastus","westus2","westeurope","northeurope","southeastasia","australiaeast","canadacentral","uksouth"] },
      { family: "NVadsA10 v5", instance: "Standard_NV72ads_A10_v5", gpu: "A10 24GB", count: 2, vram: "48GB", arch: "Ampere", useCase: "VDI/Inference", priceHr: 4.60, tier: "mid",
        regions: ["eastus","westus2","westeurope","southcentralus","northeurope","japaneast","australiaeast"] },
      { family: "NCasT4 v3", instance: "Standard_NC16as_T4_v3", gpu: "T4 16GB", count: 1, vram: "16GB", arch: "Turing", useCase: "Inference/Dev", priceHr: 1.20, tier: "entry",
        regions: ["eastus","eastus2","westus2","westeurope","northeurope","southeastasia","australiaeast","japaneast","uksouth","brazilsouth","centralindia","koreacentral"] },
    ]
  },
  gcp: {
    label: "Google Cloud Platform",
    color: "#34A853",
    textColor: "#fff",
    bgColor: "#EEFAF2",
    borderColor: "#34A853",
    instances: [
      { family: "A3 Mega", instance: "a3-megagpu-8g", gpu: "H100 80GB SXM", count: 8, vram: "640GB", arch: "Hopper", useCase: "LLM Training", priceHr: 89.45, tier: "flagship",
        regions: ["us-central1","us-east4","europe-west4","asia-southeast1"] },
      { family: "A3 High", instance: "a3-highgpu-8g", gpu: "H100 80GB SXM", count: 8, vram: "640GB", arch: "Hopper", useCase: "LLM Training", priceHr: 88.49, tier: "flagship",
        regions: ["us-central1","us-east4","us-west1","europe-west4","europe-west1","asia-northeast1"] },
      { family: "A3 Ultra", instance: "a3-ultragpu-8g", gpu: "H200 141GB SXM", count: 8, vram: "1.1TB", arch: "Hopper", useCase: "LLM Training", priceHr: 135.0, tier: "flagship",
        regions: ["us-central1","us-east4"] },
      { family: "A2 Standard", instance: "a2-highgpu-8g", gpu: "A100 40GB SXM", count: 8, vram: "320GB", arch: "Ampere", useCase: "ML Training", priceHr: 26.37, tier: "high",
        regions: ["us-central1","us-east1","us-east4","us-west1","us-west4","europe-west4","europe-west1","asia-east1","asia-northeast1","asia-southeast1"] },
      { family: "A2 Ultra", instance: "a2-ultragpu-8g", gpu: "A100 80GB SXM", count: 8, vram: "640GB", arch: "Ampere", useCase: "Large Model Training", priceHr: 40.54, tier: "high",
        regions: ["us-central1","us-east4","europe-west4"] },
      { family: "G2 Standard", instance: "g2-standard-96", gpu: "L4 24GB", count: 8, vram: "192GB", arch: "Ada Lovelace", useCase: "Inference/Video", priceHr: 12.39, tier: "mid",
        regions: ["us-central1","us-east1","us-east4","us-west1","europe-west4","europe-west1","asia-east1","asia-northeast1","asia-southeast1"] },
      { family: "N1 + T4", instance: "n1-standard-32 + 4xT4", gpu: "T4 16GB", count: 4, vram: "64GB", arch: "Turing", useCase: "Inference/ML Dev", priceHr: 2.73, tier: "entry",
        regions: ["us-central1","us-east1","us-east4","us-west1","us-west2","us-west4","europe-west1","europe-west2","europe-west4","asia-east1","asia-northeast1","asia-southeast1","southamerica-east1"] },
      { family: "N1 + V100", instance: "n1-standard-32 + 4xV100", gpu: "V100 16GB", count: 4, vram: "64GB", arch: "Volta", useCase: "ML/HPC", priceHr: 7.59, tier: "mid",
        regions: ["us-central1","us-east1","us-west1","us-west2","europe-west1","europe-west4","asia-east1","asia-northeast1"] },
    ]
  }
};

const TIER_COLORS = {
  flagship: { bg: "#7C3AED", label: "Flagship" },
  high:     { bg: "#2563EB", label: "High-End"  },
  mid:      { bg: "#059669", label: "Mid-Tier"  },
  entry:    { bg: "#D97706", label: "Entry"     },
};

const ALL_REGIONS = [...new Set([
  ...GPU_DATA.aws.instances.flatMap(i => i.regions),
  ...GPU_DATA.azure.instances.flatMap(i => i.regions),
  ...GPU_DATA.gcp.instances.flatMap(i => i.regions),
])].sort();

const GPU_MODELS = [...new Set([
  ...Object.values(GPU_DATA).flatMap(p => p.instances.map(i => i.gpu.split(" ")[0] + " " + i.gpu.split(" ")[1]))
])];

// ─── Simulated "live" availability (refreshes every 30s) ────────────────────
function generateAvailability() {
  const out = {};
  for (const [provider, data] of Object.entries(GPU_DATA)) {
    out[provider] = {};
    for (const inst of data.instances) {
      for (const region of inst.regions) {
        const key = `${inst.instance}::${region}`;
        const roll = Math.random();
        out[provider][key] = roll > 0.25 ? (roll > 0.6 ? "high" : "limited") : "scarce";
      }
    }
  }
  return out;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function AvailDot({ level }) {
  const map = { high: "#22c55e", limited: "#f59e0b", scarce: "#ef4444" };
  const labels = { high: "Available", limited: "Limited", scarce: "Scarce" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{
        width: 9, height: 9, borderRadius: "50%",
        background: map[level], display: "inline-block",
        boxShadow: `0 0 6px ${map[level]}88`
      }} />
      <span style={{ fontSize: 11, color: map[level], fontWeight: 600 }}>{labels[level]}</span>
    </span>
  );
}

function TierBadge({ tier }) {
  const t = TIER_COLORS[tier];
  return (
    <span style={{
      background: t.bg + "22", color: t.bg, border: `1px solid ${t.bg}44`,
      borderRadius: 4, fontSize: 10, fontWeight: 700, padding: "1px 6px", letterSpacing: "0.04em"
    }}>{t.label}</span>
  );
}

function ProviderTag({ provider }) {
  const p = GPU_DATA[provider];
  return (
    <span style={{
      background: p.color + "18", color: p.color, border: `1px solid ${p.color}44`,
      borderRadius: 4, fontSize: 10, fontWeight: 700, padding: "1px 6px"
    }}>{p.label.split(" ")[0]}</span>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function GPUTracker() {
  const [view, setView]               = useState("dashboard");   // dashboard | region | tracking
  const [avail, setAvail]             = useState(() => generateAvailability());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing]   = useState(false);
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterTier, setFilterTier]   = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterGPU, setFilterGPU]     = useState("all");
  const [sortBy, setSortBy]           = useState("provider");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [countdown, setCountdown]     = useState(30);
  const [expandedInstance, setExpandedInstance] = useState(null);

  // Auto-refresh every 30s
  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          doRefresh();
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const doRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setAvail(generateAvailability());
      setLastRefresh(new Date());
      setRefreshing(false);
      setCountdown(30);
    }, 600);
  }, []);

  // Flatten all instances for list view
  const allInstances = Object.entries(GPU_DATA).flatMap(([provider, data]) =>
    data.instances.map(inst => ({ ...inst, provider }))
  );

  const filteredInstances = allInstances.filter(inst => {
    if (filterProvider !== "all" && inst.provider !== filterProvider) return false;
    if (filterTier !== "all" && inst.tier !== filterTier) return false;
    if (filterGPU !== "all" && !inst.gpu.includes(filterGPU)) return false;
    if (filterRegion !== "all" && !inst.regions.includes(filterRegion)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price") return a.priceHr - b.priceHr;
    if (sortBy === "gpus") return b.count - a.count;
    if (sortBy === "provider") return a.provider.localeCompare(b.provider);
    if (sortBy === "tier") {
      const order = { flagship: 0, high: 1, mid: 2, entry: 3 };
      return order[a.tier] - order[b.tier];
    }
    return 0;
  });

  // Region view: build a map of region -> instances across all providers
  const regionMap = {};
  for (const [provider, data] of Object.entries(GPU_DATA)) {
    for (const inst of data.instances) {
      for (const region of inst.regions) {
        if (!regionMap[region]) regionMap[region] = [];
        const key = `${inst.instance}::${region}`;
        regionMap[region].push({
          ...inst, provider,
          avail: avail[provider]?.[key] ?? "scarce"
        });
      }
    }
  }

  const styles = {
    container: {
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: "#0F1117",
      minHeight: "100vh",
      color: "#E2E8F0",
      padding: "0",
    },
    header: {
      background: "linear-gradient(135deg, #1a1f2e 0%, #0d1117 100%)",
      borderBottom: "1px solid #2d3748",
      padding: "18px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12,
    },
    title: { fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", margin: 0 },
    subtitle: { fontSize: 12, color: "#718096", marginTop: 2 },
    navBar: {
      display: "flex", gap: 4, background: "#1a1f2e",
      borderRadius: 8, padding: 4,
    },
    navBtn: (active) => ({
      padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
      fontSize: 13, fontWeight: 600,
      background: active ? "#6366F1" : "transparent",
      color: active ? "#fff" : "#718096",
      transition: "all 0.15s",
    }),
    content: { padding: "20px 24px", maxWidth: 1400, margin: "0 auto" },
    card: {
      background: "#1a1f2e", border: "1px solid #2d3748",
      borderRadius: 12, padding: "16px", marginBottom: 12,
    },
    statCard: (color) => ({
      background: color + "11", border: `1px solid ${color}33`,
      borderRadius: 10, padding: "14px 16px", flex: 1, minWidth: 130,
    }),
    filterBar: {
      display: "flex", gap: 8, flexWrap: "wrap",
      background: "#1a1f2e", borderRadius: 10, padding: "12px 16px",
      border: "1px solid #2d3748", marginBottom: 16, alignItems: "center",
    },
    select: {
      background: "#0d1117", border: "1px solid #2d3748",
      color: "#E2E8F0", borderRadius: 6, padding: "5px 10px",
      fontSize: 12, cursor: "pointer", outline: "none",
    },
    instanceRow: (expanded) => ({
      background: expanded ? "#1e2535" : "#151a26",
      border: "1px solid " + (expanded ? "#4F46E5" : "#2d3748"),
      borderRadius: 10, marginBottom: 8,
      cursor: "pointer", transition: "all 0.15s",
      overflow: "hidden",
    }),
    instHeader: {
      display: "flex", alignItems: "center", padding: "12px 14px",
      gap: 10, flexWrap: "wrap",
    },
    tag: (bg, color) => ({
      background: bg + "22", color, border: `1px solid ${bg}44`,
      borderRadius: 4, fontSize: 10, fontWeight: 700, padding: "1px 6px",
    }),
    refreshBtn: {
      background: "#6366F1", color: "#fff", border: "none",
      borderRadius: 6, padding: "7px 14px", fontSize: 12,
      fontWeight: 700, cursor: "pointer", display: "flex",
      alignItems: "center", gap: 6,
    },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 },
    pill: (active, color="#6366F1") => ({
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      cursor: "pointer", border: `1px solid ${active ? color : "#2d3748"}`,
      background: active ? color + "22" : "transparent",
      color: active ? color : "#718096",
      transition: "all 0.12s",
    }),
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalInstances = allInstances.length;
  const h100Count = allInstances.filter(i => i.gpu.includes("H100")).length;
  const regionCount = Object.keys(regionMap).length;
  const availHigh = Object.values(avail).flatMap(p => Object.values(p)).filter(v => v === "high").length;
  const availLimited = Object.values(avail).flatMap(p => Object.values(p)).filter(v => v === "limited").length;
  const availScarce = Object.values(avail).flatMap(p => Object.values(p)).filter(v => v === "scarce").length;

  // ─── Dashboard View ───────────────────────────────────────────────────────
  const DashboardView = () => (
    <div>
      {/* Stats Row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          { label: "Total Instance Types", value: totalInstances, color: "#6366F1" },
          { label: "H100/H200 Configs", value: h100Count, color: "#A855F7" },
          { label: "Regions Covered", value: regionCount, color: "#06B6D4" },
          { label: "Slots Available", value: availHigh, color: "#22C55E" },
          { label: "Limited Capacity", value: availLimited, color: "#F59E0B" },
          { label: "Scarce / Quota", value: availScarce, color: "#EF4444" },
        ].map(s => (
          <div key={s.label} style={styles.statCard(s.color)}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#718096", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Provider Summaries */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(GPU_DATA).map(([key, p]) => {
          const insts = p.instances;
          const flagshipCount = insts.filter(i => i.tier === "flagship").length;
          const totalGPUSlots = insts.reduce((s, i) => s + i.count, 0);
          return (
            <div key={key} style={{
              flex: 1, minWidth: 260,
              background: "#1a1f2e", border: `1px solid ${p.color}44`,
              borderTop: `3px solid ${p.color}`,
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{p.label}</div>
                <div style={{
                  background: p.color + "22", color: p.color,
                  border: `1px solid ${p.color}44`,
                  borderRadius: 6, fontSize: 11, fontWeight: 700, padding: "2px 8px"
                }}>{insts.length} types</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#718096" }}>🔥 Flagship: <b style={{ color: "#fff" }}>{flagshipCount}</b></div>
                <div style={{ fontSize: 11, color: "#718096" }}>🖥 Max GPUs/VM: <b style={{ color: "#fff" }}>{Math.max(...insts.map(i => i.count))}</b></div>
                <div style={{ fontSize: 11, color: "#718096" }}>💰 From: <b style={{ color: p.color }}>${Math.min(...insts.map(i => i.priceHr)).toFixed(2)}/hr</b></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {insts.slice(0, 4).map(inst => {
                  const keys = inst.regions.map(r => `${inst.instance}::${r}`);
                  const availVals = keys.map(k => avail[key]?.[k]);
                  const hasHigh = availVals.includes("high");
                  const hasLim = availVals.includes("limited");
                  const status = hasHigh ? "high" : hasLim ? "limited" : "scarce";
                  return (
                    <div key={inst.instance} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "#0d1117", borderRadius: 6, padding: "5px 8px",
                    }}>
                      <span style={{ fontSize: 11, color: "#E2E8F0", fontFamily: "monospace" }}>{inst.instance}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#718096" }}>{inst.gpu.split(" ").slice(0, 2).join(" ")}</span>
                        <AvailDot level={status} />
                      </div>
                    </div>
                  );
                })}
                {insts.length > 4 && <div style={{ fontSize: 10, color: "#718096", textAlign: "center" }}>+{insts.length - 4} more...</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instance List */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={styles.sectionTitle}>All GPU Instance Types</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["provider","tier","price","gpus"].map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                style={styles.pill(sortBy === s)}>
                Sort: {s}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <span style={{ fontSize: 11, color: "#718096", fontWeight: 700 }}>FILTER:</span>
          <select style={styles.select} value={filterProvider} onChange={e => setFilterProvider(e.target.value)}>
            <option value="all">All Providers</option>
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
            <option value="gcp">GCP</option>
          </select>
          <select style={styles.select} value={filterTier} onChange={e => setFilterTier(e.target.value)}>
            <option value="all">All Tiers</option>
            <option value="flagship">Flagship</option>
            <option value="high">High-End</option>
            <option value="mid">Mid-Tier</option>
            <option value="entry">Entry</option>
          </select>
          <select style={styles.select} value={filterGPU} onChange={e => setFilterGPU(e.target.value)}>
            <option value="all">All GPUs</option>
            <option value="H200">H200</option>
            <option value="H100">H100</option>
            <option value="A100">A100</option>
            <option value="V100">V100</option>
            <option value="T4">T4</option>
            <option value="L4">L4</option>
            <option value="A10">A10</option>
          </select>
          <select style={styles.select} value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
            <option value="all">All Regions</option>
            {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span style={{ fontSize: 11, color: "#718096", marginLeft: "auto" }}>
            Showing <b style={{ color: "#fff" }}>{filteredInstances.length}</b> of {totalInstances}
          </span>
        </div>

        {filteredInstances.map(inst => {
          const p = GPU_DATA[inst.provider];
          const isExpanded = expandedInstance === `${inst.provider}::${inst.instance}`;
          const availVals = inst.regions.map(r => avail[inst.provider]?.[`${inst.instance}::${r}`] ?? "scarce");
          const highCount = availVals.filter(v => v === "high").length;
          const limCount  = availVals.filter(v => v === "limited").length;
          const scarceCount = availVals.filter(v => v === "scarce").length;

          return (
            <div key={`${inst.provider}::${inst.instance}`}
              style={styles.instanceRow(isExpanded)}
              onClick={() => setExpandedInstance(isExpanded ? null : `${inst.provider}::${inst.instance}`)}>
              <div style={styles.instHeader}>
                <ProviderTag provider={inst.provider} />
                <TierBadge tier={inst.tier} />
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#fff", flex: 1, minWidth: 180 }}>
                  {inst.instance}
                </span>
                <span style={{ fontSize: 12, color: "#A855F7", fontWeight: 700, minWidth: 90 }}>
                  {inst.count}× {inst.gpu.split(" ").slice(0,2).join(" ")}
                </span>
                <span style={{ fontSize: 11, color: "#718096", minWidth: 60 }}>{inst.vram} VRAM</span>
                <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 700, minWidth: 80 }}>${inst.priceHr}/hr</span>
                <div style={{ display: "flex", gap: 6, minWidth: 180 }}>
                  {highCount > 0 && <span style={{ fontSize: 10, background: "#22C55E22", color: "#22C55E", borderRadius: 4, padding: "1px 5px" }}>✓ {highCount} avail</span>}
                  {limCount > 0  && <span style={{ fontSize: 10, background: "#F59E0B22", color: "#F59E0B", borderRadius: 4, padding: "1px 5px" }}>~ {limCount} limited</span>}
                  {scarceCount > 0 && <span style={{ fontSize: 10, background: "#EF444422", color: "#EF4444", borderRadius: 4, padding: "1px 5px" }}>✕ {scarceCount} scarce</span>}
                </div>
                <span style={{ fontSize: 11, color: "#4B5563", marginLeft: "auto" }}>
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>

              {isExpanded && (
                <div style={{ padding: "0 14px 14px", borderTop: "1px solid #2d3748" }}>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "10px 0 8px" }}>
                    {[
                      ["GPU Model", inst.gpu],
                      ["Architecture", inst.arch],
                      ["GPUs/VM", inst.count],
                      ["VRAM", inst.vram],
                      ["Use Case", inst.useCase],
                      ["On-Demand Price", `$${inst.priceHr}/hr`],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 10, color: "#718096", fontWeight: 700, letterSpacing: "0.05em" }}>{k.toUpperCase()}</div>
                        <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: "#718096", fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>REGIONAL AVAILABILITY</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {inst.regions.map(region => {
                        const key = `${inst.instance}::${region}`;
                        const level = avail[inst.provider]?.[key] ?? "scarce";
                        const colMap = { high: "#22C55E", limited: "#F59E0B", scarce: "#EF4444" };
                        const col = colMap[level];
                        return (
                          <div key={region} style={{
                            background: col + "11", border: `1px solid ${col}33`,
                            borderRadius: 6, padding: "4px 8px", fontSize: 11,
                          }}>
                            <span style={{ color: "#E2E8F0" }}>{region}</span>
                            <span style={{ color: col, marginLeft: 5, fontWeight: 700 }}>
                              {level === "high" ? "●" : level === "limited" ? "◐" : "○"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Region View ──────────────────────────────────────────────────────────
  const RegionView = () => {
    const regions = Object.keys(regionMap).sort();
    const providerFilter = filterProvider;

    const getRegionGeo = (region) => {
      if (region.includes("us-east") || region.includes("eastus") || region.includes("northvirginia")) return "🇺🇸 US East";
      if (region.includes("us-west") || region.includes("westus") || region.includes("uswest")) return "🇺🇸 US West";
      if (region.includes("us-central") || region.includes("centralus") || region.includes("ca-")) return "🇺🇸 US Central / Canada";
      if (region.includes("southcentral") || region.includes("sa-")) return "🌎 Americas";
      if (region.includes("eu") || region.includes("europe") || region.includes("uk") || region.includes("germany") || region.includes("sweden") || region.includes("france") || region.includes("italy") || region.includes("poland")) return "🇪🇺 Europe";
      if (region.includes("ap") || region.includes("asia") || region.includes("japan") || region.includes("korea") || region.includes("australia") || region.includes("india")) return "🌏 Asia Pacific";
      return "🌐 Other";
    };

    const geoGroups = {};
    for (const region of regions) {
      const geo = getRegionGeo(region);
      if (!geoGroups[geo]) geoGroups[geo] = [];
      const insts = regionMap[region].filter(i =>
        providerFilter === "all" || i.provider === providerFilter
      );
      if (insts.length > 0) geoGroups[geo].push({ region, insts });
    }

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#718096", fontWeight: 700 }}>PROVIDER:</span>
          {["all","aws","azure","gcp"].map(p => (
            <button key={p} onClick={() => setFilterProvider(p)}
              style={styles.pill(filterProvider === p)}>
              {p === "all" ? "All" : GPU_DATA[p]?.label.split(" ")[0] ?? p.toUpperCase()}
            </button>
          ))}
        </div>

        {Object.entries(geoGroups).sort().map(([geo, regionList]) => (
          <div key={geo} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              {geo}
              <span style={{ fontSize: 11, color: "#718096", fontWeight: 400 }}>{regionList.length} regions</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {regionList.map(({ region, insts }) => {
                const h100s = insts.filter(i => i.gpu.includes("H100") || i.gpu.includes("H200"));
                const a100s = insts.filter(i => i.gpu.includes("A100"));
                const others = insts.filter(i => !i.gpu.includes("H100") && !i.gpu.includes("H200") && !i.gpu.includes("A100"));
                const availHigh = insts.filter(i => {
                  const k = `${i.instance}::${region}`;
                  return avail[i.provider]?.[k] === "high";
                }).length;

                return (
                  <div key={region} style={{
                    background: "#1a1f2e", border: "1px solid #2d3748",
                    borderRadius: 10, padding: "12px 14px",
                    cursor: "pointer",
                    borderColor: selectedRegion === region ? "#6366F1" : "#2d3748",
                  }} onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>{region}</span>
                      <span style={{ fontSize: 10, background: availHigh > 0 ? "#22C55E22" : "#EF444422",
                        color: availHigh > 0 ? "#22C55E" : "#EF4444",
                        borderRadius: 4, padding: "1px 6px" }}>
                        {availHigh}/{insts.length} avail
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {h100s.length > 0 && (
                        <span style={{ fontSize: 10, background: "#7C3AED22", color: "#A78BFA", borderRadius: 4, padding: "1px 6px" }}>
                          🔥 H100/H200 ×{h100s.length}
                        </span>
                      )}
                      {a100s.length > 0 && (
                        <span style={{ fontSize: 10, background: "#2563EB22", color: "#60A5FA", borderRadius: 4, padding: "1px 6px" }}>
                          ⚡ A100 ×{a100s.length}
                        </span>
                      )}
                      {others.length > 0 && (
                        <span style={{ fontSize: 10, background: "#05966922", color: "#34D399", borderRadius: 4, padding: "1px 6px" }}>
                          💎 Others ×{others.length}
                        </span>
                      )}
                    </div>
                    {selectedRegion === region && (
                      <div style={{ marginTop: 10, borderTop: "1px solid #2d3748", paddingTop: 10 }}>
                        {insts.map(inst => {
                          const k = `${inst.instance}::${region}`;
                          const level = avail[inst.provider]?.[k] ?? "scarce";
                          const p = GPU_DATA[inst.provider];
                          return (
                            <div key={inst.instance} style={{
                              display: "flex", alignItems: "center", gap: 8,
                              background: "#0d1117", borderRadius: 6, padding: "4px 8px", marginBottom: 4,
                            }}>
                              <span style={{ fontSize: 9, color: p.color, fontWeight: 700, minWidth: 30 }}>
                                {inst.provider.toUpperCase()}
                              </span>
                              <span style={{ fontFamily: "monospace", fontSize: 10, color: "#E2E8F0", flex: 1 }}>
                                {inst.instance}
                              </span>
                              <span style={{ fontSize: 10, color: "#718096" }}>
                                {inst.count}×{inst.gpu.split(" ").slice(0,2).join(" ")}
                              </span>
                              <AvailDot level={level} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Tracking Guide View ──────────────────────────────────────────────────
  const TrackingView = () => {
    const methods = [
      {
        title: "AWS: EC2 Spot Instance Advisor + Price History API",
        icon: "🟠",
        color: "#FF9900",
        apis: [
          { name: "describe-instance-type-offerings", desc: "Lists which instance types are available in each region/AZ" },
          { name: "describe-spot-price-history", desc: "Price changes indicate capacity fluctuations — price spikes = scarcity" },
          { name: "get-spot-placement-score", desc: "Returns a 1–10 score for spot availability in a given region" },
          { name: "Capacity Blocks API", desc: "Reserve H100/H200 blocks in advance with guaranteed capacity" },
        ],
        tips: [
          "Spot price history is a proxy for availability — watch for >2x price spikes",
          "Use ec2:DescribeInstanceTypeOfferings with --location-type availability-zone for granular data",
          "Subscribe to AWS Health Events (personal-health-dashboard) for quota/capacity notifications",
          "CloudWatch metrics on SpotInstanceRequestFulfilled / SpotInstanceTerminated indicate capacity pressure",
        ]
      },
      {
        title: "Azure: SKU Availability + Compute Quotas API",
        icon: "🔵",
        color: "#0078D4",
        apis: [
          { name: "Resource SKUs API", desc: "GET /subscriptions/{id}/providers/Microsoft.Compute/skus — lists available VM sizes per region with restriction codes" },
          { name: "Quota API", desc: "GET /subscriptions/{id}/providers/Microsoft.Compute/locations/{loc}/usages — current quota usage and limits" },
          { name: "Spot Eviction Rate API", desc: "Available via Azure Retail Prices API with spot eviction rates per SKU per region" },
          { name: "Azure Monitor Metrics", desc: "Track VM availability and allocation failure events via diagnostic logs" },
        ],
        tips: [
          "The SKUs API returns a 'restrictions' array — if NotAvailableForSubscription appears, capacity is restricted",
          "Use Spot eviction rate % as a real-time proxy for GPU availability pressure",
          "Set up Azure Alerts on AllocationFailed errors in Activity Logs",
          "Azure Pricing Calculator API returns real-time spot pricing as a scarcity indicator",
        ]
      },
      {
        title: "GCP: Compute Engine Machine Types + Spot Pricing API",
        icon: "🟢",
        color: "#34A853",
        apis: [
          { name: "machineTypes.list", desc: "Lists available machine types in each zone with current availability status" },
          { name: "zoneOperations / Cloud Monitoring", desc: "Track vm_allocation_failed metric in Cloud Monitoring for capacity pressure" },
          { name: "Cloud Billing API", desc: "Preemptible/Spot pricing changes in real-time reflect supply/demand" },
          { name: "Compute Engine Reservations API", desc: "Check if specific GPU types allow new reservations — rejection = full capacity" },
        ],
        tips: [
          "GCP zones are more granular than regions — check zone-level availability (e.g. us-central1-a vs us-central1-b)",
          "The compute.googleapis.com/instance/disk/throttled_read_bytes_count spike can indicate GPU instance saturation",
          "Use Committed Use Discount availability as a leading indicator — CUDs often unavailable before on-demand",
          "Subscribe to cloud.google.com/compute/docs/gpus/gpu-regions-zones — page updates track real availability changes",
        ]
      },
      {
        title: "Cross-Cloud: Third-Party Aggregators",
        icon: "🌐",
        color: "#6366F1",
        apis: [
          { name: "Cast AI GPU Report API", desc: "Tracks A100/H100 availability across providers with historical data" },
          { name: "Infracost", desc: "Real-time GPU pricing deltas as availability proxy" },
          { name: "GPU availability trackers (e.g. gpulist.ai)", desc: "Community-sourced availability data updated frequently" },
          { name: "CloudPrice.io / Silicon Analysts", desc: "Aggregated GPU pricing and availability heat maps" },
        ],
        tips: [
          "Build a cron job polling all three providers' SKU APIs every 5–15 minutes",
          "Store availability timeseries in a time-series DB (InfluxDB, TimescaleDB) to spot trends",
          "Alert on: spot price spike >150% of baseline, SKU restriction codes appearing, reservation attempts failing",
          "Multi-cloud arbitrage: when AWS H100 spot price >$8/GPU/hr, auto-migrate to Azure or GCP equivalent",
        ]
      },
    ];

    const buildBlocks = [
      { step: "1", title: "Poll SKU Availability APIs", desc: "Hit AWS describe-instance-type-offerings, Azure Resource SKUs API, and GCP machineTypes.list every 10 minutes. Store results in Postgres.", icon: "🔄" },
      { step: "2", title: "Track Spot Price History", desc: "Spot prices are a real-time scarcity signal. A 2-3× price spike means on-demand capacity is also tightening.", icon: "📈" },
      { step: "3", title: "Monitor Allocation Failures", desc: "Send test allocation requests (0-minute dry runs via API) to detect capacity walls before you need capacity.", icon: "🔬" },
      { step: "4", title: "Time-Series Storage", desc: "Store availability state + price in InfluxDB or TimescaleDB. Index by provider, region, GPU model, timestamp.", icon: "🗄️" },
      { step: "5", title: "Alert Engine", desc: "Trigger alerts when: availability drops below threshold, price spikes >200%, or a new region becomes available for a GPU tier.", icon: "🔔" },
      { step: "6", title: "Dashboard + Auto-Provisioning", desc: "Visualise trends and trigger auto-provisioning scripts (Terraform/Pulumi) to grab capacity before it disappears.", icon: "🚀" },
    ];

    return (
      <div>
        <div style={{ ...styles.card, borderColor: "#6366F144", background: "#1a1f2e" }}>
          <div style={styles.sectionTitle}>🔍 How to Track GPU Availability in Real-Time</div>
          <p style={{ fontSize: 13, color: "#718096", lineHeight: 1.7, margin: "0 0 16px" }}>
            Cloud GPU availability is extremely dynamic — H100s in us-east-1 can go from available to quota-gated in hours.
            Here's a practical guide to building a real-time availability tracker using native cloud APIs.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginBottom: 20 }}>
            {buildBlocks.map(b => (
              <div key={b.step} style={{
                background: "#0d1117", border: "1px solid #2d3748",
                borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    background: "#6366F122", color: "#818CF8",
                    borderRadius: "50%", width: 22, height: 22, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800,
                  }}>{b.step}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{b.title}</span>
                </div>
                <p style={{ fontSize: 11, color: "#718096", lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {methods.map(m => (
          <div key={m.title} style={{ ...styles.card, borderColor: m.color + "44", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.title}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#718096", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 6 }}>KEY APIs / ENDPOINTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {m.apis.map(api => (
                  <div key={api.name} style={{
                    background: "#0d1117", borderRadius: 6, padding: "7px 10px",
                    display: "flex", alignItems: "flex-start", gap: 8,
                  }}>
                    <code style={{ fontSize: 11, color: m.color, fontFamily: "monospace", minWidth: 220, flexShrink: 0 }}>
                      {api.name}
                    </code>
                    <span style={{ fontSize: 11, color: "#718096", lineHeight: 1.5 }}>{api.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: "#718096", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 6 }}>💡 PRO TIPS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {m.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#A0AEC0", lineHeight: 1.5 }}>
                    <span style={{ color: m.color, flexShrink: 0 }}>→</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ ...styles.card, borderColor: "#F59E0B44" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>⚠️ Note on "Real-Time" Data</div>
          <p style={{ fontSize: 12, color: "#718096", lineHeight: 1.7, margin: 0 }}>
            This dashboard simulates availability using a refresh model. True real-time tracking requires authenticated API calls
            to each cloud provider using service account credentials. The APIs listed above are all publicly documented and free to call
            within your account. Availability shown here refreshes every 30 seconds using a simulation model that mirrors real-world
            scarcity patterns (H100/H200 are typically scarcer than T4/A10G). To build a production tracker, deploy the polling architecture
            above with your cloud credentials.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>⚡ Cloud GPU Availability Tracker</div>
          <div style={styles.subtitle}>
            AWS · Azure · GCP — Live availability simulation · Last refresh: {lastRefresh.toLocaleTimeString()}
            {" · "}<span style={{ color: countdown < 8 ? "#F59E0B" : "#718096" }}>Next: {countdown}s</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "#718096" }}>
            <span>●<span style={{ color: "#22C55E" }}> Available</span></span>
            <span>◐<span style={{ color: "#F59E0B" }}> Limited</span></span>
            <span>○<span style={{ color: "#EF4444" }}> Scarce</span></span>
          </div>
          <button onClick={doRefresh} style={styles.refreshBtn} disabled={refreshing}>
            <span style={{ display: "inline-block", animation: refreshing ? "spin 0.6s linear infinite" : "none" }}>↻</span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: "10px 24px", background: "#0d1117", borderBottom: "1px solid #2d3748", display: "flex", gap: 6 }}>
        <div style={styles.navBar}>
          {[["dashboard","📊 Dashboard"],["region","🗺 By Region"],["tracking","🔍 Tracking Guide"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={styles.navBtn(view === v)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {view === "dashboard" && <DashboardView />}
        {view === "region"    && <RegionView />}
        {view === "tracking"  && <TrackingView />}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
