import { AuthService } from "../services/auth.services";

// Helpers de permisos UI (frontend) alineados al backend.
export const canCategoryMutate = () => AuthService.hasRole("BODEGA");
export const canMaterialMutate = () => AuthService.hasRole("BODEGA");
export const canClientCreate = () => AuthService.hasRole("VENDEDOR");
export const canClientEdit = () => AuthService.hasRole("VENDEDOR");
export const canTransact = () => AuthService.hasRole("VENDEDOR");

const Permissions = {
  canCategoryMutate,
  canMaterialMutate,
  canClientCreate,
  canClientEdit,
  canTransact,
};

export default Permissions;
