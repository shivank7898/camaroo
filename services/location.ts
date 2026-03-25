import { apiRequest } from "./api";

export interface LocationItem {
  id?: string;
  name: string;
  isoCode?: string;
  countryCode?: string;
  stateCode?: string;
  [key: string]: any;
}

export const getCountries = async (): Promise<any> => {
  return await apiRequest<any>({ url: "/auth/get-countries", method: "GET" });
};

export const getStates = async (countryCode: string): Promise<any> => {
  return await apiRequest<any>({ url: `/auth/get-states?countryCode=${countryCode}`, method: "GET" });
};

export const getCities = async (countryCode: string, stateCode: string): Promise<any> => {
  return await apiRequest<any>({ url: `/auth/get-cities?countryCode=${countryCode}&stateCode=${stateCode}`, method: "GET" });
};
