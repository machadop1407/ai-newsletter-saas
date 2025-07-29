export interface Plan {
  id: "month" | "year";
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  priceId: string;
}

export const availablePlans: Plan[] = [
  {
    id: "month",
    name: "Monthly Plan",
    price: 9.99,
    currency: "USD",
    interval: "month",
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
  },
  {
    id: "year",
    name: "Yearly Plan",
    price: 99.99,
    currency: "USD",
    interval: "year",
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
  },
];

const priceIdMap: Record<Plan["id"], string> = {
  month: process.env.STRIPE_MONTHLY_PRICE_ID!,
  year: process.env.STRIPE_YEARLY_PRICE_ID!,
};

export const getPriceIdFromType = (planType: Plan["id"]) =>
  priceIdMap[planType];
