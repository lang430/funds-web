export function calculateMoney(dwjz: number | null, num: number): number {
  if (dwjz === null) return 0;
  return parseFloat((dwjz * num).toFixed(2));
}

export function calculateGains(
  dwjz: number | null,
  gsz: number | null,
  gszzl: number,
  num: number,
  hasReplace: boolean
): number {
  const n = num || 0;
  if (hasReplace && dwjz !== null) {
    return parseFloat(((dwjz - dwjz / (1 + gszzl * 0.01)) * n).toFixed(2));
  }
  if (gsz !== null && dwjz !== null) {
    return parseFloat(((gsz - dwjz) * n).toFixed(2));
  }
  return 0;
}

export function calculateCostGains(dwjz: number | null, cost: number, num: number): number {
  if (!cost || dwjz === null) return 0;
  return parseFloat(((dwjz - cost) * num).toFixed(2));
}

export function calculateCostGainsRate(dwjz: number | null, cost: number): number {
  if (!cost || cost === 0 || dwjz === null) return 0;
  return parseFloat((((dwjz - cost) / cost) * 100).toFixed(2));
}

export function formatNumber(val: number): string {
  const absNum = Math.abs(val);
  if (absNum < 10) return val.toFixed(2);
  if (absNum < 100) return val.toFixed(1);
  if (absNum < 1000) return val.toFixed(0);
  if (absNum < 10000) return (val / 1000).toFixed(1) + "k";
  if (absNum < 1000000) return (val / 1000).toFixed(0) + "k";
  if (absNum < 10000000) return (val / 1000000).toFixed(1) + "M";
  return (val / 1000000).toFixed(0) + "M";
}

export function isDuringDate(date?: Date): boolean {
  const curDate = date || new Date();
  const day = curDate.getDay();
  if (day === 0 || day === 6) return false;

  const hours = curDate.getHours();
  const minutes = curDate.getMinutes();
  const time = hours * 100 + minutes;

  return (time >= 930 && time <= 1130) || (time >= 1300 && time <= 1505);
}

export function isHoliday(date: Date, holidayData: Record<string, Record<string, { holiday: boolean }>>): boolean {
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const key = `${month}-${day}`;

  const yearData = holidayData[year];
  if (!yearData) return false;

  const dayData = yearData[key];
  return dayData?.holiday === true;
}
