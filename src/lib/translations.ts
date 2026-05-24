export type Lang = "en" | "ar";

type Dict = {
  brand: string;
  tagline: string;
  nav: { features: string; how: string; contact: string; login: string; dashboard: string };
  hero: { title: string; subtitle: string; cta: string; cta2: string };
  problem: { title: string; desc: string; items: { t: string; d: string }[] };
  solution: { title: string; desc: string };
  features: { title: string; items: { t: string; d: string }[] };
  how: { title: string; steps: { t: string; d: string }[] };
  preview: { title: string; desc: string };
  contact: {
    title: string;
    desc: string;
    name: string;
    email: string;
    company: string;
    message: string;
    submit: string;
    success: string;
  };
  footer: string;
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    signIn: string;
    signUp: string;
    toggleToSignUp: string;
    toggleToSignIn: string;
    loading: string;
  };
  dash: {
    title: string;
    sidebar: {
      dashboard: string;
      motors: string;
      alerts: string;
      analytics: string;
      settings: string;
    };
    status: string;
    safe: string;
    danger: string;
    warning: string;
    health: string;
    temp: string;
    current: string;
    vibration: string;
    liveCharts: string;
    alertFeed: string;
    predictions: string;
    noAlerts: string;
    noPredictions: string;
    selectMotor: string;
    simulation: string;
    healthy: string;
    failure: string;
    signOut: string;
    addMotor: string;
    motorName: string;
    location: string;
    empty: string;
    lastUpdate: string;
    threshold: string;
    language: string;
  };
  pred: { bearing: string; overheat: string; vibration: string; fail48: string };
  alertMsg: { tempHigh: string; currentHigh: string; vibHigh: string };
};

export const translations: Record<Lang, Dict> = {
  en: {
    brand: "Motor Sense",
    tagline: "Predictive Maintenance for 3-Phase Induction Motors",
    nav: {
      features: "Features",
      how: "How it works",
      contact: "Contact",
      login: "Login",
      dashboard: "Dashboard",
    },
    hero: {
      title: "Stop motor failures before they stop you.",
      subtitle:
        "Real-time sensor monitoring and AI-powered predictive maintenance for industrial 3-phase induction motors.",
      cta: "Open Live Dashboard",
      cta2: "Request a Demo",
    },
    problem: {
      title: "The hidden cost of motor failure",
      desc: "Unexpected motor breakdowns halt production lines, destroy bearings, burn windings and cost factories thousands per minute of downtime.",
      items: [
        { t: "Sudden downtime", d: "Failures stop entire production lines without warning." },
        {
          t: "Expensive repairs",
          d: "Bearing and winding replacements cost 10× more after catastrophic failure.",
        },
        { t: "No early warning", d: "Traditional maintenance is reactive, not predictive." },
      ],
    },
    solution: {
      title: "How Motor Sense prevents breakdowns",
      desc: "We continuously monitor temperature, current and vibration, then use trend analysis to forecast failures days before they happen.",
    },
    features: {
      title: "Built for industrial reliability",
      items: [
        { t: "Real-time monitoring", d: "Live telemetry every second with sub-second alerting." },
        { t: "Predictive AI", d: "Trend detection forecasts bearing and winding failures." },
        { t: "Bilingual UI", d: "Full Arabic and English with RTL support." },
        { t: "Multi-motor", d: "Manage every motor on every line from one screen." },
        { t: "Alert history", d: "Complete audit trail of every anomaly and intervention." },
        { t: "Mobile ready", d: "Monitor the floor from anywhere on any device." },
      ],
    },
    how: {
      title: "How it works",
      steps: [
        {
          t: "Install sensors",
          d: "Attach temperature, current and vibration sensors to each motor.",
        },
        { t: "Stream telemetry", d: "Data streams to Motor Sense every second over the cloud." },
        {
          t: "Predict & alert",
          d: "Our engine detects anomalies and notifies your team instantly.",
        },
      ],
    },
    preview: {
      title: "A live look at your factory floor",
      desc: "Glanceable health scores, streaming charts, and instant alerts.",
    },
    contact: {
      title: "Request a quote",
      desc: "Tell us about your facility and we'll get back within one business day.",
      name: "Full name",
      email: "Work email",
      company: "Company",
      message: "Tell us about your motors",
      submit: "Send request",
      success: "Thanks! We'll be in touch shortly.",
    },
    footer: "© 2026 Motor Sense. All rights reserved.",
    auth: {
      title: "Factory Admin Access",
      subtitle: "Sign in to your Motor Sense control room",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signUp: "Create account",
      toggleToSignUp: "No account? Sign up",
      toggleToSignIn: "Have an account? Sign in",
      loading: "Working...",
    },
    dash: {
      title: "Control Room",
      sidebar: {
        dashboard: "Dashboard",
        motors: "Motors",
        alerts: "Alerts",
        analytics: "Analytics",
        settings: "Settings",
      },
      status: "System Status",
      safe: "SAFE",
      danger: "DANGER",
      warning: "WARNING",
      health: "Motor Health",
      temp: "Temperature",
      current: "Current",
      vibration: "Vibration",
      liveCharts: "Live Telemetry",
      alertFeed: "Alert Feed",
      predictions: "AI Predictions",
      noAlerts: "All systems nominal — no alerts.",
      noPredictions: "No anomalies detected.",
      selectMotor: "Select motor",
      simulation: "Simulation",
      healthy: "Healthy",
      failure: "Failure",
      signOut: "Sign out",
      addMotor: "Add motor",
      motorName: "Motor name",
      location: "Location",
      empty: "No data yet — waiting for sensor stream...",
      lastUpdate: "Last update",
      threshold: "Threshold",
      language: "Language",
    },
    pred: {
      bearing: "Possible bearing failure detected on {name}",
      overheat: "{name} trending toward overheating — inspect cooling within 48h",
      vibration: "{name} vibration trending upward — possible imbalance",
      fail48: "{name} may fail within 48 hours",
    },
    alertMsg: {
      tempHigh: "Temperature exceeded safe threshold on {name}",
      currentHigh: "Current draw exceeded safe threshold on {name}",
      vibHigh: "Vibration exceeded safe threshold on {name}",
    },
  },
  ar: {
    brand: "Motor Sense",
    tagline: "صيانة تنبؤية لمحركات الحث ثلاثية الطور",
    nav: {
      features: "المميزات",
      how: "آلية العمل",
      contact: "تواصل",
      login: "تسجيل الدخول",
      dashboard: "لوحة التحكم",
    },
    hero: {
      title: "أوقف أعطال المحركات قبل أن توقفك.",
      subtitle:
        "مراقبة لحظية للحساسات وصيانة تنبؤية مدعومة بالذكاء الاصطناعي لمحركات الحث الصناعية ثلاثية الطور.",
      cta: "افتح لوحة التحكم اللحظية",
      cta2: "اطلب عرضاً تجريبياً",
    },
    problem: {
      title: "التكلفة الخفية لأعطال المحركات",
      desc: "الأعطال المفاجئة توقف خطوط الإنتاج وتُتلف المحامل وتحرق الملفات وتكلف المصانع آلاف الدولارات لكل دقيقة توقف.",
      items: [
        { t: "توقف مفاجئ", d: "الأعطال توقف خطوط إنتاج كاملة دون إنذار." },
        { t: "إصلاحات مكلفة", d: "استبدال المحامل والملفات يكلف 10 أضعاف بعد العطل الكامل." },
        { t: "لا إنذار مبكر", d: "الصيانة التقليدية تفاعلية لا تنبؤية." },
      ],
    },
    solution: {
      title: "كيف يمنع Motor Sense الأعطال",
      desc: "نراقب الحرارة والتيار والاهتزاز باستمرار، ونحلل المؤشرات للتنبؤ بالأعطال قبل أيام من وقوعها.",
    },
    features: {
      title: "مصمم للموثوقية الصناعية",
      items: [
        { t: "مراقبة لحظية", d: "بيانات حية كل ثانية مع تنبيهات فورية." },
        { t: "ذكاء تنبؤي", d: "كشف الاتجاهات يتنبأ بأعطال المحامل والملفات." },
        { t: "واجهة ثنائية اللغة", d: "دعم كامل للعربية والإنجليزية مع RTL." },
        { t: "محركات متعددة", d: "إدارة جميع محركات خطوطك من شاشة واحدة." },
        { t: "سجل التنبيهات", d: "أرشيف كامل لكل حالة شاذة وتدخل." },
        { t: "جاهز للجوال", d: "راقب مصنعك من أي مكان وأي جهاز." },
      ],
    },
    how: {
      title: "آلية العمل",
      steps: [
        { t: "ركّب الحساسات", d: "ضع حساسات الحرارة والتيار والاهتزاز على كل محرك." },
        { t: "بث البيانات", d: "ترسل البيانات إلى Motor Sense كل ثانية عبر السحابة." },
        { t: "تنبؤ وتنبيه", d: "محركنا يكشف الشذوذ ويُنبه فريقك فوراً." },
      ],
    },
    preview: {
      title: "نظرة لحظية على أرضية مصنعك",
      desc: "مؤشرات صحية واضحة، رسوم بيانية متدفقة، وتنبيهات فورية.",
    },
    contact: {
      title: "اطلب عرض سعر",
      desc: "أخبرنا عن منشأتك وسنتواصل معك خلال يوم عمل.",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      company: "الشركة",
      message: "أخبرنا عن محركاتك",
      submit: "إرسال الطلب",
      success: "شكراً! سنتواصل معك قريباً.",
    },
    footer: "© 2026 Motor Sense. جميع الحقوق محفوظة.",
    auth: {
      title: "دخول مسؤول المصنع",
      subtitle: "ادخل إلى غرفة تحكم Motor Sense",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      toggleToSignUp: "لا تملك حساباً؟ سجل الآن",
      toggleToSignIn: "لديك حساب؟ سجل الدخول",
      loading: "جارٍ المعالجة...",
    },
    dash: {
      title: "غرفة التحكم",
      sidebar: {
        dashboard: "اللوحة",
        motors: "المحركات",
        alerts: "التنبيهات",
        analytics: "التحليلات",
        settings: "الإعدادات",
      },
      status: "حالة النظام",
      safe: "آمن",
      danger: "خطر",
      warning: "تحذير",
      health: "صحة المحرك",
      temp: "درجة الحرارة",
      current: "التيار",
      vibration: "الاهتزاز",
      liveCharts: "البث المباشر",
      alertFeed: "سجل التنبيهات",
      predictions: "توقعات الذكاء الاصطناعي",
      noAlerts: "كل الأنظمة طبيعية — لا توجد تنبيهات.",
      noPredictions: "لم يُكتشف أي شذوذ.",
      selectMotor: "اختر المحرك",
      simulation: "المحاكاة",
      healthy: "صحي",
      failure: "عطل",
      signOut: "تسجيل الخروج",
      addMotor: "إضافة محرك",
      motorName: "اسم المحرك",
      location: "الموقع",
      empty: "لا توجد بيانات بعد — بانتظار بث الحساسات...",
      lastUpdate: "آخر تحديث",
      threshold: "العتبة",
      language: "اللغة",
    },
    pred: {
      bearing: "احتمال عطل في محامل {name}",
      overheat: "{name} يتجه نحو الحرارة الزائدة — افحص التبريد خلال 48 ساعة",
      vibration: "اهتزاز {name} يتزايد — احتمال اختلال توازن",
      fail48: "{name} قد يتعطل خلال 48 ساعة",
    },
    alertMsg: {
      tempHigh: "تجاوزت درجة الحرارة العتبة الآمنة في {name}",
      currentHigh: "تجاوز التيار العتبة الآمنة في {name}",
      vibHigh: "تجاوز الاهتزاز العتبة الآمنة في {name}",
    },
  },
};

export type TKey = keyof (typeof translations)["en"];
