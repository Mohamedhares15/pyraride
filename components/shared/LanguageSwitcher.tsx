"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const languages = [
    { code: "en", name: "EN", flag: "🇬🇧" },
    { code: "ar", name: "ع", flag: "🇪🇬" },
];

export default function LanguageSwitcher() {
    const [currentLang, setCurrentLang] = useState("en");

    useEffect(() => {
        const saved = localStorage.getItem("pyraride-lang");
        if (saved) {
            setCurrentLang(saved);
            document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = saved;
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = currentLang === "en" ? "ar" : "en";
        setCurrentLang(newLang);
        localStorage.setItem("pyraride-lang", newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLang;
        window.location.reload();
    };

    const current = languages.find((l) => l.code === currentLang);
    const other = languages.find((l) => l.code !== currentLang);

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
