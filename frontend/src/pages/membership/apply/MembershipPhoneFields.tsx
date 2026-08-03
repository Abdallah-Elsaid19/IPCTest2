import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import "flag-icons/css/flag-icons.min.css";

import { countriesByIso2, phoneCountries } from "@/features/bursary/countries";

interface MembershipPhoneFieldsProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

function CountryFlag({ iso2 }: { iso2: CountryCode }) {
  return (
    <span
      className={`fi fi-${iso2.toLowerCase()} shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]`}
      aria-hidden="true"
    />
  );
}

function splitInternationalNumber(value: string) {
  const phone = parsePhoneNumberFromString(value);
  return phone?.country
    ? { iso2: phone.country, national: phone.formatNational() }
    : { iso2: "" as const, national: "" };
}

export default function MembershipPhoneFields({ value, error, onChange }: MembershipPhoneFieldsProps) {
  const initial = splitInternationalNumber(value);
  const [iso2, setIso2] = useState<CountryCode | "">(initial.iso2);
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastEmittedValue = useRef(value);
  const syncingExternalValue = useRef(false);
  const selected = iso2 ? countriesByIso2.get(iso2) : undefined;

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return phoneCountries;
    return phoneCountries.filter((country) =>
      country.name.toLowerCase().includes(query)
      || country.iso2.toLowerCase().includes(query)
      || country.dialCode.includes(query),
    );
  }, [search]);

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  useEffect(() => {
    if (value === lastEmittedValue.current) return;
    const restored = splitInternationalNumber(value);
    syncingExternalValue.current = true;
    setIso2(restored.iso2);
    setNational(restored.national);
    lastEmittedValue.current = value;
  }, [value]);

  useEffect(() => {
    if (syncingExternalValue.current) {
      syncingExternalValue.current = false;
      return;
    }
    if (!iso2 || !national.trim()) {
      if (lastEmittedValue.current) {
        lastEmittedValue.current = "";
        onChange("");
      }
      return;
    }

    const phone = parsePhoneNumberFromString(national, iso2);
    const internationalValue = phone?.country === iso2 && phone.isPossible() ? phone.number : "";
    if (internationalValue !== lastEmittedValue.current) {
      lastEmittedValue.current = internationalValue;
      onChange(internationalValue);
    }
  }, [iso2, national, onChange]);

  const selectCountry = (country: (typeof phoneCountries)[number]) => {
    setIso2(country.iso2);
    setOpen(false);
    setSearch("");
  };

  const normaliseInternationalInput = () => {
    if (!national.trim().startsWith("+")) return;
    const phone = parsePhoneNumberFromString(national);
    if (!phone?.country || !phone.isPossible()) return;
    setIso2(phone.country);
    setNational(phone.formatNational());
  };

  return (
    <div className="md:col-span-2">
      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div ref={wrapperRef} className="relative min-w-0 w-full">
          <label htmlFor="membership-phone-country-selector" className="mb-2 block text-sm font-medium text-background-950">
            Country calling code <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <label htmlFor="membership-phone-country-search" className="sr-only">Search country calling code</label>
          <button
            id="membership-phone-country-selector"
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`flex min-h-12 w-full items-center justify-between gap-3 border bg-background-50 px-4 py-3 text-left text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${error && !iso2 ? "border-red-500" : "border-background-300"}`}
          >
            {selected ? (
              <span className="flex min-w-0 items-center gap-2.5">
                <CountryFlag iso2={selected.iso2} />
                <span className="min-w-0 truncate">{selected.name}</span>
                <strong className="shrink-0">{selected.dialCode}</strong>
              </span>
            ) : <span className="text-foreground-500">Select country calling code</span>}
            <ChevronDown size={17} className="shrink-0" />
          </button>

          {open && (
            <div className="absolute z-40 mt-2 w-full min-w-0 max-w-[calc(100vw-2rem)] overflow-hidden border border-background-300 bg-white shadow-xl sm:min-w-[18rem]">
              <input
                id="membership-phone-country-search"
                type="search"
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search country or code"
                aria-controls="membership-phone-country-list"
                className="min-h-12 w-full border-b border-background-200 px-4 text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/30"
              />
              <ul id="membership-phone-country-list" role="listbox" className="max-h-64 overflow-y-auto p-1">
                {filteredCountries.map((country) => (
                  <li key={country.iso2} role="option" aria-selected={country.iso2 === iso2}>
                    <button
                      type="button"
                      onClick={() => selectCountry(country)}
                      className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                    >
                      <CountryFlag iso2={country.iso2} />
                      <span className="min-w-0 flex-1 truncate">{country.name}</span>
                      <strong>{country.dialCode}</strong>
                    </button>
                  </li>
                ))}
                {!filteredCountries.length && <li className="px-3 py-6 text-center text-sm text-foreground-500">No country found.</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <label htmlFor="membership-phone-national" className="mb-2 block text-sm font-medium text-background-950">
            Telephone number <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="membership-phone-national"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={national}
            onChange={(event) => setNational(event.target.value.replace(/[^\d+().\s-]/g, ""))}
            onBlur={normaliseInternationalInput}
            aria-invalid={Boolean(error)}
            aria-describedby="membership-phone-help"
            className={`min-h-12 w-full border bg-background-50 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 ${error ? "border-red-500" : "border-background-300"}`}
          />
          <p id="membership-phone-help" className={`mt-1.5 text-xs ${error ? "text-red-700" : "text-foreground-500"}`}>
            {error || "Enter the national number. You may also paste a full international number."}
          </p>
        </div>
      </div>

      {!error && value && (
        <p className="mt-2 text-xs text-emerald-700">International format: {value}</p>
      )}
    </div>
  );
}
