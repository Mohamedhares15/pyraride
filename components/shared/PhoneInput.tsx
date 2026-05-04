"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountryCode {
  code: string;
  flag: string;
  dialCode: string;
  name: string;
}

const countries: CountryCode[] = [
  { code: "EG", flag: "🇪🇬", dialCode: "+20", name: "Egypt" },
  { code: "SA", flag: "🇸🇦", dialCode: "+966", name: "Saudi Arabia" },
  { code: "AE", flag: "🇦🇪", dialCode: "+971", name: "UAE" },
  { code: "US", flag: "🇺🇸", dialCode: "+1", name: "United States" },
  { code: "GB", flag: "🇬🇧", dialCode: "+44", name: "United Kingdom" },
  { code: "FR", flag: "🇫🇷", dialCode: "+33", name: "France" },
  { code: "DE", flag: "🇩🇪", dialCode: "+49", name: "Germany" },
  { code: "IT", flag: "🇮🇹", dialCode: "+39", name: "Italy" },
  { code: "ES", flag: "🇪🇸", dialCode: "+34", name: "Spain" },
  { code: "CA", flag: "🇨🇦", dialCode: "+1", name: "Canada" },
  { code: "AU", flag: "🇦🇺", dialCode: "+61", name: "Australia" },
  { code: "JP", flag: "🇯🇵", dialCode: "+81", name: "Japan" },
  { code: "CN", flag: "🇨🇳", dialCode: "+86", name: "China" },
  { code: "IN", flag: "🇮🇳", dialCode: "+91", name: "India" },
  { code: "BR", flag: "🇧🇷", dialCode: "+55", name: "Brazil" },
  { code: "MX", flag: "🇲🇽", dialCode: "+52", name: "Mexico" },
  { code: "RU", flag: "🇷🇺", dialCode: "+7", name: "Russia" },
  { code: "KR", flag: "🇰🇷", dialCode: "+82", name: "South Korea" },
  { code: "TR", flag: "🇹🇷", dialCode: "+90", name: "Turkey" },
  { code: "NL", flag: "🇳🇱", dialCode: "+31", name: "Netherlands" },
  { code: "BE", flag: "🇧🇪", dialCode: "+32", name: "Belgium" },
  { code: "CH", flag: "🇨🇭", dialCode: "+41", name: "Switzerland" },
  { code: "AT", flag: "🇦🇹", dialCode: "+43", name: "Austria" },
  { code: "SE", flag: "🇸🇪", dialCode: "+46", name: "Sweden" },
  { code: "NO", flag: "🇳🇴", dialCode: "+47", name: "Norway" },
  { code: "DK", flag: "🇩🇰", dialCode: "+45", name: "Denmark" },
  { code: "FI", flag: "🇫🇮", dialCode: "+358", name: "Finland" },
  { code: "PL", flag: "🇵🇱", dialCode: "+48", name: "Poland" },
  { code: "GR", flag: "🇬🇷", dialCode: "+30", name: "Greece" },
  { code: "PT", flag: "🇵🇹", dialCode: "+351", name: "Portugal" },
  { code: "IE", flag: "🇮🇪", dialCode: "+353", name: "Ireland" },
  { code: "NZ", flag: "🇳🇿", dialCode: "+64", name: "New Zealand" },
  { code: "ZA", flag: "🇿🇦", dialCode: "+27", name: "South Africa" },
  { code: "AR", flag: "🇦🇷", dialCode: "+54", name: "Argentina" },
  { code: "CL", flag: "🇨🇱", dialCode: "+56", name: "Chile" },
  { code: "CO", flag: "🇨🇴", dialCode: "+57", name: "Colombia" },
  { code: "PE", flag: "🇵🇪", dialCode: "+51", name: "Peru" },
  { code: "VE", flag: "🇻🇪", dialCode: "+58", name: "Venezuela" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export default function PhoneInput({ value, onChange, className = "", required = false }: PhoneInputProps) {
  // Parse existing value to extract country code if present
  const getInitialCountry = () => {
    if (value) {
      const matchedCountry = countries.find((country) => value?.startsWith(country.dialCode));
      if (matchedCountry) {
        return matchedCountry;
      }
    }
    return countries[0]; // Default to Egypt
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getInitialCountry());

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // Extract current number without any country code
      const currentNumber = value.replace(/^\+?\d+\s*/, "").trim();
      onChange(`${country.dialCode} ${currentNumber}`.trim());
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only keep digits and spaces, no country code in the input
    const numberOnly = inputValue.replace(/[^\d\s]/g, "");
    // Combine country code with number
    const fullNumber = `${selectedCountry.dialCode} ${numberOnly}`.trim();
    onChange(fullNumber);
  };

  // Extract number without country code for display
  const displayNumber = value?.startsWith(selectedCountry.dialCode) 
    ? value.replace(selectedCountry.dialCode, "").trim()
    : value.replace(/^\+?\d+\s*/, "").trim();

  return (
    <div className="flex gap-2">
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger className={`w-[140px] shrink-0 ${className.includes("bg-") ? className : "bg-white/10 border-white/20 text-white"}`}>
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span className="text-xs">{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {(countries || []).map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-muted-foreground">{country.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={displayNumber}
        onChange={handleNumberChange}
        placeholder="123 456 7890"
        className={`flex-1 ${className}`}
        required={required}
      />
    </div>
  );
}

