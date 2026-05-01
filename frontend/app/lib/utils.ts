export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const decimals = 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  // Calculate the index based on the logarithm of the bytes
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Divide the bytes by the appropriate power of 1024 and format it
  const formattedValue = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${formattedValue} ${sizes[i]}`;
};

export const generateUUID = () => crypto.randomUUID();

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}