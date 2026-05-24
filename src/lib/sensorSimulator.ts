import { supabase } from "@/integrations/supabase/client";

export type Motor = {
  id: string;
  user_id: string;
  name: string;
  mode: string;
  status: string;
  health_score: number;
  location: string | null;
};

const THRESHOLDS = { tempMax: 85, currentMax: 30, vibMax: 6 };

type State = { temp: number; current: number; vib: number; t: number };
const motorState = new Map<string, State>();

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function nextReading(motor: Motor) {
  const s = motorState.get(motor.id) ?? { temp: 55, current: 18, vib: 2.0, t: 0 };
  s.t += 1;

  if (motor.mode === "failure") {
    // Trend upward with noise
    s.temp = Math.min(110, s.temp + rand(0.4, 1.1) + Math.sin(s.t / 8) * 0.4);
    s.current = Math.min(45, s.current + rand(0.1, 0.35));
    s.vib = Math.min(12, s.vib + rand(0.05, 0.18));
  } else {
    // Healthy: oscillate around safe values
    s.temp = clamp(s.temp + rand(-1.2, 1.2), 45, 78);
    s.current = clamp(s.current + rand(-0.8, 0.8), 12, 26);
    s.vib = clamp(s.vib + rand(-0.3, 0.3), 0.5, 4.5);
  }
  motorState.set(motor.id, s);

  let status = "safe";
  if (
    s.temp >= THRESHOLDS.tempMax ||
    s.current >= THRESHOLDS.currentMax ||
    s.vib >= THRESHOLDS.vibMax
  )
    status = "danger";
  else if (
    s.temp >= THRESHOLDS.tempMax * 0.9 ||
    s.current >= THRESHOLDS.currentMax * 0.9 ||
    s.vib >= THRESHOLDS.vibMax * 0.9
  )
    status = "warning";

  return {
    motor_id: motor.id,
    user_id: motor.user_id,
    temperature: Number(s.temp.toFixed(2)),
    current: Number(s.current.toFixed(2)),
    vibration: Number(s.vib.toFixed(2)),
    status,
  };
}

function clamp(n: number, mn: number, mx: number) {
  return Math.max(mn, Math.min(mx, n));
}

let interval: ReturnType<typeof setInterval> | null = null;

export function startSimulator(
  getMotors: () => Motor[],
  onMotorChange?: (id: string, health: number, status: string) => void,
) {
  stopSimulator();
  interval = setInterval(async () => {
    const motors = getMotors();
    for (const m of motors) {
      const reading = nextReading(m);
      await supabase.from("sensor_readings").insert(reading);
      // Update motor health/status
      const drop = reading.status === "danger" ? 0.6 : reading.status === "warning" ? 0.2 : 0;
      const newHealth = Math.max(
        0,
        Math.min(100, m.health_score - drop + (reading.status === "safe" ? 0.05 : 0)),
      );
      if (Math.abs(newHealth - m.health_score) > 0.5 || reading.status !== m.status) {
        const rounded = Math.round(newHealth);
        await supabase
          .from("motors")
          .update({ health_score: rounded, status: reading.status })
          .eq("id", m.id);
        m.health_score = newHealth;
        m.status = reading.status;

        if (onMotorChange) {
          onMotorChange(m.id, rounded, reading.status);
        }
      }
    }
  }, 1000);
}

export function stopSimulator() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export function resetMotorState(motorId: string) {
  motorState.delete(motorId);
}

export { THRESHOLDS };
