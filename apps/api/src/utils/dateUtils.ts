import { addMonths, differenceInDays, isBefore, isAfter } from 'date-fns';
import { WarrantyStatus, WarrantyInfo } from '../types';

export const calculateWarrantyStatus = (purchaseDate: Date, warrantyDurationMonths: number): WarrantyInfo => {
  const expirationDate = addMonths(purchaseDate, warrantyDurationMonths);
  const today = new Date();
  const daysRemaining = differenceInDays(expirationDate, today);

  let status: WarrantyStatus;
  if (isBefore(expirationDate, today)) {
    status = 'Expired';
  } else if (daysRemaining <= 30) {
    status = 'Expiring Soon';
  } else {
    status = 'Active';
  }

  return {
    status,
    daysRemaining: Math.max(0, daysRemaining),
    expirationDate,
  };
};

export const getMaintenanceStatus = (scheduledDate: Date, completedDate?: Date): string => {
  if (completedDate) {
    return 'Completed';
  }

  const today = new Date();
  if (isBefore(scheduledDate, today)) {
    return 'Overdue';
  }

  return 'Upcoming';
};