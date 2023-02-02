import { PackageType, Role } from "@prisma/client";
import { z } from "zod";

export const EntityId = z.number().int();

export const AllRoles = z.enum([Role.PARTICIPANT, Role.RECRUITER, Role.ADMIN]);

export const AllPackageTypes = z.enum([
  PackageType.BRONZE,
  PackageType.SILVER,
  PackageType.GOLD,
]);
