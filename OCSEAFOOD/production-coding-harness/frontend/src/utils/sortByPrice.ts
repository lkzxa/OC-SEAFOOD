export type PriceSortOrder = "asc" | "desc";

export function sortByPrice<T>(
  items: T[],
  getComparablePrice: (item: T) => number | null,
  order: PriceSortOrder
): T[] {
  const withPrice: { item: T; price: number }[] = [];
  const withoutPrice: T[] = [];

  for (const item of items) {
    const price = getComparablePrice(item);
    if (price === null || price <= 0) withoutPrice.push(item);
    else withPrice.push({ item, price });
  }

  withPrice.sort((a, b) => (order === "asc" ? a.price - b.price : b.price - a.price));

  return [...withPrice.map((x) => x.item), ...withoutPrice];
}
