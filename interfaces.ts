import { Inames } from "./GTFS_loader/translation";

export interface Ierror extends Error {
  code?: number;
}

export interface Ibus {
  route_num: number;
  direction: number;
  okayama_stop_time: string;
  delay: number;
  run: boolean;
  license_number: number;
  location: {
    lat: number;
    lon: number;
  };
  stops: {
    first: {
      id: string;
      name: Inames;
      time: string;
    };
    passing?: {
      id?: string;
      name?: Inames;
      time?: string;
      pass_time?: string;
    };
    next?: {
      id?: string;
      name?: Inames;
      time?: string;
    };
    last: {
      id: string;
      name: Inames;
      time: string;
    };
  };
}
