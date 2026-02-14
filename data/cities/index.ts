import { barcelona } from './barcelona';
import { tokyo } from './tokyo';
import { paris } from './paris';
import { newYork } from './new-york';
import { mexicoCity } from './mexico-city';
import { santiago } from './santiago';
import { london } from './london';
import { rome } from './rome';
import { bangkok } from './bangkok';
import { istanbul } from './istanbul';
import { dubai } from './dubai';
import { lisbon } from './lisbon';
import { amsterdam } from './amsterdam';
import { prague } from './prague';
import { berlin } from './berlin';
import { buenosAires } from './buenos-aires';
import { singapore } from './singapore';
import { seoul } from './seoul';
import { marrakech } from './marrakech';
import { lima } from './lima';
import { bogota } from './bogota';
import { CityData } from './types';

export const cities: Record<string, CityData> = {
  barcelona,
  tokyo,
  paris,
  'new-york': newYork,
  'mexico-city': mexicoCity,
  santiago,
  london,
  rome,
  bangkok,
  istanbul,
  dubai,
  lisbon,
  amsterdam,
  prague,
  berlin,
  'buenos-aires': buenosAires,
  singapore,
  seoul,
  marrakech,
  lima,
  bogota,
};

export const getCityById = (id: string): CityData | undefined => {
  return cities[id];
};

export const getAllCities = (): CityData[] => {
  return Object.values(cities);
};

export * from './types';
