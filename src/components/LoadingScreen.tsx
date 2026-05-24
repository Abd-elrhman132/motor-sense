import { motion, AnimatePresence } from "motion/react";
import { Activity } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="bg-background fixed inset-0 z-[100] grid place-items-center overflow-hidden"
        >
          {/* Background atmospheric glow */}
          <div className="bg-primary/5 pointer-events-none absolute top-1/2 left-1/2 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

          <div className="relative flex flex-col items-center">
            <div className="relative grid place-items-center">
              {/* Outer sweeping scanner rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="border-primary/20 absolute -inset-8 rounded-full border border-dashed"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="border-accent/30 absolute -inset-4 rounded-full border-2 border-t-transparent border-r-transparent"
              />

              {/* Core pulsing logo */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="from-primary via-accent to-chart-5 glow-primary grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br shadow-2xl"
              >
                <Activity className="text-background h-8 w-8" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 flex flex-col items-center gap-2"
            >
              <div className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                {t.brand}
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">
                  Initializing System
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
