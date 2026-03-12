export type CreateCycleInput = {
  model: string;
  price: number;
  location: string;
  available?: boolean;
  image?: string;
  shopkeeperId: number;
};