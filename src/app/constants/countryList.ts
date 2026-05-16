import * as countryCodes from "country-codes-list";

export const getCountries = () => {
    const myCountryCodesObject = countryCodes.customList(
        "countryNameEn",
        "{countryCode}:+{countryCallingCode}"
    );

    const countryName = Object.keys(myCountryCodesObject).sort((a, b) => a.localeCompare(b));
    const countrycode = Object.values(myCountryCodesObject).map(code => code.split(":"))

    return { countryName, countrycode };
}
