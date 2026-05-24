import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Activity, Loader2, ShieldCheck, Fingerprint, Terminal, Cpu } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export function AuthPage() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const springConfig = { type: "spring" as const, stiffness: 100, damping: 20 };

  // Secure Terminal Logs Simulator
  const [logs, setLogs] = useState<string[]>([
    "SYS_INIT: Motor Sense Secure Admin Terminal v4.2.1",
    "NET_SHIELD: Encrypted SSL/TLS Handshake verified",
    "AI_CORE: Predictive engine active (99.8% precision)",
  ]);

  useEffect(() => {
    const messages = [
      "DB_CONN: Supabase secure instance verified",
      "SYS_STAT: All 3-phase induction telemetry online",
      "SECURE_GATEWAY: Awaiting administrative clearance...",
      "AI_MONITOR: Standing by for anomaly projection",
      "TELEMETRY_BUF: Direct stream active on Port 5432",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-3), messages[idx]]);
      idx = (idx + 1) % messages.length;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" }).catch(() => {});
    }
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
      }
      await navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animated-bg text-foreground relative grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
      {/* Background cyber grid */}
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-[0.18]" />

      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 z-30">
        <LanguageSwitcher />
      </div>

      {/* Left panel: Futuristic Biometric & Cyber Scanner preview */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 bg-black/40 p-12 lg:flex">
        {/* Animated aura */}
        <div className="bg-primary/8 pointer-events-none absolute top-[-20%] left-[-20%] h-[60%] w-[60%] rounded-full blur-[160px]" />
        <div className="bg-accent/6 pointer-events-none absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full blur-[140px]" />

        {/* Branding header */}
        <Link to="/" className="group relative z-10 flex items-center gap-3.5 self-start">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -6 }}
            transition={springConfig}
            className="from-primary via-accent to-chart-5 glow-primary grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br"
          >
            <Activity className="text-background h-5 w-5" />
          </motion.div>
          <div>
            <div className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
              {t.brand}
            </div>
            <div className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
              {t.auth.subtitle}
            </div>
          </div>
        </Link>

        {/* HUD Biometric Scanning Module */}
        <div className="relative z-10 mx-auto my-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass relative overflow-hidden rounded-3xl border-white/10 p-8"
          >
            {/* The sweeping scan line */}
            <div className="via-primary scanning-line pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-60" />

            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary h-5 w-5" />
                <span className="text-primary text-xs font-black tracking-[0.2em] uppercase">
                  {busy ? "VERIFYING CREDENTIALS" : "SECURE SYSTEM ACCESS"}
                </span>
              </div>
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            </div>

            {/* Glowing biometric visualizer */}
            <div className="group relative mx-auto my-10 grid h-48 w-48 place-items-center overflow-hidden rounded-full border border-white/5 bg-white/3">
              {/* Inner glowing pulse rings */}
              <div className="border-primary/10 absolute inset-2 animate-ping rounded-full border opacity-25" />
              <div className="border-accent/20 absolute inset-6 animate-pulse rounded-full border" />
              <div className="absolute inset-10 rounded-full border border-dashed border-white/5" />

              <motion.div
                animate={busy ? { scale: [1, 1.1, 1], rotate: 360 } : { scale: 1, rotate: 0 }}
                transition={busy ? { duration: 2, repeat: Infinity, ease: "linear" } : springConfig}
                className="bg-background/80 relative z-10 grid h-28 w-28 place-items-center rounded-full border border-white/10 shadow-inner"
              >
                {busy ? (
                  <Loader2 className="text-primary h-12 w-12 animate-spin" />
                ) : (
                  <Fingerprint className="text-primary text-glow-primary h-14 w-14 transition-transform duration-300 group-hover:scale-105" />
                )}
              </motion.div>
            </div>

            <div className="text-muted-foreground/80 mb-6 text-center text-sm font-bold tracking-tight">
              SECURE INDUSTRIAL PORTAL // ID_VALIDATION
            </div>

            {/* Floating details overlay */}
            <div className="text-muted-foreground/60 grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-[10px] font-black tracking-wider uppercase">
              <div className="flex items-center gap-2">
                <Cpu className="text-accent h-4 w-4" />
                <span>PREDICTIVE CORES: 8</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="text-success h-4 w-4" />
                <span>STATE: ENCRYPTED</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Terminal log simulator output */}
        <div className="glass text-muted-foreground/70 hud-card z-10 mx-auto w-full max-w-md rounded-2xl border-white/5 p-5 font-mono text-[10px]">
          <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
            <Terminal className="text-primary h-5 w-5" />
            <span className="text-primary font-bold">PORTAL_FEED_LOGS</span>
          </div>
          <div className="min-h-16 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {logs.map((log) => (
                <motion.div
                  key={log}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2"
                >
                  <span className="text-primary font-bold">{`>`}</span>
                  <span className="truncate">{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right panel: Modern, Clean Auth Form */}
      <div className="relative flex flex-col justify-center p-6 sm:p-16 lg:p-20">
        <div className="bg-primary/4 pointer-events-none absolute top-[-10%] right-[-10%] -z-10 h-[50%] w-[50%] rounded-full blur-[140px]" />

        {/* Small top branding for mobile views */}
        <Link to="/" className="mb-12 flex items-center gap-3.5 self-center lg:hidden">
          <div className="from-primary via-accent to-chart-5 glow-primary grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br">
            <Activity className="text-background h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">{t.brand}</div>
            <div className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
              {t.auth.subtitle}
            </div>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
              {t.auth.title}
            </h1>
            <p className="text-muted-foreground mt-3 text-sm font-semibold tracking-wider uppercase">
              {mode === "in" ? "ENTER YOUR CREDENTIALS" : "REGISTER YOUR CORE UNIT"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.email}
                className="bg-background/50 focus:border-primary focus:bg-background/80 placeholder:text-muted-foreground/40 w-full rounded-xl border border-white/10 px-5 py-4 text-sm font-semibold transition-all duration-300 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.password}
                className="bg-background/50 focus:border-primary focus:bg-background/80 placeholder:text-muted-foreground/40 w-full rounded-xl border border-white/10 px-5 py-4 text-sm font-semibold transition-all duration-300 focus:outline-none"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
              <Button
                type="submit"
                disabled={busy}
                className="bg-primary text-primary-foreground hover:bg-primary/95 glow-primary h-14 w-full rounded-xl text-base font-extrabold transition-all duration-300"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : mode === "in" ? (
                  t.auth.signIn
                ) : (
                  t.auth.signUp
                )}
              </Button>
            </motion.div>
          </form>

          <button
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="text-muted-foreground/70 hover:text-primary group mt-8 flex w-full items-center justify-center gap-2 py-2 text-sm font-bold transition-colors duration-300"
          >
            {mode === "in" ? t.auth.toggleToSignUp : t.auth.toggleToSignIn}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
