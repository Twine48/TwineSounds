import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function generateReceiptNumber(): string {
  const prefix = 'RCP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateLoan(
  principal: number,
  interestRate: number,
  interestType: 'flat' | 'reducing',
  numberOfInstallments: number
) {
  let totalInterest: number;

  if (interestType === 'flat') {
    totalInterest = (principal * interestRate * numberOfInstallments) / 100;
  } else {
    let balance = principal;
    totalInterest = 0;
    const baseInstallment = principal / numberOfInstallments;
    for (let i = 0; i < numberOfInstallments; i++) {
      totalInterest += (balance * interestRate) / 100;
      balance -= baseInstallment;
    }
  }

  const totalPayable = principal + totalInterest;
  const installmentAmount = Math.ceil(totalPayable / numberOfInstallments);

  return { totalInterest, totalPayable, installmentAmount };
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    defaulted: 'bg-red-500/10 text-red-400 border-red-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    partial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    held: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    released: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    forfeited: 'bg-red-500/10 text-red-400 border-red-500/20',
    blacklisted: 'bg-red-500/10 text-red-400 border-red-500/20',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
