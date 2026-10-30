"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stats = {
  total: number;
  avgSalary: number;
  avgAge: number;
  avgPerformance: number;
  avgSatisfaction: number;
  remoteCount: number;
  remotePct: number;
  byDepartment: Record<string, { count: number; avgSalary: number; avgPerformance: number }>;
  bySeniority: Record<string, number>;
  byCountry: Record<string, number>;
  byEducation: Record<string, number>;
  byGender: Record<string, number>;
  salaryDistribution: { label: string; count: number }[];
  ageDistribution: { label: string; count: number }[];
  performanceDistribution: { label: string; count: number }[];
  hireTrends: Record<string, number>;
  remoteByDept: Record<string, { remote: number; onsite: number }>;
  topPerformers: { name: string; department: string; position: string; salary: number; satisfaction: number }[];
};

type Filters = {
  department: string;
  gender: string;
  country: string;
  seniority: string;
  contractType: string;
  remote: string;
  education: string;
  minSalary: string;
  maxSalary: string;
  minAge: string;
  maxAge: string;
  minPerformance: string;
  minSatisfaction: string;
  minExperience: string;
  startYear: string;
};

const INITIAL_FILTERS: Filters = {
  department: "all", gender: "all", country: "all", seniority: "all",
  contractType: "all", remote: "all", education: "all",
  minSalary: "", maxSalary: "", minAge: "", maxAge: "",
  minPerformance: "", minSatisfaction: "", minExperience: "", startYear: "all",
};

// ─── Constants ───────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "HR", "Finance", "Operations", "Legal", "Data Science",
  "Customer Success", "DevOps", "Security", "Research",
];
const COUNTRIES = [
  "USA", "Mexico", "Colombia", "Argentina", "Brazil", "Spain",
  "UK", "Germany", "France", "Canada", "Japan", "South Korea", "India", "Australia",
];
const SENIORITY = ["junior", "mid", "senior", "lead", "executive"];
const YEARS = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];

const PIE_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
const SENIORITY_COLORS: Record<string, string> = {
  junior: "#3b82f6", mid: "#10b981", senior: "#f97316", lead: "#8b5cf6", executive: "#ef4444",
};
const EDU_LABELS: Record<string, string> = {
  "high-school": "High School", bachelor: "Bachelor", master: "Master", phd: "PhD",
};
const GENDER_LABELS: Record<string, string> = { M: "Male", F: "Female", NB: "Non-Binary" };

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0c1020", border: "1px solid #253351", borderRadius: 8,
      padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4, fontFamily: "Space Mono" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || "#f97316", fontSize: 13, fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000
            ? p.name?.toLowerCase().includes("salary") ? `$${p.value.toLocaleString()}` : p.value.toLocaleString()
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon, delay = 0 }: {
  label: string; value: string | number; sub?: string;
  accent?: boolean; icon: string; delay?: number;
}) {
  return (
    <div className={`card p-5 ${accent ? "stat-card-accent" : ""} animate-fadeInUp`}
      style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "var(--text3)", fontSize: 11, fontFamily: "Space Mono", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "Rajdhani", color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1 }} className="animate-count">
            {value}
          </p>
          {sub && <p style={{ color: "var(--text2)", fontSize: 12, marginTop: 6 }}>{sub}</p>}
        </div>
        <div style={{
          width: 40, height: 40, background: accent ? "var(--accent-glow)" : "var(--bg3)",
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, border: "1px solid var(--border)",
        }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onReset, activeCount }: {
  filters: Filters;
  onChange: (key: keyof Filters, val: string) => void;
  onReset: () => void;
  activeCount: number;
}) {
  return (
    <div className="card p-5" style={{ position: "sticky", top: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: "var(--accent)", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "Rajdhani", fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Filters
          </h2>
          {activeCount > 0 && (
            <span className="badge" style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} style={{
            background: "none", border: "1px solid var(--border2)", color: "var(--text2)",
            borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer",
            fontFamily: "Space Mono", transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "var(--accent)"; (e.target as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "var(--border2)"; (e.target as HTMLElement).style.color = "var(--text2)"; }}
          >
            Reset
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Department */}
        <FilterGroup label="Department">
          <select className="sc-select" value={filters.department} onChange={e => onChange("department", e.target.value)}>
            <option value="all">All departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FilterGroup>

        {/* Country */}
        <FilterGroup label="Country">
          <select className="sc-select" value={filters.country} onChange={e => onChange("country", e.target.value)}>
            <option value="all">All countries</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FilterGroup>

        {/* Seniority */}
        <FilterGroup label="Seniority">
          <select className="sc-select" value={filters.seniority} onChange={e => onChange("seniority", e.target.value)}>
            <option value="all">All levels</option>
            {SENIORITY.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </FilterGroup>

        {/* Gender */}
        <FilterGroup label="Gender">
          <select className="sc-select" value={filters.gender} onChange={e => onChange("gender", e.target.value)}>
            <option value="all">All</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="NB">Non-Binary</option>
          </select>
        </FilterGroup>

        {/* Contract Type */}
        <FilterGroup label="Contract Type">
          <select className="sc-select" value={filters.contractType} onChange={e => onChange("contractType", e.target.value)}>
            <option value="all">All types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contractor">Contractor</option>
          </select>
        </FilterGroup>

        {/* Remote */}
        <FilterGroup label="Work Mode">
          <select className="sc-select" value={filters.remote} onChange={e => onChange("remote", e.target.value)}>
            <option value="all">All</option>
            <option value="true">Remote</option>
            <option value="false">On-site</option>
          </select>
        </FilterGroup>

        {/* Education */}
        <FilterGroup label="Education">
          <select className="sc-select" value={filters.education} onChange={e => onChange("education", e.target.value)}>
            <option value="all">All</option>
            <option value="high-school">High School</option>
            <option value="bachelor">Bachelor</option>
            <option value="master">Master</option>
            <option value="phd">PhD</option>
          </select>
        </FilterGroup>

        {/* Start Year */}
        <FilterGroup label="Hire Year">
          <select className="sc-select" value={filters.startYear} onChange={e => onChange("startYear", e.target.value)}>
            <option value="all">All years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </FilterGroup>

        {/* Salary Range */}
        <FilterGroup label="Salary Range ($)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input className="sc-input" type="number" placeholder="Min" value={filters.minSalary}
              onChange={e => onChange("minSalary", e.target.value)} />
            <input className="sc-input" type="number" placeholder="Max" value={filters.maxSalary}
              onChange={e => onChange("maxSalary", e.target.value)} />
          </div>
        </FilterGroup>

        {/* Age Range */}
        <FilterGroup label="Age Range">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input className="sc-input" type="number" placeholder="Min" min={22} max={62} value={filters.minAge}
              onChange={e => onChange("minAge", e.target.value)} />
            <input className="sc-input" type="number" placeholder="Max" min={22} max={62} value={filters.maxAge}
              onChange={e => onChange("maxAge", e.target.value)} />
          </div>
        </FilterGroup>

        {/* Min Performance */}
        <FilterGroup label={`Min Performance ${filters.minPerformance ? `(≥${filters.minPerformance}⭐)` : ""}`}>
          <input className="sc-input" type="range" min={1} max={5} step={1}
            value={filters.minPerformance || 1}
            onChange={e => onChange("minPerformance", e.target.value === "1" ? "" : e.target.value)}
            style={{ accentColor: "var(--accent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", fontFamily: "Space Mono", marginTop: 2 }}>
            {[1, 2, 3, 4, 5].map(n => <span key={n}>{n}★</span>)}
          </div>
        </FilterGroup>

        {/* Min Satisfaction */}
        <FilterGroup label={`Min Satisfaction ${filters.minSatisfaction ? `(≥${filters.minSatisfaction}/10)` : ""}`}>
          <input className="sc-input" type="range" min={1} max={10} step={1}
            value={filters.minSatisfaction || 1}
            onChange={e => onChange("minSatisfaction", e.target.value === "1" ? "" : e.target.value)}
            style={{ accentColor: "var(--blue)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", fontFamily: "Space Mono", marginTop: 2 }}>
            {[1, 3, 5, 7, 10].map(n => <span key={n}>{n}</span>)}
          </div>
        </FilterGroup>

        {/* Min Experience */}
        <FilterGroup label={`Min Experience ${filters.minExperience ? `(≥${filters.minExperience} yrs)` : ""}`}>
          <input className="sc-input" type="range" min={0} max={35} step={1}
            value={filters.minExperience || 0}
            onChange={e => onChange("minExperience", e.target.value === "0" ? "" : e.target.value)}
            style={{ accentColor: "var(--purple)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", fontFamily: "Space Mono", marginTop: 2 }}>
            <span>0</span><span>10</span><span>20</span><span>35</span>
          </div>
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, color: "var(--text3)", fontFamily: "Space Mono", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 18, background: "var(--accent)", borderRadius: 2 }} />
      <h3 style={{ fontFamily: "Rajdhani", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text2)" }}>
        {children}
      </h3>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="card p-5" style={{ height: 100 }}>
          <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 28, width: "40%" }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (f: Filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v && v !== "all") params.set(k, v); });
    try {
      const res = await fetch(`/api/employees?${params}`);
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStats(filters), 300);
  }, [filters, fetchStats]);

  const handleFilter = useCallback((key: keyof Filters, val: string) => {
    setFilters(f => ({ ...f, [key]: val }));
  }, []);

  const handleReset = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    v && v !== "all" && v !== ""
  ).length;

  // ── Prepared chart data ──────────────────────────────────────────────────
  const deptChartData = stats
    ? Object.entries(stats.byDepartment)
        .map(([dept, d]) => ({ dept: dept.length > 8 ? dept.slice(0, 8) + "…" : dept, fullDept: dept, count: d.count, avgSalary: d.avgSalary, avgPerf: d.avgPerformance }))
        .sort((a, b) => b.count - a.count)
    : [];

  const seniorityData = stats
    ? SENIORITY.map(s => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: stats.bySeniority[s] || 0, fill: SENIORITY_COLORS[s] })).filter(d => d.value > 0)
    : [];

  const countryData = stats
    ? Object.entries(stats.byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, v]) => ({ country: c, count: v }))
    : [];

  const hireData = stats
    ? Object.entries(stats.hireTrends).sort((a, b) => a[0].localeCompare(b[0])).map(([y, c]) => ({ year: y, hired: c }))
    : [];

  const eduData = stats
    ? Object.entries(stats.byEducation).map(([k, v]) => ({ name: EDU_LABELS[k] || k, value: v }))
    : [];

  const genderData = stats
    ? Object.entries(stats.byGender).map(([k, v]) => ({ name: GENDER_LABELS[k] || k, value: v }))
    : [];

  const remoteTopDepts = stats
    ? Object.entries(stats.remoteByDept)
        .map(([d, v]) => ({ dept: d.length > 10 ? d.slice(0, 10) + "…" : d, remote: v.remote, onsite: v.onsite }))
        .sort((a, b) => (b.remote + b.onsite) - (a.remote + a.onsite))
        .slice(0, 8)
    : [];

  const radarData = stats && deptChartData.slice(0, 6).map(d => ({
    dept: d.dept,
    Performance: Math.round(d.avgPerf * 20),
    Salary: Math.round((d.avgSalary / 200000) * 100),
    Headcount: Math.round((d.count / stats.total) * 100 * 5),
  }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 60% 40% at 70% 20%, rgba(249,115,22,0.04) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(59,130,246,0.04) 0%, transparent 60%)",
      }} />

      {/* Top Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(6,8,16,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#000",
              fontFamily: "Rajdhani", letterSpacing: "-1px",
            }}>SC</div>
          </div>
          <div>
            <div style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: 18, letterSpacing: "0.06em", lineHeight: 1 }}>
              SAIYAN<span style={{ color: "var(--accent)" }}>CORP</span>
            </div>
            <div style={{ fontSize: 9, fontFamily: "Space Mono", color: "var(--text3)", letterSpacing: "0.12em" }}>
              EMPLOYEE ANALYTICS
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {stats && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
              <span style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)" }}>
                {stats.total.toLocaleString()} employees shown
              </span>
            </div>
          )}
          <div className="badge" style={{ background: "rgba(249,115,22,0.1)", color: "var(--accent)", border: "1px solid rgba(249,115,22,0.3)" }}>
            🔥 Live
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, position: "relative", zIndex: 1 }}>

        {/* Sidebar */}
        <aside style={{
          background: "var(--bg2)", borderRight: "1px solid var(--border)",
          minHeight: "calc(100vh - 60px)", padding: 20,
          position: "sticky", top: 60, height: "calc(100vh - 60px)", overflowY: "auto",
        }}>
          <FilterPanel
            filters={filters}
            onChange={handleFilter}
            onReset={handleReset}
            activeCount={activeFilterCount}
          />
        </aside>

        {/* Content */}
        <main style={{ padding: "24px 28px", overflowX: "hidden" }}>

          {/* Page Title */}
          <div style={{ marginBottom: 28 }} className="animate-fadeInUp">
            <h1 style={{ fontFamily: "Rajdhani", fontSize: 32, fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.1 }}>
              Workforce <span style={{ color: "var(--accent)" }}>Intelligence</span>
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>
              Real-time analytics for SaiyanCorp · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <div className="neon-line" style={{ marginTop: 16 }} />
          </div>

          {loading && !stats ? (
            <LoadingSkeleton />
          ) : stats ? (
            <>
              {/* ── KPI Cards ──────────────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                <StatCard label="Total Employees" value={stats.total.toLocaleString()} sub="matching filters" icon="👥" accent delay={0} />
                <StatCard label="Avg. Salary" value={`$${(stats.avgSalary / 1000).toFixed(0)}k`} sub={`$${stats.avgSalary.toLocaleString()}`} icon="💰" delay={60} />
                <StatCard label="Avg. Performance" value={`${stats.avgPerformance}★`} sub="out of 5.0" icon="⚡" delay={120} />
                <StatCard label="Avg. Satisfaction" value={`${stats.avgSatisfaction}/10`} sub="employee NPS proxy" icon="💎" delay={180} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
                <StatCard label="Remote Workers" value={`${stats.remotePct}%`} sub={`${stats.remoteCount} employees`} icon="🌍" delay={240} />
                <StatCard label="Avg. Age" value={stats.avgAge} sub="years old" icon="🧬" delay={300} />
                <StatCard label="Top Performers" value={stats.performanceDistribution.find(p => p.label.includes("5"))?.count || 0} sub="5-star rating" icon="🏆" delay={360} />
                <StatCard label="Active Filters" value={activeFilterCount || "None"} sub={activeFilterCount ? "filters applied" : "showing all data"} icon="🎛️" delay={420} />
              </div>

              {/* ── Dept Bar + Seniority Donut ─────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
                  <SectionTitle>Headcount by Department</SectionTitle>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={deptChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="dept" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "Space Mono" }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Employees" radius={[4, 4, 0, 0]}>
                        {deptChartData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "#f97316" : i < 3 ? "#fb923c" : "#1e2d47"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "150ms" }}>
                  <SectionTitle>Seniority Distribution</SectionTitle>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={seniorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        dataKey="value" paddingAngle={3}>
                        {seniorityData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Hire Trend + Country Bar ───────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
                  <SectionTitle>Hiring Trend by Year</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={hireData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="hireGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="year" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "Space Mono" }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="hired" name="Hired" stroke="#f97316" strokeWidth={2} fill="url(#hireGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "250ms" }}>
                  <SectionTitle>Top Countries</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <YAxis type="category" dataKey="country" tick={{ fill: "var(--text2)", fontSize: 10, fontFamily: "Space Mono" }} width={60} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Employees" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Salary Distribution + Performance ─────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "300ms" }}>
                  <SectionTitle>Salary Distribution</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.salaryDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" tick={{ fill: "var(--text3)", fontSize: 9, fontFamily: "Space Mono" }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Employees" radius={[4, 4, 0, 0]}>
                        {stats.salaryDistribution.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "350ms" }}>
                  <SectionTitle>Performance Distribution</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.performanceDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" tick={{ fill: "var(--text3)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Employees" radius={[4, 4, 0, 0]}>
                        {stats.performanceDistribution.map((_, i) => (
                          <Cell key={i} fill={["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6"][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Avg Salary by Dept + Education/Gender ─────── */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "400ms" }}>
                  <SectionTitle>Avg. Salary by Department</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={deptChartData.slice(0, 8)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="dept" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "Space Mono" }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgSalary" name="Avg Salary" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "440ms" }}>
                  <SectionTitle>Education</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={eduData} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                        {eduData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span style={{ fontSize: 10, fontFamily: "Space Mono", color: "var(--text2)" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "480ms" }}>
                  <SectionTitle>Gender</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" paddingAngle={4}>
                        {genderData.map((_, i) => <Cell key={i} fill={["#f97316", "#3b82f6", "#8b5cf6"][i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Remote Stacked + Radar ─────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>
                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "500ms" }}>
                  <SectionTitle>Remote vs On-Site by Department</SectionTitle>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={remoteTopDepts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="dept" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "Space Mono" }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)" }}>{v}</span>} />
                      <Bar dataKey="remote" name="Remote" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="onsite" name="On-site" stackId="a" fill="#1e3a2f" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "540ms" }}>
                  <SectionTitle>Dept Radar (Top 6)</SectionTitle>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData || []}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="dept" tick={{ fill: "var(--text3)", fontSize: 9, fontFamily: "Space Mono" }} />
                      <PolarRadiusAxis tick={false} axisLine={false} />
                      <Radar name="Performance" dataKey="Performance" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                      <Radar name="Salary" dataKey="Salary" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)" }}>{v}</span>} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Age Distribution ───────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "560ms" }}>
                  <SectionTitle>Age Distribution</SectionTitle>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.ageDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" tick={{ fill: "var(--text3)", fontSize: 12, fontFamily: "Space Mono" }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Employees" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card p-5 animate-fadeInUp" style={{ animationDelay: "590ms" }}>
                  <SectionTitle>Avg Performance by Department</SectionTitle>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={deptChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="dept" tick={{ fill: "var(--text3)", fontSize: 10, fontFamily: "Space Mono" }} />
                      <YAxis domain={[0, 5]} tick={{ fill: "var(--text3)", fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgPerf" name="Avg Performance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── Top Performers Table ───────────────────────── */}
              <div className="card animate-fadeInUp" style={{ marginBottom: 32, animationDelay: "620ms" }}>
                <div style={{ padding: "20px 20px 12px" }}>
                  <SectionTitle>Top Performers (⭐⭐⭐⭐⭐)</SectionTitle>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                        {["#", "Name", "Department", "Position", "Salary", "Satisfaction"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontFamily: "Space Mono", color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topPerformers.map((emp, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}>
                          <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "Space Mono", color: "var(--text3)" }}>
                            {i + 1 === 1 ? "🥇" : i + 1 === 2 ? "🥈" : i + 1 === 3 ? "🥉" : i + 1}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{emp.name}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span className="badge" style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid rgba(249,115,22,0.3)" }}>
                              {emp.department}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text2)" }}>{emp.position}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "Space Mono", color: "var(--green)" }}>
                            ${emp.salary.toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ height: 4, width: 60, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${emp.satisfaction * 10}%`, background: emp.satisfaction >= 8 ? "var(--green)" : emp.satisfaction >= 5 ? "var(--yellow)" : "var(--red)", borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text2)" }}>{emp.satisfaction}/10</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, paddingBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text3)" }}>
                  SaiyanCorp HR Analytics Platform · 1,000 fictional employees
                </p>
                <p style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--text3)" }}>
                  Inspired by Dragon Ball & Marvel universes
                </p>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
