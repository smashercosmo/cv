const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** `2024-03` → `Mar 2024` */
export function formatYearMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return monthYear.format(new Date(Date.UTC(year!, month! - 1, 1)));
}
