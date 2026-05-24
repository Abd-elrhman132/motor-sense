import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="gap-2 border-white/10 bg-white/5 hover:bg-white/10"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "العربية" : "English"}
    </Button>
  );
}
