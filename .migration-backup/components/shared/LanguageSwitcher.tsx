"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n-provider";

const languages = [
    { code: "en" as const, name: "EN", flag: "🇬🇧" },
    { code: "ar" as const, name: "ع", flag: "🇪🇬" },
];

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLocale();

    const toggleLanguage = () => {
        const newLang = locale === "en" ? "ar" : "en";
        setLocale(newLang);
    };

    const current = languages.find((l) => l.code === locale);
    const other = languages.find((l) => l.code !== locale);

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-1 text-white/80 hover:text-white hover:bg-white/10"
            title={`Switch to ${other?.name}`}
        >
            <Globe className="h-4 w-4" />
            <span>{current?.flag}</span>
        </Button>
    );
}
