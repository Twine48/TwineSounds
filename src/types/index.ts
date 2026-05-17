export type UserRole = 'admin' | 'manager' | 'cashier' | 'loan_officer' | 'field_collector';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Borrower {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  altPhone?: string;
  nationalId: string;
  address: string;
  city?: string;
  passportPhoto?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorRelation?: string;
  employerName?: string;
  employerAddress?: string;
  monthlyIncome?: number;
  notes?: string;
  status: 'active' | 'blacklisted' | 'inactive';
  totalLoans: number;
  activeLoans: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type RepaymentFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type LoanStatus = 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'rejected';

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  interestType: 'flat' | 'reducing';
  totalPayable: number;
  totalPaid: number;
  balance: number;
  repaymentFrequency: RepaymentFrequency;
  numberOfInstallments: number;
  installmentAmount: number;
  disbursementDate: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  penaltyRate: number;
  totalPenalty: number;
  collateralIds: string[];
  loanOfficerId: string;
  loanOfficerName: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: string;
  loanId: string;
  borrowerId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  penalty: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue';
  paidDate?: string;
  collectedBy?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  installmentId?: string;
  amount: number;
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'cheque';
  reference?: string;
  collectedBy: string;
  collectorName: string;
  notes?: string;
  receiptNumber: string;
  createdAt: string;
}

export type CollateralType = 'land_title' | 'motorcycle' | 'phone' | 'electronics' | 'vehicle' | 'jewelry' | 'other';

export interface Collateral {
  id: string;
  borrowerId: string;
  borrowerName: string;
  loanId?: string;
  type: CollateralType;
  description: string;
  serialNumber?: string;
  estimatedValue: number;
  photos: string[];
  storageLocation?: string;
  status: 'held' | 'released' | 'forfeited';
  receivedDate: string;
  releasedDate?: string;
  receivedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBorrowers: number;
  activeLoans: number;
  totalDisbursed: number;
  totalCollected: number;
  overdueLoans: number;
  overdueAmount: number;
  todayCollections: number;
  expectedToday: number;
  collateralHeld: number;
  activeStaff: number;
}

export interface CollectionSummary {
  date: string;
  expected: number;
  collected: number;
  shortfall: number;
}
