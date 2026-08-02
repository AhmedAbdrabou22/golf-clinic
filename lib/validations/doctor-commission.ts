import { z } from "zod";

export const createDoctorCommissionSchema = z.object({
  doctorId: z.string().uuid(),

  serviceCategoryId: z.string().uuid(),

  commissionType: z.enum(["percentage", "fixed"]),

  commissionValue: z
    .number({
      required_error: "Commission is required",
    })
    .min(0),

  targetAmount: z
    .number()
    .min(0)
    .nullable()
    .optional(),

  targetCommissionValue: z
    .number()
    .min(0)
    .nullable()
    .optional(),
});

export const updateDoctorCommissionSchema =
  createDoctorCommissionSchema.partial();

export type CreateDoctorCommissionSchema = z.infer<
  typeof createDoctorCommissionSchema
>;

export type UpdateDoctorCommissionSchema = z.infer<
  typeof updateDoctorCommissionSchema
>;