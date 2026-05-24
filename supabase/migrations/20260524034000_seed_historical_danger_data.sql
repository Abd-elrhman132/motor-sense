-- Upgrade user seeding logic to generate high-fidelity historical telemetry and alert danger states for demonstration

create or replace function public.handle_new_user_motors()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m1_id uuid;
  m2_id uuid;
  i integer;
  temp_val numeric;
  curr_val numeric;
  vib_val numeric;
  status_val text;
begin
  -- 1. Insert Motor #1 (Healthy State)
  insert into public.motors (user_id, name, location, health_score, status, mode)
  values (new.id, 'Motor #1', 'Stamping Line A', 98, 'safe', 'healthy')
  returning id into m1_id;

  -- 2. Insert Motor #2 (Failing / Danger State)
  insert into public.motors (user_id, name, location, health_score, status, mode)
  values (new.id, 'Motor #2', 'Cooling System B', 42, 'danger', 'failure')
  returning id into m2_id;

  -- 3. Seed historical readings for Motor #1 (oscillating safely)
  for i in 1..20 loop
    temp_val := 52.0 + (sin(i) * 3.5) + (random() * 1.5);
    curr_val := 16.0 + (cos(i) * 2.1) + (random() * 1.0);
    vib_val := 1.8 + (sin(i * 1.5) * 0.4) + (random() * 0.2);
    
    insert into public.sensor_readings (motor_id, user_id, temperature, current, vibration, status, created_at)
    values (
      m1_id, 
      new.id, 
      round(temp_val, 2), 
      round(curr_val, 2), 
      round(vib_val, 2), 
      'safe', 
      now() - (20 - i) * interval '5 seconds'
    );
  end loop;

  -- 4. Seed historical readings for Motor #2 (safely starting then escalating to danger)
  for i in 1..20 loop
    if i <= 8 then
      -- Safe readings early on
      temp_val := 58.0 + i * 2.0 + (random() * 1.5);
      curr_val := 18.0 + i * 0.8 + (random() * 0.5);
      vib_val := 2.2 + i * 0.15 + (random() * 0.2);
      status_val := 'safe';
    elsif i <= 14 then
      -- Warning threshold crossings
      temp_val := 74.0 + (i - 8) * 1.5 + (random() * 1.0);
      curr_val := 24.4 + (i - 8) * 0.6 + (random() * 0.5);
      vib_val := 3.4 + (i - 8) * 0.3 + (random() * 0.1);
      status_val := 'warning';
    else
      -- Dangerous threshold crossings
      temp_val := 84.0 + (i - 14) * 2.2 + (random() * 1.0);
      curr_val := 28.5 + (i - 14) * 1.1 + (random() * 0.5);
      vib_val := 5.2 + (i - 14) * 0.5 + (random() * 0.2);
      status_val := 'danger';
    end if;

    insert into public.sensor_readings (motor_id, user_id, temperature, current, vibration, status, created_at)
    values (
      m2_id, 
      new.id, 
      round(temp_val, 2), 
      round(curr_val, 2), 
      round(vib_val, 2), 
      status_val, 
      now() - (20 - i) * interval '5 seconds'
    );
  end loop;

  -- 5. Seed initial alert history records matching the telemetry timeline
  insert into public.alerts (motor_id, user_id, severity, message_en, message_ar, created_at)
  values
    (
      m2_id, 
      new.id, 
      'warning', 
      'Vibration exceeded warning threshold on Motor #2', 
      'تجاوز الاهتزاز عتبة التحذير في Motor #2', 
      now() - interval '40 seconds'
    ),
    (
      m2_id, 
      new.id, 
      'danger', 
      'Temperature exceeded safe threshold on Motor #2', 
      'تجاوزت درجة الحرارة العتبة الآمنة في Motor #2', 
      now() - interval '20 seconds'
    ),
    (
      m2_id, 
      new.id, 
      'danger', 
      'Current draw exceeded safe threshold on Motor #2', 
      'تجاوز التيار العتبة الآمنة في Motor #2', 
      now() - interval '5 seconds'
    );

  return new;
end;
$$;
