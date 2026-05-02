export type BookingSel = {
  stableId?: string;
  date?: Date;
  party: number;
  slot?: string;
  horseId?: string;
};

let _sel: BookingSel | null = null;

export const setBookingSel = (sel: BookingSel) => { _sel = sel; };
export const getBookingSel = () => _sel;
export const clearBookingSel = () => { _sel = null; };
