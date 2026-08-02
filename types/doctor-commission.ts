export type CommissionType = "percentage" | "fixed";

export interface DoctorCommission {
  id: string;

  doctorId: string;

  /**
   * Category or Department
   * Example:
   * Laser
   * Dermatology
   * Nutrition
   */
  serviceCategoryId: string;

  commissionType: CommissionType;

  /**
   * before target
   */
  commissionValue: number;

  /**
   * optional monthly target
   * Example 7500
   */
  targetAmount: number | null;

  /**
   * commission after reaching target
   */
  targetCommissionValue: number | null;

  createdAt: string;
}

export interface CreateDoctorCommissionInput {
  doctorId: string;
  serviceCategoryId: string;
  commissionType: CommissionType;
  commissionValue: number;
  targetAmount?: number | null;
  targetCommissionValue?: number | null;
}

export interface UpdateDoctorCommissionInput
  extends Partial<CreateDoctorCommissionInput> {}