import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 2) return accountNumber;
  const lastTwo = accountNumber.slice(-2);
  const masked = '*'.repeat(Math.max(0, accountNumber.length - 2));
  return masked + lastTwo;
}
