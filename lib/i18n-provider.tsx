"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Translation data embedded directly to avoid JSON import issues
const en = {
    common: {
        loading: "Loading...",
        error: "An error occurred",
        success: "Success",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        back: "Back",
        next: "Next",
        search: "Search",
        filter: "Filter",
        clear: "Clear"
    },
    nav: {
        home: "Home",
        browseStables: "Browse Stables",
        stables: "Stables",
        gallery: "Gallery",
        dashboard: "Dashboard",
        signIn: "Sign In",
        signOut: "Sign Out",
        getStarted: "Get Started",
        profile: "Profile"
    },
    hero: {
        title: "THE PYRAMIDS, UNFORGETTABLE.",
        subtitle: "THE RIDE, UNCOMPLICATED.",
        description: "Book your trusted, vetted ride at Giza and Saqqara.",
        search: "Search"
    },
    stables: {
        title: "Browse Stables",
        noResults: "No Stables Found",
        loading: "Loading stables...",
        searchPlaceholder: "Search for stables...",
        allLocations: "All Locations",
        minimumRating: "Minimum Rating",
        anyRating: "Any Rating",
        filterBy: "Filter by",
        discover: "Discover Your Next Adventure",
        horses: "Horses",
        bookings: "Bookings",
        reviews: "Reviews"
    },
    booking: {
        title: "Book Your Ride",
        selectDate: "Select Date",
        selectHorse: "Select Horse",
        selectTime: "Select Time",
        riders: "Number of Riders",
        pickup: "Hotel Pickup",
        addons: "Add-ons",
        summary: "Review Your Booking",
        total: "Total",
        completeBooking: "Complete Booking",
        bookingSuccess: "Booking Successful!",
        confirmDetails: "Please confirm your booking details",
        groupDiscount: "5+ riders = 10% discount!"
    },
    dashboard: {
        myBookings: "My Bookings",
        upcomingBookings: "Upcoming Bookings",
        pastBookings: "Past Bookings",
        noBookings: "No Bookings Yet",
        startAdventure: "Start your adventure by booking a horse riding experience!"
    },
    payment: {
        proceedToPay: "Proceed to Payment",
        paymentMethod: "Payment Method",
        totalAmount: "Total Amount",
        currency: "EGP",
        processing: "Processing your payment...",
        success: "Payment Successful!",
        failed: "Payment Failed"
    },
    features: {
        bestPrice: "Best Price Guarantee",
        safeCertified: "Safe & Certified",
        verifiedStables: "Verified Stables 100%"
    }
};

const ar = {
    common: {
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        success: "تم بنجاح",
        cancel: "إلغاء",
        confirm: "تأكيد",
        save: "حفظ",
        edit: "تعديل",
        delete: "حذف",
        back: "رجوع",
        next: "التالي",
        search: "بحث",
        filter: "تصفية",
        clear: "مسح"
    },
    nav: {
        home: "الرئيسية",
        browseStables: "تصفح الاسطبلات",
        stables: "الاسطبلات",
        gallery: "المعرض",
        dashboard: "لوحة التحكم",
        signIn: "تسجيل الدخول",
        signOut: "تسجيل الخروج",
        getStarted: "ابدأ الآن",
        profile: "الملف الشخصي"
    },
    hero: {
        title: "الأهرامات، تجربة لا تُنسى.",
        subtitle: "الرحلة، بدون تعقيد.",
        description: "احجز رحلتك الموثوقة في الجيزة وسقارة.",
        search: "بحث"
    },
    stables: {
        title: "تصفح الاسطبلات",
        noResults: "لم يتم العثور على اسطبلات",
        loading: "جاري تحميل الاسطبلات...",
        searchPlaceholder: "ابحث عن الاسطبلات...",
        allLocations: "جميع المواقع",
        minimumRating: "الحد الأدنى للتقييم",
        anyRating: "أي تقييم",
        filterBy: "تصفية حسب",
        discover: "اكتشف مغامرتك القادمة",
        horses: "حصان",
        bookings: "حجز",
        reviews: "تقييم"
    },
    booking: {
        title: "احجز رحلتك",
        selectDate: "اختر التاريخ",
        selectHorse: "اختر الحصان",
        selectTime: "اختر الوقت",
        riders: "عدد الفرسان",
        pickup: "التوصيل من الفندق",
        addons: "إضافات",
        summary: "مراجعة حجزك",
        total: "الإجمالي",
        completeBooking: "إتمام الحجز",
        bookingSuccess: "تم الحجز بنجاح!",
        confirmDetails: "يرجى تأكيد تفاصيل حجزك",
        groupDiscount: "٥+ فرسان = خصم ١٠٪!"
    },
    dashboard: {
        myBookings: "حجوزاتي",
        upcomingBookings: "الحجوزات القادمة",
        pastBookings: "الحجوزات السابقة",
        noBookings: "لا توجد حجوزات بعد",
        startAdventure: "ابدأ مغامرتك بحجز تجربة ركوب الخيل!"
    },
    payment: {
        proceedToPay: "المتابعة للدفع",
        paymentMethod: "طريقة الدفع",
        totalAmount: "المبلغ الإجمالي",
        currency: "جنيه مصري",
        processing: "جاري معالجة الدفع...",
        success: "تم الدفع بنجاح!",
        failed: "فشل الدفع"
    },
    features: {
        bestPrice: "ضمان أفضل سعر",
        safeCertified: "آمن ومعتمد",
        verifiedStables: "اسطبلات موثقة ١٠٠٪"
    }
};

type Locale = "en" | "ar";
type TranslationKeys = typeof en;

interface I18nContextType {
    locale: Locale;
    t: (key: string) => string;
    setLocale: (locale: Locale) => void;
    dir: "ltr" | "rtl";
}

const translations: Record<Locale, TranslationKeys> = { en, ar };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string {
    const keys = path.split(".");
    let result = obj;
    for (const key of keys) {
        if (result && typeof result === "object" && key in result) {
            result = result[key];
        } else {
            return path;
        }
    }
    return typeof result === "string" ? result : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("pyraride-lang") as Locale;
        if (saved && (saved === "en" || saved === "ar")) {
            setLocaleState(saved);
            document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = saved;
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("pyraride-lang", newLocale);
        document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLocale;
    };

    const t = (key: string): string => {
        return getNestedValue(translations[locale], key);
    };

    const dir = locale === "ar" ? "rtl" : "ltr";

    if (!mounted) {
        return (
            <I18nContext.Provider value={{ locale: "en", t: (key) => getNestedValue(en, key), setLocale, dir: "ltr" }}>
                {children}
            </I18nContext.Provider>
        );
    }

    return (
        <I18nContext.Provider value={{ locale, t, setLocale, dir }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }
    return context;
}

export function useLocale() {
    const { locale, setLocale, dir } = useTranslation();
    return { locale, setLocale, dir };
}

export type { Locale };
