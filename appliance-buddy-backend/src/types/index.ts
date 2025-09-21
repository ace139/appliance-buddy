export interface ApplianceFilters {
  search?: string;
  brand?: string;
  warrantyStatus?: string;
  page: number;
  limit: number;
}

export interface MaintenanceFilters {
  applianceId?: string;
  status?: string;
  dueSoon?: boolean;
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expired';

export interface WarrantyInfo {
  status: WarrantyStatus;
  daysRemaining: number;
  expirationDate: Date;
}