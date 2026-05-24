import { motion } from "motion/react";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Cpu,
  Gauge,
  ShieldCheck,
  Smartphone,
  Zap,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HeroMotorScene } from "@/components/HeroMotorScene";

const springConfig = { type: "spring", stiffness: 100, damping: 20 } as const;

export function Landing() {
  const { t, dir } = useI18n();
  const arrow = dir === "rtl" ? "←" : "→";

  return (
    <div className="text-foreground selection:bg-primary/30 relative min-h-screen overflow-hidden">
      {/* Aurora Ambient Lighting Background Nodes */}
      <div className="bg-primary/4 pointer-events-none absolute top-[-10%] left-[-5%] -z-10 h-[45vw] w-[45vw] rounded-full blur-[140px]" />
      <div className="bg-accent/4 pointer-events-none absolute right-[-10%] bottom-[20%] -z-10 h-[50vw] w-[50vw] rounded-full blur-[160px]" />

      {/* Nav */}
      <header className="bg-background/40 sticky top-0 z-50 border-b border-white/5 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5 font-bold">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              transition={springConfig}
              className="relative"
            >
              <div className="from-primary via-accent to-chart-5 glow-primary relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br">
                <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <Activity className="text-background h-5 w-5" />
              </div>
            </motion.div>
            <span className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
              {t.brand}
            </span>
          </Link>
          <nav className="text-muted-foreground hidden items-center gap-8 text-sm font-semibold tracking-wide md:flex">
            <a
              href="#features"
              className="hover:text-primary group relative py-1 transition-all duration-300"
            >
              {t.nav.features}
              <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#how"
              className="hover:text-primary group relative py-1 transition-all duration-300"
            >
              {t.nav.how}
              <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#contact"
              className="hover:text-primary group relative py-1 transition-all duration-300"
            >
              {t.nav.contact}
              <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-10 rounded-xl px-5 font-bold transition-all duration-300 hover:scale-[1.02]"
              >
                {t.nav.login}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24">
        <div className="grid-bg absolute inset-0 opacity-35" />
        <div className="from-primary/8 pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b to-transparent" />
        <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-44 bg-gradient-to-t to-transparent" />

        <div className="relative z-20 container mx-auto px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 },
                },
              }}
              className="max-w-2xl text-center lg:text-start"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: springConfig },
                }}
                className="border-primary/20 bg-primary/5 text-primary glow-primary/5 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold"
              >
                <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
                {t.tagline}
              </motion.div>
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: springConfig },
                }}
                className="text-glow-primary bg-gradient-to-b from-white to-white/70 bg-clip-text text-5xl leading-[1.02] font-extrabold tracking-tight text-transparent sm:text-6xl xl:text-7xl"
              >
                {t.hero.title}
              </motion.h1>
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: springConfig },
                }}
                className="text-muted-foreground/80 mx-auto mt-8 max-w-xl text-lg leading-relaxed font-medium sm:text-xl lg:mx-0"
              >
                {t.hero.subtitle}
              </motion.p>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: springConfig },
                }}
                className="mt-12 flex flex-wrap justify-center gap-4 lg:justify-start"
              >
                <Link to="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springConfig}
                  >
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/95 glow-primary h-14 gap-3 rounded-xl px-8 text-base font-extrabold transition-all duration-300"
                    >
                      {t.hero.cta} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                    </Button>
                  </motion.div>
                </Link>
                <a href="#contact">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springConfig}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 rounded-xl border-white/10 bg-white/3 px-8 text-base font-bold transition-all duration-300 hover:bg-white/8 hover:text-white"
                    >
                      {t.hero.cta2}
                    </Button>
                  </motion.div>
                </a>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: springConfig },
                }}
                className="text-muted-foreground/75 mt-10 flex flex-wrap justify-center gap-3.5 text-[10px] font-black tracking-[0.25em] uppercase lg:justify-start"
              >
                <span className="rounded-xl border border-white/5 bg-white/3 px-4 py-2.5">
                  Live telemetry
                </span>
                <span className="border-primary/15 bg-primary/5 text-primary glow-primary/5 rounded-xl border px-4 py-2.5">
                  AI signals
                </span>
                <span className="border-success/15 bg-success/5 text-success rounded-xl border px-4 py-2.5">
                  Predictive alerts
                </span>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[620px]"
            >
              <div className="from-primary/10 to-accent/8 pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br via-white/[0.01] blur-3xl" />
              <div className="relative h-[380px] sm:h-[480px] lg:h-[620px]">
                <HeroMotorScene />
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.04] via-transparent to-black/30" />

                {/* Floating telemetry metrics overlay widgets (Responsive: Hidden on small screens) */}
                <div className="pointer-events-none absolute inset-0 z-10 hidden flex-col justify-between p-6 md:flex lg:p-10">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="glass hud-card pointer-events-auto rounded-2xl px-4 py-3 lg:px-5 lg:py-3.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-primary/20 flex h-2 w-2 items-center justify-center rounded-full">
                          <div className="bg-primary h-full w-full animate-pulse rounded-full shadow-[0_0_8px_var(--color-primary)]" />
                        </div>
                        <div className="text-[10px] font-black tracking-[0.2em] text-white/90 uppercase">
                          System Online
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="glass hud-card pointer-events-auto w-44 rounded-2xl p-4 lg:w-52 lg:p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary glow-primary/10 grid h-10 w-10 place-items-center rounded-xl">
                          <Gauge className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                            {t.dash.temp}
                          </div>
                          <div className="text-glow-primary text-2xl font-extrabold">62°C</div>
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className="bg-primary glow-primary h-full"
                          animate={{ width: ["56%", "78%", "62%"] }}
                          transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-end justify-between gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.85, duration: 0.6 }}
                      className="glass hud-card pointer-events-auto w-48 rounded-2xl p-4 lg:w-56 lg:p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-success/10 text-success grid h-10 w-10 place-items-center rounded-xl">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                            {t.dash.vibration}
                          </div>
                          <div className="text-success text-2xl font-extrabold">2.1 mm/s</div>
                        </div>
                      </div>
                      <div className="mt-4 flex h-10 items-end gap-1.5">
                        {[35, 52, 44, 68, 48, 76, 58, 42, 64, 50].map((height, index) => (
                          <motion.span
                            key={index}
                            className="bg-success/70 flex-1 rounded-full"
                            animate={{
                              height: [
                                `${height}%`,
                                `${Math.min(100, height + 24)}%`,
                                `${height}%`,
                              ],
                            }}
                            transition={{ duration: 1.8, delay: index * 0.08, repeat: Infinity }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1, duration: 0.6 }}
                      className="glass hud-card pointer-events-auto w-44 rounded-2xl p-4 lg:w-48 lg:p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-warning/10 text-warning grid h-10 w-10 place-items-center rounded-xl">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                            {t.dash.current}
                          </div>
                          <div className="text-warning text-glow-primary text-2xl font-extrabold">
                            19.4 A
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className="bg-warning h-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ width: "65%" }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="relative container mx-auto border-t border-white/5 px-4 py-32 sm:px-6">
        <div className="bg-destructive/3 pointer-events-none absolute top-[10%] right-[-10%] -z-10 h-[35vw] w-[35vw] rounded-full blur-[120px]" />
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={springConfig}
          >
            <h2 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl leading-tight font-extrabold tracking-tight text-transparent sm:text-5xl">
              {t.problem.title}
            </h2>
            <p className="text-muted-foreground/80 mt-6 text-lg leading-relaxed font-medium">
              {t.problem.desc}
            </p>
          </motion.div>
          <div className="grid gap-5">
            {t.problem.items.map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, ...springConfig }}
                className="glass group hud-card flex gap-5 rounded-2xl p-6 transition-all duration-300 hover:bg-white/5"
              >
                <div className="bg-destructive/10 border-destructive/20 grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-transform duration-300 group-hover:scale-105">
                  <AlertTriangle className="text-destructive h-6 w-6" />
                </div>
                <div>
                  <div className="group-hover:text-destructive text-lg font-bold transition-colors duration-300">
                    {it.t}
                  </div>
                  <div className="text-muted-foreground/70 mt-2 text-sm leading-relaxed font-medium">
                    {it.d}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="relative container mx-auto px-4 py-20 sm:px-6">
        <div className="bg-primary/3 pointer-events-none absolute top-[30%] left-[10%] -z-10 h-[30vw] w-[30vw] rounded-full blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={springConfig}
          className="glass glow-primary hud-card relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] p-10 text-center sm:p-20"
        >
          <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
          <div className="bg-primary/10 border-primary/20 mx-auto mb-8 grid h-16 w-16 place-items-center rounded-2xl border">
            <ShieldCheck className="text-primary h-9 w-9" />
          </div>
          <h2 className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            {t.solution.title}
          </h2>
          <p className="text-muted-foreground/80 mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-medium">
            {t.solution.desc}
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative container mx-auto border-t border-white/5 px-4 py-40 sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={springConfig}
          className="mb-24 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="max-w-xl">
            <div className="text-primary mb-4 font-mono text-[10px] font-black tracking-[0.4em] uppercase">
              Core Systems
            </div>
            <h2 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
              {t.features.title}
            </h2>
          </div>
          <p className="text-muted-foreground/80 max-w-sm text-lg leading-relaxed font-semibold">
            Engineered for high-performance industrial environments where precision and uptime are
            non-negotiable.
          </p>
        </motion.div>

        <div className="grid gap-6 border-none bg-transparent shadow-none md:grid-cols-12">
          {[
            { icon: Activity, span: "md:col-span-7 lg:col-span-8 h-[340px] md:h-[420px]" },
            { icon: Brain, span: "md:col-span-5 lg:col-span-4 h-[340px] md:h-[420px]" },
            { icon: Cpu, span: "md:col-span-4 h-[320px] md:h-[380px]" },
            { icon: BarChart3, span: "md:col-span-4 h-[320px] md:h-[380px]" },
            { icon: AlertTriangle, span: "md:col-span-4 h-[320px] md:h-[380px]" },
            { icon: Smartphone, span: "md:col-span-12 h-[260px] md:h-[320px]" },
          ].map((item, i) => {
            const f = t.features.items[i];
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ scale: 1.02, y: -8 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                }}
                className={`glass group hover:shadow-primary/20 hover:border-primary/60 relative flex flex-col justify-between overflow-hidden rounded-3xl p-8 transition-colors duration-500 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.3)] md:p-10 ${item.span}`}
              >
                {/* Radial Glow Hover effect */}
                <div className="bg-radial-gradient from-primary/20 pointer-events-none absolute inset-0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Animated scanning line overlay */}
                <div className="from-primary/0 via-primary/30 to-primary/0 absolute top-0 -left-[100%] h-[200%] w-1/3 -rotate-45 bg-gradient-to-r opacity-0 transition-all duration-1000 ease-in-out group-hover:left-[200%] group-hover:opacity-100" />

                {/* Border Hover Accent overlay */}
                <div className="via-primary/70 absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 flex items-start justify-between">
                  <div className="text-muted-foreground/40 group-hover:text-primary font-mono text-[10px] tracking-[0.3em] uppercase transition-colors duration-500">
                    MOD-{String(i + 1).padStart(2, "0")} // {f.t.split(" ")[0]}
                  </div>
                  <div className="group-hover:border-primary/50 group-hover:bg-primary/20 grid h-12 w-12 place-items-center rounded-2xl border border-white/5 bg-white/3 transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(var(--primary),0.4)]">
                    <Icon className="text-muted-foreground/40 group-hover:text-primary h-6 w-6 transition-all duration-500 group-hover:scale-110" />
                  </div>
                </div>
                <div className="relative z-10 max-w-md">
                  <h3 className="mb-4 text-2xl font-extrabold tracking-tight transition-transform duration-500 group-hover:translate-x-2 group-hover:text-white">
                    {f.t}
                  </h3>
                  <p className="text-muted-foreground/75 group-hover:text-muted-foreground text-sm leading-relaxed font-semibold transition-colors duration-500">
                    {f.d}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="bg-primary/[0.01] relative container mx-auto rounded-[3rem] border border-white/5 px-4 py-32 sm:px-6">
        <div className="bg-radial-gradient from-primary/5 pointer-events-none absolute inset-0 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={springConfig}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            {t.preview.title}
          </h2>
          <p className="text-muted-foreground/80 mt-4 text-lg font-medium">{t.preview.desc}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="glass shadow-3xl shadow-primary/5 relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-white/10 p-4 sm:p-10"
        >
          <div className="mb-10 grid gap-6 sm:grid-cols-3">
            {[
              { l: t.dash.temp, v: "62°C", c: "bg-primary", g: "glow-primary" },
              { l: t.dash.current, v: "19.4 A", c: "bg-warning", g: "" },
              { l: t.dash.vibration, v: "2.1", c: "bg-success", g: "glow-success" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-background/50 hud-card rounded-2xl border border-white/5 p-6"
              >
                <div className="text-muted-foreground/50 text-xs font-black tracking-widest uppercase">
                  {s.l}
                </div>
                <div className="text-glow-primary mt-2 text-4xl font-extrabold">{s.v}</div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className={`h-full ${s.c} ${s.g}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: ["20%", "85%", "40%", "75%"] }}
                    viewport={{ once: true }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <FakeChart />
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="container mx-auto px-4 py-32 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={springConfig}
          className="mb-20 bg-gradient-to-b from-white to-white/70 bg-clip-text text-center text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl"
        >
          {t.how.title}
        </motion.h2>
        <div className="grid gap-10 md:grid-cols-3">
          {t.how.steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ...springConfig }}
              className="glass hud-card group relative rounded-[2rem] p-8 text-center"
            >
              <div className="text-primary/10 group-hover:text-primary/20 absolute top-4 left-1/2 -translate-x-1/2 text-8xl font-black transition-colors duration-500">
                0{i + 1}
              </div>
              <div className="relative pt-10">
                <div className="group-hover:text-primary mb-4 text-2xl font-extrabold transition-colors duration-500">
                  {s.t}
                </div>
                <div className="text-muted-foreground/75 text-sm leading-relaxed font-semibold">
                  {s.d}
                </div>
              </div>
              {i < 2 && (
                <div className="bg-background absolute top-1/2 -right-5 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 md:flex">
                  <ArrowRight className="text-primary h-5 w-5 rtl:rotate-180" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <ContactForm />

      <footer className="relative container mx-auto border-t border-white/5 px-4 py-16 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          transition={springConfig}
        >
          <div className="group mb-6 flex items-center justify-center gap-2.5 font-bold">
            <div className="from-primary to-accent glow-primary grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br">
              <Activity className="text-background h-4 w-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">{t.brand}</span>
          </div>
          <p className="text-muted-foreground/60 mx-auto max-w-sm text-sm leading-relaxed font-medium">
            {t.footer}
          </p>
        </motion.div>
      </footer>
    </div>
  );
}

function FakeChart() {
  const points = Array.from({ length: 60 }, (_, i) => {
    const y = 45 + Math.sin(i / 4) * 20 + Math.cos(i / 6) * 10;
    return `${(i / 59) * 100},${100 - y}`;
  }).join(" ");
  return (
    <div className="bg-background/50 hud-card rounded-[2rem] border border-white/5 p-6">
      <div className="relative h-64 overflow-hidden">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <filter id="chart-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.polyline
            points={points}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="0.8"
            filter="url(#chart-glow)"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <polygon points={`0,100 ${points} 100,100`} fill="url(#chart-grad)" />
        </svg>
      </div>
    </div>
  );
}

function ContactForm() {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success(t.contact.success, {
        icon: <CheckCircle2 className="text-success h-5 w-5" />,
        className: "glass border-primary/20 rounded-2xl",
      });
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };
  return (
    <section id="contact" className="container mx-auto px-4 py-32 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={springConfig}
        className="glass hud-card relative mx-auto max-w-4xl overflow-hidden rounded-[3rem] border-white/10 p-8 sm:p-16"
      >
        <div className="bg-primary/6 absolute top-0 right-0 -z-10 h-80 w-80 blur-[120px]" />
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
              {t.contact.title}
            </h2>
            <p className="text-muted-foreground/80 text-base leading-relaxed font-semibold">
              {t.contact.desc}
            </p>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4">
            <input
              required
              maxLength={100}
              name="name"
              placeholder={t.contact.name}
              className="bg-background/50 focus:border-primary focus:bg-background/80 placeholder:text-muted-foreground/50 rounded-xl border border-white/10 px-5 py-4 text-sm font-semibold transition-all duration-300 focus:outline-none"
            />
            <input
              required
              type="email"
              maxLength={150}
              name="email"
              placeholder={t.contact.email}
              className="bg-background/50 focus:border-primary focus:bg-background/80 placeholder:text-muted-foreground/50 rounded-xl border border-white/10 px-5 py-4 text-sm font-semibold transition-all duration-300 focus:outline-none"
            />
            <textarea
              required
              maxLength={1000}
              name="message"
              rows={4}
              placeholder={t.contact.message}
              className="bg-background/50 focus:border-primary focus:bg-background/80 placeholder:text-muted-foreground/50 rounded-xl border border-white/10 px-5 py-4 text-sm font-semibold transition-all duration-300 focus:outline-none"
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/95 glow-primary h-14 w-full rounded-xl text-base font-extrabold transition-all duration-300"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t.contact.submit}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
