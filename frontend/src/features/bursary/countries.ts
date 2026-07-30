import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

export interface PhoneCountry {
  iso2: CountryCode;
  name: string;
  dialCode: string;
}

export const phoneCountries: PhoneCountry[] = getCountries()
  .map((iso2) => ({
    iso2,
    name: displayNames.of(iso2) || iso2,
    dialCode: `+${getCountryCallingCode(iso2)}`,
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

export const countriesByIso2 = new Map(phoneCountries.map((country) => [country.iso2, country]));

export const residentialCountries = phoneCountries.map(({ iso2, name }) => ({ iso2, name }));
