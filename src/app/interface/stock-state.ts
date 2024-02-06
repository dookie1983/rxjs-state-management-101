import { Stock } from "./stock";

export interface StockState {
  limit: number;
  offset: number;
  stocks: Stock[];
}