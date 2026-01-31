import { barcelona } from './barcelona';
import { tokyo } from './tokyo';
import { paris } from './paris';
import { newYork } from './new-york';
import { mexicoCity } from './mexico-city';
import { santiago } from './santiago';
import { CityData } from './types';

export const cities: Record<string, CityData> = {
  barcelona,
  tokyo,
  paris,
  'new-york': newYork,
  'mexico-city': mexicoCity,
  santiago
};

export const getCityById = (id: string): CityData | undefined => {
  return cities[id];
};

export const getAllCities = (): CityData[] => {
  return Object.values(cities);
};

export * from './types';
