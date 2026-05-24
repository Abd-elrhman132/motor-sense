import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Cpu,
  Gauge,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Zap,
  Menu,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Grid,
  Info,
  Shield,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  startSimulator,
  stopSimulator,
  resetMotorState,
  THRESHOLDS,
  type Motor,
} from "@/lib/sensorSimulator";

type Reading = {
  id: string;
  motor_id: string;
  temperature: number;
  current: number;
  vibration: number;
  status: string;
  created_at: string;
};
type Alert = {
  id: string;
  motor_id: string;
  severity: string;
  message_en: string;
  message_ar: string;
  created_at: string;
};
type ChartDataPoint = {
  i: number;
  t: string;
  temp: number;
  cur: number;
  vib: number;
};

type Section = "dashboard" | "motors" | "alerts" | "analytics" | "settings";

export function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const { t, lang, dir } = useI18n();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]); // last 60 for selected
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<{ id: string; msg: string; ts: number }[]>([]);
  const [popup, setPopup] = useState<Alert | null>(null);

  const motorsRef = useRef<Motor[]>([]);
  motorsRef.current = motors;
  const lastAlertAt = useRef<Map<string, number>>(new Map());
  const lastPredAt = useRef<Map<string, number>>(new Map());

  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const evaluateAlerts = async (r: Reading) => {
    const motor = motorsRef.current.find((m) => m.id === r.motor_id);
    if (!motor) return;
    const last = lastAlertAt.current.get(r.motor_id) ?? 0;
    if (Date.now() - last < 8000) return;

    let msgKey: "tempHigh" | "currentHigh" | "vibHigh" | null = null;
    let severity = "warning";
    if (r.temperature >= THRESHOLDS.tempMax) {
      msgKey = "tempHigh";
      severity = "danger";
    } else if (r.current >= THRESHOLDS.currentMax) {
      msgKey = "currentHigh";
      severity = "danger";
    } else if (r.vibration >= THRESHOLDS.vibMax) {
      msgKey = "vibHigh";
      severity = "warning";
    }

    if (!msgKey) return;
    const en = templates.en.alertMsg[msgKey].replace("{name}", motor.name);
    const ar = templates.ar.alertMsg[msgKey].replace("{name}", motor.name);
    lastAlertAt.current.set(r.motor_id, Date.now());
    await supabase.from("alerts").insert({
      motor_id: motor.id,
      user_id: motor.user_id,
      severity,
      message_en: en,
      message_ar: ar,
    });
  };

  const evaluatePredictions = (r: Reading) => {
    const motor = motorsRef.current.find((m) => m.id === r.motor_id);
    if (!motor) return;
    const last = lastPredAt.current.get(r.motor_id) ?? 0;
    if (Date.now() - last < 10000) return;
    let key: "bearing" | "overheat" | "vibration" | "fail48" | null = null;
    if (r.vibration > THRESHOLDS.vibMax * 0.75 && r.temperature > THRESHOLDS.tempMax * 0.8)
      key = "fail48";
    else if (r.vibration > THRESHOLDS.vibMax * 0.7) key = "bearing";
    else if (r.temperature > THRESHOLDS.tempMax * 0.8) key = "overheat";
    if (!key) return;
    const msg = templates[lang].pred[key].replace("{name}", motor.name);
    lastPredAt.current.set(r.motor_id, Date.now());
    setPredictions((p) => [{ id: crypto.randomUUID(), msg, ts: Date.now() }, ...p].slice(0, 10));
  };

  const evaluateAlertsRef = useRef(evaluateAlerts);
  evaluateAlertsRef.current = evaluateAlerts;

  const evaluatePredictionsRef = useRef(evaluatePredictions);
  evaluatePredictionsRef.current = evaluatePredictions;

  const springConfig = { type: "spring", stiffness: 100, damping: 20 } as const;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  // Load motors + readings + alerts
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: m } = await supabase.from("motors").select("*").order("created_at");
      if (m) {
        setMotors(m as Motor[]);
        if (m.length && !selectedIdRef.current) setSelectedId(m[0].id);
      }
      const { data: a } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (a) setAlerts(a as Alert[]);
    })();
  }, [user]);

  // Start simulator
  useEffect(() => {
    if (!user || motors.length === 0) return;
    startSimulator(
      () => motorsRef.current,
      (id, health, status) => {
        setMotors((prev) =>
          prev.map((m) => (m.id === id ? { ...m, health_score: health, status } : m)),
        );
      },
    );
    return () => stopSimulator();
  }, [user, motors.length]);

  // Realtime: motors updates + new readings + new alerts
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("pg-rt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "motors" }, (p) => {
        setMotors((prev) =>
          prev.map((m) => (m.id === (p.new as Motor).id ? { ...m, ...(p.new as Motor) } : m)),
        );
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "motors" }, (p) => {
        setMotors((prev) => [...prev, p.new as Motor]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "motors" }, (p) => {
        setMotors((prev) => prev.filter((m) => m.id !== (p.old as { id: string }).id));
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        (p) => {
          const r = p.new as Reading;
          setReadings((prev) => {
            if (r.motor_id !== selectedIdRef.current) return prev;
            const next = [...prev, r];
            return next.slice(-60);
          });
          evaluateAlertsRef.current(r);
          evaluatePredictionsRef.current(r);
        },
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (p) => {
        const a = p.new as Alert;
        setAlerts((prev) => [a, ...prev].slice(0, 50));
        setPopup(a);
        setTimeout(() => setPopup((cur) => (cur?.id === a.id ? null : cur)), 4000);
      });
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  // Fetch readings when motor selection changes
  useEffect(() => {
    if (!selectedId) {
      setReadings([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("sensor_readings")
        .select("*")
        .eq("motor_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(60);
      if (data) setReadings([...(data as Reading[])].reverse());
    })();
  }, [selectedId]);

  const selectedMotor = motors.find((m) => m.id === selectedId) ?? null;
  const overallStatus = motors.some((m) => m.status === "danger")
    ? "danger"
    : motors.some((m) => m.status === "warning")
      ? "warning"
      : "safe";
  const latest = readings[readings.length - 1];

  const chartData = useMemo(
    () =>
      readings.map((r, i) => ({
        i,
        t: new Date(r.created_at).toLocaleTimeString(),
        temp: r.temperature,
        cur: r.current,
        vib: r.vibration,
      })),
    [readings],
  );

  const navItems = [
    { id: "dashboard" as const, label: t.dash.sidebar.dashboard, icon: LayoutDashboard },
    { id: "motors" as const, label: t.dash.sidebar.motors, icon: Grid },
    { id: "alerts" as const, label: t.dash.sidebar.alerts, icon: Bell },
    { id: "analytics" as const, label: t.dash.sidebar.analytics, icon: BarChart3 },
    { id: "settings" as const, label: t.dash.sidebar.settings, icon: SettingsIcon },
  ];

  return (
    <div className="bg-background selection:bg-primary/30 relative flex min-h-screen overflow-hidden">
      {/* Hidden global SVG filter to inject glowing neon lines into Recharts */}
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="neon-glow-mint" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Sidebar - Collapsible with fluid motion */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? "5.5rem" : "18rem" }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className="glass relative z-20 hidden shrink-0 flex-col gap-2 border-e border-white/5 p-4 md:flex"
      >
        <div className="mb-8 flex items-center justify-between px-2.5">
          <Link to="/" className="group flex items-center gap-3 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              transition={springConfig}
              className="from-primary via-accent to-chart-5 glow-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br"
            >
              <Activity className="text-background h-5 w-5" />
            </motion.div>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="shrink-0 bg-gradient-to-r from-white to-white/80 bg-clip-text text-lg font-extrabold tracking-tight text-transparent"
              >
                {t.brand}
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hover:border-primary/20 text-muted-foreground hover:text-foreground ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="space-y-1.5">
          {navItems.map((it) => (
            <motion.button
              key={it.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSection(it.id)}
              className={`flex w-full items-center ${sidebarCollapsed ? "justify-center px-0" : "px-4"} group relative cursor-pointer rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all duration-300 ${
                section === it.id
                  ? "bg-primary text-primary-foreground glow-primary shadow-primary/10 shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <it.icon className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3 rtl:ml-3"}`} />
              {!sidebarCollapsed && <span>{it.label}</span>}
              {sidebarCollapsed && (
                <div className="bg-background pointer-events-none absolute left-full z-50 ml-3 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold whitespace-nowrap opacity-0 shadow-2xl transition-opacity duration-300 group-hover:opacity-100">
                  {it.label}
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex w-full justify-center">
            <LanguageSwitcher />
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="lg"
              onClick={signOut}
              className={`h-12 w-full rounded-xl border-white/10 bg-white/3 font-bold hover:bg-white/8 hover:text-white ${sidebarCollapsed ? "justify-center px-0" : "gap-3 px-5"}`}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span>{t.dash.signOut}</span>}
            </Button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Branded Mobile Top Header */}
      <header className="bg-background/60 border-b border-white/5 fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-4 backdrop-blur-md md:hidden">
        <Link to="/" className="group flex items-center gap-2.5 font-bold">
          <div className="from-primary to-accent glow-primary grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br">
            <Activity className="text-background h-4 w-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight">Motor Sense</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={signOut}
            aria-label={t.dash.signOut}
            className="hover:border-primary/20 text-muted-foreground hover:text-foreground grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Floating Frosted-Glass Mobile Bottom Navigation Bar */}
      <nav className="glass fixed right-4 bottom-4 left-4 z-40 flex h-16 items-center justify-around rounded-[1.5rem] border border-white/10 px-2 shadow-2xl backdrop-blur-xl md:hidden">
        {navItems.map((it) => {
          const Icon = it.icon;
          const isActive = section === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setSection(it.id)}
              aria-label={it.label}
              className={`relative flex flex-col items-center justify-center gap-1 cursor-pointer rounded-2xl p-2 transition-all duration-300 ${
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground/75 hover:text-foreground"
              }`}
            >
              <Icon className="h-5.5 w-5.5" />
              <span className={`text-[8px] font-black tracking-widest uppercase transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-60"}`}>
                {it.label.slice(0, 5)}
              </span>
              {isActive && (
                <motion.span
                  layoutId="mobileActiveDot"
                  className="bg-primary glow-primary absolute -bottom-1 h-1 w-1 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Container */}
      <main className="relative min-w-0 flex-1 overflow-auto p-6 pt-20 sm:p-10 md:pt-10">
        {/* Soft atmospheric gradient */}
        <div className="bg-primary/3 pointer-events-none absolute top-0 right-0 -z-10 h-[550px] w-[550px] rounded-full blur-[140px]" />

        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-wrap items-center gap-6"
        >
          <div>
            <h1 className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              {t.dash.title}
            </h1>
            <p className="text-muted-foreground/60 mt-1 text-xs font-bold tracking-[0.2em] uppercase">
              {t.tagline}
            </p>
          </div>
          <div className="ms-auto flex flex-wrap items-center gap-4">
            <StatusBadge status={overallStatus} />
            <div className="group relative">
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-background/60 focus:border-primary cursor-pointer appearance-none rounded-xl border border-white/10 px-5 py-3 pr-10 text-sm font-bold transition-colors focus:outline-none"
              >
                {motors.map((m) => (
                  <option key={m.id} value={m.id} className="bg-background font-semibold">
                    {m.name}
                  </option>
                ))}
              </select>
              <Cpu className="text-muted-foreground group-hover:text-primary pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 transition-colors" />
            </div>
          </div>
        </motion.div>

        {/* Content Router */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section + selectedId}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.015 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {section === "dashboard" && selectedMotor && (
              <DashboardSection
                motor={selectedMotor}
                latest={latest}
                chartData={chartData}
                predictions={predictions}
                alerts={alerts.filter((a) => a.motor_id === selectedMotor.id).slice(0, 8)}
              />
            )}
            {section === "motors" && (
              <MotorsSection
                motors={motors}
                onSelect={(id) => {
                  setSelectedId(id);
                  setSection("dashboard");
                }}
              />
            )}
            {section === "alerts" && <AlertsSection alerts={alerts} motors={motors} />}
            {section === "analytics" && selectedMotor && (
              <AnalyticsSection motor={selectedMotor} chartData={chartData} />
            )}
            {section === "settings" && selectedMotor && (
              <SettingsSection
                motor={selectedMotor}
                onModeChange={async (mode) => {
                  await supabase.from("motors").update({ mode }).eq("id", selectedMotor.id);
                  setMotors((prev) =>
                    prev.map((m) => (m.id === selectedMotor.id ? { ...m, mode } : m)),
                  );
                  resetMotorState(selectedMotor.id);
                  toast.success(`Simulation Operational Mode: ${mode.toUpperCase()}`, {
                    className: "glass border-primary/20 rounded-2xl",
                  });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Realtime danger alert toast popup card */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, x: 30, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className={`glass hud-card fixed top-6 right-6 z-50 max-w-sm rounded-2xl border-l-4 p-5 shadow-2xl ${
              popup.severity === "danger"
                ? "border-destructive bg-destructive/10"
                : "border-warning bg-warning/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                  popup.severity === "danger"
                    ? "bg-destructive/20 text-destructive border-destructive/20"
                    : "bg-warning/20 text-warning border-warning/20"
                }`}
              >
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="text-[10px] font-black tracking-widest uppercase opacity-70">
                    {popup.severity === "danger" ? t.dash.danger : t.dash.warning}
                  </div>
                  <button
                    onClick={() => setPopup(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-sm leading-snug font-extrabold">
                  {lang === "ar" ? popup.message_ar : popup.message_en}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const safe = status === "safe";
  const danger = status === "danger";
  const label = danger ? t.dash.danger : safe ? t.dash.safe : t.dash.warning;
  const cls = danger
    ? "bg-destructive/15 text-destructive border-destructive/30 glow-error"
    : safe
      ? "bg-success/15 text-success border-success/30 glow-success"
      : "bg-warning/15 text-warning border-warning/30";
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-xs font-black tracking-widest uppercase ${cls}`}
    >
      <motion.span
        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.25, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`h-2.5 w-2.5 rounded-full ${danger ? "bg-destructive" : safe ? "bg-success" : "bg-warning"}`}
      />
      {label}
    </div>
  );
}

function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  danger,
  max,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: string;
  danger?: boolean;
  max: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color = danger ? "text-destructive" : pct > 85 ? "text-warning" : "text-primary";

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className={`glass hover:border-primary/25 group hud-card relative overflow-hidden rounded-[2rem] border-white/5 p-7 ${danger ? "glow-error border-destructive/40" : ""}`}
    >
      <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06]">
        <Icon className="h-24 w-24" />
      </div>

      <div className="relative z-10 flex items-center gap-3">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl border ${danger ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/15"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
          {label}
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-baseline gap-2">
        <motion.div
          key={Math.round(value * 10)}
          initial={{ opacity: 0.5, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-5xl font-extrabold tracking-tighter ${color} ${!danger && "text-glow-primary"}`}
        >
          {value?.toFixed(1) ?? "—"}
        </motion.div>
        <div className="text-muted-foreground/60 text-sm font-bold">{unit}</div>
      </div>

      <div className="relative z-10 mt-6 h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className={`h-full ${danger ? "bg-destructive glow-error" : pct > 85 ? "bg-warning" : "bg-primary glow-primary"}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

function DashboardSection({
  motor,
  latest,
  chartData,
  predictions,
  alerts,
}: {
  motor: Motor;
  latest?: Reading;
  chartData: ChartDataPoint[];
  predictions: { id: string; msg: string; ts: number }[];
  alerts: Alert[];
}) {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-8">
      {/* Health & Sensors */}
      <div className="grid gap-6 sm:grid-cols-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="glass hover:border-primary/20 hud-card flex flex-col justify-center rounded-[2.5rem] border-white/5 p-8 transition-all sm:col-span-1"
        >
          <div className="text-muted-foreground mb-6 text-center text-[10px] font-black tracking-widest uppercase">
            {t.dash.health}
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={
                    motor.health_score > 70
                      ? "var(--success)"
                      : motor.health_score > 40
                        ? "var(--warning)"
                        : "var(--destructive)"
                  }
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray={`${(motor.health_score / 100) * 100} 100`}
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${(motor.health_score / 100) * 100} 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-glow-primary text-3xl font-extrabold tracking-tighter">
                    {Math.round(motor.health_score)}%
                  </div>
                  <div className="text-muted-foreground/60 text-[9px] font-black tracking-widest uppercase">
                    Score
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{motor.name}</div>
              <div
                className={`mt-1.5 text-[10px] font-black tracking-[0.2em] uppercase ${motor.mode === "healthy" ? "text-success" : "text-destructive animate-pulse"}`}
              >
                {motor.mode === "failure" ? t.dash.failure : t.dash.healthy} MODE
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:col-span-3 sm:grid-cols-3">
          <SensorCard
            icon={Gauge}
            label={t.dash.temp}
            value={latest?.temperature ?? 0}
            unit="°C"
            max={100}
            danger={(latest?.temperature ?? 0) >= THRESHOLDS.tempMax}
          />
          <SensorCard
            icon={Zap}
            label={t.dash.current}
            value={latest?.current ?? 0}
            unit="A"
            max={40}
            danger={(latest?.current ?? 0) >= THRESHOLDS.currentMax}
          />
          <SensorCard
            icon={Activity}
            label={t.dash.vibration}
            value={latest?.vibration ?? 0}
            unit="mm/s"
            max={10}
            danger={(latest?.vibration ?? 0) >= THRESHOLDS.vibMax}
          />
        </div>
      </div>

      {/* Live Charts */}
      <div className="glass hud-card relative overflow-hidden rounded-[2.5rem] border-white/5 p-8">
        <div className="via-primary/35 absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent to-transparent" />
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">{t.dash.liveCharts}</div>
            <div className="text-muted-foreground/60 mt-1 text-[10px] font-black tracking-widest uppercase">
              Real-time telemetry stream
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-success glow-success h-2 w-2 animate-pulse rounded-full" />
              <div className="text-muted-foreground/75 text-[10px] font-black tracking-widest uppercase">
                LIVE DATA FEED
              </div>
            </div>
            <div className="text-primary/80 bg-primary/10 border-primary/10 rounded-xl border px-3.5 py-1.5 text-xs font-bold">
              {latest ? new Date(latest.created_at).toLocaleTimeString() : "—"}
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-muted-foreground/40 grid h-80 place-items-center rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01] text-sm font-semibold italic">
            {t.dash.empty}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <MiniChart
              data={chartData}
              dataKey="temp"
              filterId="neon-glow-yellow"
              color="var(--warning)"
              label={t.dash.temp}
              unit="°C"
            />
            <MiniChart
              data={chartData}
              dataKey="cur"
              filterId="neon-glow-cyan"
              color="var(--accent)"
              label={t.dash.current}
              unit="A"
            />
            <MiniChart
              data={chartData}
              dataKey="vib"
              filterId="neon-glow-mint"
              color="var(--primary)"
              label={t.dash.vibration}
              unit="mm/s"
            />
          </div>
        )}
      </div>

      {/* Feeds */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="glass hud-card flex h-[480px] flex-col rounded-[2.5rem] border-white/5 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-warning/10 border-warning/15 grid h-10 w-10 place-items-center rounded-xl border">
              <Bell className="text-warning h-5 w-5" />
            </div>
            <div className="text-xl font-bold">{t.dash.alertFeed}</div>
          </div>
          {alerts.length === 0 ? (
            <div className="text-muted-foreground/30 grid flex-1 place-items-center py-12 text-sm font-semibold italic">
              {t.dash.noAlerts}
            </div>
          ) : (
            <ul className="custom-scrollbar flex-1 space-y-3 overflow-auto pr-2">
              <AnimatePresence initial={false}>
                {alerts.map((a) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-2xl border p-4 transition-all duration-300 ${
                      a.severity === "danger"
                        ? "border-destructive/15 bg-destructive/5 hover:bg-destructive/8"
                        : "border-warning/15 bg-warning/5 hover:bg-warning/8"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.severity === "danger" ? "bg-destructive glow-error" : "bg-warning"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm leading-snug font-bold">
                          {lang === "ar" ? a.message_ar : a.message_en}
                        </div>
                        <div className="text-muted-foreground/50 mt-2 text-[10px] font-black tracking-widest uppercase">
                          {new Date(a.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="glass hud-card flex h-[480px] flex-col rounded-[2.5rem] border-white/5 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/10 border-primary/15 grid h-10 w-10 place-items-center rounded-xl border">
              <Brain className="text-primary h-5 w-5" />
            </div>
            <div className="text-xl font-bold">{t.dash.predictions}</div>
            <div className="ms-auto">
              <span className="bg-primary/10 text-primary border-primary/15 rounded-full border px-3 py-1 text-[9px] font-black tracking-[0.2em] uppercase">
                AI COGNITIVE SHIELD
              </span>
            </div>
          </div>
          {predictions.length === 0 ? (
            <div className="text-muted-foreground/30 grid flex-1 place-items-center py-12 text-sm font-semibold italic">
              {t.dash.noPredictions}
            </div>
          ) : (
            <ul className="custom-scrollbar flex-1 space-y-3 overflow-auto pr-2">
              <AnimatePresence initial={false}>
                {predictions.map((p) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border-primary/15 bg-primary/5 hover:bg-primary/8 rounded-2xl border p-4 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <Brain className="text-primary mt-0.5 h-4 w-4" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm leading-snug font-bold">{p.msg}</div>
                        <div className="text-muted-foreground/50 mt-2 text-[10px] font-black tracking-widest uppercase">
                          {new Date(p.ts).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniChart({
  data,
  dataKey,
  filterId,
  color,
  label,
  unit,
}: {
  data: ChartDataPoint[];
  dataKey: string;
  filterId: string;
  color: string;
  label: string;
  unit: string;
}) {
  return (
    <div className="bg-background/50 hover:border-primary/20 group hud-card rounded-[2rem] border border-white/5 p-6 transition-all duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
          {label}
        </div>
        <div className="text-muted-foreground/80 group-hover:text-foreground text-xs font-bold transition-colors">
          {unit}
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="i" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                fontSize: 11,
                fontWeight: "bold",
                fontFamily: "monospace",
                color: "var(--foreground)",
              }}
              labelFormatter={() => ""}
              cursor={{ stroke: "var(--border)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              filter={`url(#${filterId})`}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Coordinate generator mapping motors dynamically onto fixed physical plant coordinates
const blueprintCoords = [
  { x: "28%", y: "30%", zone: "Stamping Line A" },
  { x: "72%", y: "24%", zone: "Assembly Line B" },
  { x: "48%", y: "65%", zone: "Primary Cooling" },
  { x: "85%", y: "68%", zone: "Hydraulics C" },
  { x: "18%", y: "78%", zone: "Conveyor Line D" },
  { x: "55%", y: "82%", zone: "Secondary Intake" },
];

function MotorsSection({ motors, onSelect }: { motors: Motor[]; onSelect: (id: string) => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [focusedMotor, setFocusedMotor] = useState<Motor | null>(null);

  const add = async () => {
    if (!name.trim() || !user) return;
    const { error } = await supabase.from("motors").insert({
      name: name.trim().slice(0, 50),
      location: location.trim().slice(0, 80) || null,
      user_id: user.id,
    });
    if (error) return toast.error(error.message, { className: "glass border-destructive/20" });
    setName("");
    setLocation("");
    toast.success("Industrial Motor registered in Control Room database", {
      className: "glass border-success/20 rounded-2xl",
    });
  };

  const remove = async (id: string) => {
    await supabase.from("motors").delete().eq("id", id);
    if (focusedMotor?.id === id) setFocusedMotor(null);
    toast.success("Motor registry deleted", { className: "glass border-warning/20 rounded-2xl" });
  };

  return (
    <div className="space-y-8">
      {/* Form Area */}
      <div className="glass hud-card rounded-[2.5rem] border-white/5 p-8">
        <div className="mb-6 flex items-center gap-2.5 text-xl font-bold">
          <Plus className="text-primary h-5 w-5" />
          <span>{t.dash.addMotor}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <input
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.dash.motorName}
            className="bg-background/50 focus:border-primary placeholder:text-muted-foreground/45 min-w-[240px] flex-1 rounded-xl border border-white/10 px-5 py-4 text-sm font-semibold transition-all focus:outline-none"
          />
          <input
            value={location}
            maxLength={80}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.dash.location}
            className="bg-background/50 focus:border-primary placeholder:text-muted-foreground/45 min-w-[240px] flex-1 rounded-xl border border-white/10 px-5 py-4 text-sm font-semibold transition-all focus:outline-none"
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={add}
              className="bg-primary text-primary-foreground hover:bg-primary/95 glow-primary h-14 gap-2 rounded-xl px-8 font-extrabold transition-all"
            >
              <Plus className="h-5 w-5" /> {t.dash.addMotor}
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Visual Blueprint Vector Plant Map */}
        <div className="glass hud-card relative flex min-h-[550px] flex-col justify-between overflow-hidden rounded-[2.5rem] border-white/5 p-8">
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

          <div className="relative z-10 mb-8 flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Grid className="text-primary h-5 w-5" />
              <div>
                <span className="text-lg font-extrabold">Factory Floor Blueprint Map</span>
                <div className="text-muted-foreground/60 mt-0.5 text-[9px] font-black tracking-[0.2em] uppercase">
                  Physical layout sensor coordination
                </div>
              </div>
            </div>
            <div className="text-muted-foreground/60 flex gap-4 text-[9px] font-black tracking-widest uppercase">
              <div className="flex items-center gap-1.5">
                <span className="bg-success h-2 w-2 rounded-full" /> SAFE
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-warning h-2 w-2 rounded-full" /> WARN
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-destructive h-2 w-2 rounded-full" /> FAIL
              </div>
            </div>
          </div>

          {/* Plant Floor Vector Visuals */}
          <div className="bg-background/40 relative flex min-h-[380px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/5">
            {/* Draw industrial boundary boxes on blueprint */}
            <div className="pointer-events-none absolute top-[10%] left-[5%] flex h-[35%] w-[35%] items-start rounded-lg border border-dashed border-white/5 p-2">
              <span className="text-muted-foreground/35 font-mono text-[8px] font-bold tracking-widest uppercase">
                ASSEMBLY ZONE A
              </span>
            </div>
            <div className="pointer-events-none absolute top-[10%] right-[5%] flex h-[35%] w-[35%] items-start rounded-lg border border-dashed border-white/5 p-2">
              <span className="text-muted-foreground/35 font-mono text-[8px] font-bold tracking-widest uppercase">
                ASSEMBLY ZONE B
              </span>
            </div>
            <div className="pointer-events-none absolute bottom-[8%] left-[15%] flex h-[30%] w-[65%] items-start rounded-lg border border-dashed border-white/5 p-2">
              <span className="text-muted-foreground/35 font-mono text-[8px] font-bold tracking-widest uppercase">
                COOLING & HEAVY POWER HYDRAULICS
              </span>
            </div>

            {/* Render dynamically pulsing motor pins */}
            {motors.map((m, idx) => {
              const coord = blueprintCoords[idx % blueprintCoords.length];
              const isDanger = m.status === "danger";
              const isWarning = m.status === "warning";
              const dotColor = isDanger
                ? "bg-destructive glow-error"
                : isWarning
                  ? "bg-warning"
                  : "bg-success glow-success";
              const ringAnim = isDanger
                ? "pulse-ring border-destructive"
                : isWarning
                  ? "pulse-ring border-warning"
                  : "pulse-ring border-success";

              return (
                <button
                  key={m.id}
                  onClick={() => setFocusedMotor(m)}
                  className="group/node absolute cursor-pointer"
                  style={{ left: coord.x, top: coord.y }}
                >
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    {/* Pulsing ring visual */}
                    <div
                      className={`absolute inset-0 rounded-full border opacity-50 ${ringAnim}`}
                    />
                    <div
                      className={`h-4 w-4 rounded-full ${dotColor} border-background relative z-10 border shadow-2xl transition-transform duration-300 group-hover/node:scale-125`}
                    />
                  </div>
                  {/* Floating minimal label */}
                  <span className="bg-background/90 text-muted-foreground/80 pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 rounded-lg border border-white/5 px-2 py-1 text-[9px] font-extrabold whitespace-nowrap opacity-0 shadow-2xl transition-opacity duration-300 group-hover/node:opacity-100">
                    {m.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-muted-foreground/45 mt-4 text-center text-[9px] font-black tracking-[0.25em] uppercase">
            CLICK ON A TELEMETRY NODE TO TARGET ITS SENSOR PROFILE
          </div>
        </div>

        {/* Right Info and Sidebar list */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {focusedMotor ? (
              <motion.div
                key={focusedMotor.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass hud-card rounded-[2.5rem] border-white/5 p-8"
              >
                <div className="mb-6 flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold">{focusedMotor.name}</h3>
                    <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs font-bold">
                      <MapPin className="text-primary h-4 w-4" />
                      <span>{focusedMotor.location ?? "Zone Unassigned"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(focusedMotor.id)}
                    className="border-destructive/20 hover:bg-destructive/10 text-destructive grid h-9 w-9 cursor-pointer place-items-center rounded-xl border transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="my-8 grid grid-cols-2 gap-6">
                  <div className="bg-background/40 rounded-2xl border border-white/5 p-5 text-center">
                    <div className="text-muted-foreground mb-1.5 text-[10px] font-black tracking-wider uppercase">
                      Health State
                    </div>
                    <div className="text-glow-primary text-3xl font-black">
                      {focusedMotor.health_score}%
                    </div>
                  </div>
                  <div className="bg-background/40 rounded-2xl border border-white/5 p-5 text-center">
                    <div className="text-muted-foreground mb-1.5 text-[10px] font-black tracking-wider uppercase">
                      Sensor Signal
                    </div>
                    <StatusBadge status={focusedMotor.status} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => onSelect(focusedMotor.id)}
                    className="bg-primary text-primary-foreground hover:bg-primary/95 glow-primary h-12 flex-1 rounded-xl font-bold transition-all duration-300"
                  >
                    Launch Telemetry HUD
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFocusedMotor(null)}
                    className="h-12 rounded-xl border-white/10 bg-white/3 px-5 font-bold hover:bg-white/8 hover:text-white"
                  >
                    Back
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass hud-card flex min-h-[280px] flex-col items-center justify-center rounded-[2.5rem] border-dashed border-white/5 p-10 text-center"
              >
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/5 bg-white/3 opacity-40">
                  <Info className="text-muted-foreground h-7 w-7" />
                </div>
                <div className="text-muted-foreground/60 max-w-xs text-base leading-relaxed font-bold">
                  Target a telemetry node on the factory blueprint map to audit details
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick List representation */}
          <div className="glass hud-card custom-scrollbar max-h-[350px] overflow-auto rounded-[2.5rem] border-white/5 p-8">
            <div className="text-muted-foreground mb-4 text-[10px] font-black tracking-widest uppercase">
              Core Registry Indexes
            </div>
            <div className="space-y-2">
              {motors.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setFocusedMotor(m)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all duration-300 ${
                    focusedMotor?.id === m.id
                      ? "bg-primary/5 border-primary/20"
                      : "bg-background/20 border-white/5 hover:border-white/10 hover:bg-white/3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Cpu
                      className={`h-4 w-4 ${focusedMotor?.id === m.id ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm font-bold">{m.name}</span>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${m.status === "danger" ? "bg-destructive glow-error" : m.status === "warning" ? "bg-warning" : "bg-success glow-success"}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsSection({ alerts, motors }: { alerts: Alert[]; motors: Motor[] }) {
  const { t, lang } = useI18n();
  if (alerts.length === 0)
    return (
      <div className="glass hud-card rounded-[2.5rem] border-dashed border-white/5 p-20 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-white/5 bg-white/3 opacity-30">
          <Bell className="text-muted-foreground h-8 w-8" />
        </div>
        <div className="text-muted-foreground/50 text-xl font-bold italic">{t.dash.noAlerts}</div>
      </div>
    );

  return (
    <div className="glass hud-card rounded-[2.5rem] border-white/5 p-8">
      <div className="mb-8 flex items-center gap-2.5 text-xl font-bold">
        <Shield className="text-primary h-6 w-6" />
        <span>All System Alerts Registry</span>
      </div>
      <div className="grid gap-4">
        {alerts.map((a) => {
          const m = motors.find((mm) => mm.id === a.motor_id);
          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={a.id}
              className={`flex items-start gap-6 rounded-2xl border p-6 transition-all hover:translate-x-1 ${
                a.severity === "danger"
                  ? "border-destructive/15 bg-destructive/5"
                  : "border-warning/15 bg-warning/5"
              }`}
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${a.severity === "danger" ? "bg-destructive/15 text-destructive border-destructive/20" : "bg-warning/15 text-warning border-warning/20"}`}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2.5 flex flex-wrap items-center gap-3.5">
                  <span
                    className={`rounded-full border px-3.5 py-1.5 text-[9px] font-black tracking-[0.2em] uppercase ${a.severity === "danger" ? "bg-destructive/20 text-destructive border-destructive/25" : "bg-warning/20 text-warning border-warning/25"}`}
                  >
                    {a.severity}
                  </span>
                  <span className="text-muted-foreground/50 text-xs font-semibold">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-lg leading-snug font-bold">
                  {lang === "ar" ? a.message_ar : a.message_en}
                </div>
                <div className="text-muted-foreground/60 mt-3 flex items-center gap-2 text-xs font-bold">
                  <Cpu className="text-primary h-4 w-4" />
                  <span>{m?.name ?? "Zone Sensor Registry Index Unavailable"}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsSection({ motor, chartData }: { motor: Motor; chartData: ChartDataPoint[] }) {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <div className="glass hud-card rounded-[2.5rem] border-white/5 p-8">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-glow-primary text-2xl font-extrabold">{motor.name}</h2>
            <p className="text-muted-foreground/60 mt-1.5 text-[10px] font-black tracking-[0.2em] uppercase">
              Advanced Telemetry Diagnostics Shield
            </p>
          </div>
          <div className="flex gap-2">
            <div className="text-muted-foreground rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-xs font-bold">
              Last 60 Streaming Cycles
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-muted-foreground/35 grid h-[400px] place-items-center rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01] text-sm font-semibold italic">
            {t.dash.empty}
          </div>
        ) : (
          <div className="bg-background/30 relative h-[460px] w-full rounded-[2rem] border border-white/5 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis dataKey="i" hide />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: "bold",
                    padding: 12,
                    boxShadow: "0 20px 45px -10px rgba(0,0,0,0.5)",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{ padding: "4px 0" }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="var(--warning)"
                  filter="url(#neon-glow-yellow)"
                  strokeWidth={4.5}
                  dot={false}
                  isAnimationActive={true}
                  name={t.dash.temp}
                />
                <Line
                  type="monotone"
                  dataKey="cur"
                  stroke="var(--accent)"
                  filter="url(#neon-glow-cyan)"
                  strokeWidth={4.5}
                  dot={false}
                  isAnimationActive={true}
                  name={t.dash.current}
                />
                <Line
                  type="monotone"
                  dataKey="vib"
                  stroke="var(--primary)"
                  filter="url(#neon-glow-mint)"
                  strokeWidth={4.5}
                  dot={false}
                  isAnimationActive={true}
                  name={t.dash.vibration}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsSection({
  motor,
  onModeChange,
}: {
  motor: Motor;
  onModeChange: (m: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="glass hud-card max-w-2xl rounded-[2.5rem] border-white/5 p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-primary/10 border-primary/15 text-primary grid h-12 w-12 place-items-center rounded-2xl border">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-glow-primary text-2xl font-extrabold">{motor.name}</div>
          <div className="text-muted-foreground/60 mt-1.5 text-[10px] font-black tracking-[0.2em] uppercase">
            {t.dash.simulation} Control HUD
          </div>
        </div>
      </div>

      <p className="text-muted-foreground/80 mb-10 leading-relaxed font-semibold">
        Adjust the simulated operational condition profile of this physical motor unit to evaluate
        structural stress scenarios and verify control alarms.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeChange("healthy")}
          className={`flex cursor-pointer flex-col items-center gap-4 rounded-[2rem] border p-8 transition-all duration-300 ${
            motor.mode === "healthy"
              ? "bg-success/10 border-success text-success glow-success"
              : "text-muted-foreground hover:text-foreground border-white/5 bg-white/3 hover:border-white/10 hover:bg-white/8"
          }`}
        >
          <ShieldCheck className="h-11 w-11" />
          <span className="text-lg font-bold">{t.dash.healthy}</span>
          <span className="text-center text-[10px] font-black tracking-widest uppercase opacity-60">
            Nominal structural load operation
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onModeChange("failure")}
          className={`flex cursor-pointer flex-col items-center gap-4 rounded-[2rem] border p-8 transition-all duration-300 ${
            motor.mode === "failure"
              ? "bg-destructive/10 border-destructive text-destructive glow-error animate-pulse"
              : "text-muted-foreground hover:text-foreground border-white/5 bg-white/3 hover:border-white/10 hover:bg-white/8"
          }`}
        >
          <ShieldAlert className="h-11 w-11" />
          <span className="text-lg font-bold">{t.dash.failure}</span>
          <span className="text-center text-[10px] font-black tracking-widest uppercase opacity-60">
            Induce winding overheating scenario
          </span>
        </motion.button>
      </div>

      <div className="mt-12 rounded-2xl border border-white/5 bg-white/3 p-6">
        <div className="text-muted-foreground/60 mb-4 text-[10px] font-black tracking-[0.2em] uppercase">
          Critical Threshold Trigger Boundaries
        </div>
        <div className="grid grid-cols-3 gap-4 font-mono text-xs font-bold">
          <div>
            {t.dash.temp}: <span className="text-primary">≥ {THRESHOLDS.tempMax}°C</span>
          </div>
          <div>
            {t.dash.current}: <span className="text-primary">≥ {THRESHOLDS.currentMax}A</span>
          </div>
          <div>
            {t.dash.vibration}: <span className="text-primary">≥ {THRESHOLDS.vibMax} mm/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const templates = {
  en: {
    alertMsg: {
      tempHigh: "Temperature exceeded safe threshold on {name}",
      currentHigh: "Current draw exceeded safe threshold on {name}",
      vibHigh: "Vibration exceeded safe threshold on {name}",
    },
    pred: {
      bearing: "Possible bearing failure detected on {name}",
      overheat: "{name} trending toward overheating — inspect cooling within 48h",
      vibration: "{name} vibration trending upward — possible imbalance",
      fail48: "{name} may fail within 48 hours",
    },
  },
  ar: {
    alertMsg: {
      tempHigh: "تجاوزت درجة الحرارة العتبة الآمنة في {name}",
      currentHigh: "تجاوز التيار العتبة الآمنة في {name}",
      vibHigh: "تجاوز الاهتزاز العتبة الآمنة في {name}",
    },
    pred: {
      bearing: "احتمال عطل في محامل {name}",
      overheat: "{name} يتجه نحو الحرارة الزائدة — افحص التبريد خلال 48 ساعة",
      vibration: "اهتزاز {name} يتزايد — احتمال اختلال توازن",
      fail48: "{name} قد يتعطل خلال 48 ساعة",
    },
  },
} as const;
