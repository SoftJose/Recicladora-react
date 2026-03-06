import { useState } from "react";
import { useMaterialsContext } from "../context/Material/useMaterialsContext";
import { materialsService } from "../services/materialsService";
import { MaterialModel } from "../interfaces/materialsModel";
import { alert } from "../utils/alert";

const isEmpty = (v) => v === null || v === undefined || v === "";

const getUserIdFromStorageOrJwt = () => {
    // 1) Preferir el usuario guardado por AuthService (worker)
    try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
            const user = JSON.parse(rawUser);
            const candidate = user?.id ?? user?.workerId ?? user?.usuarioId;
            const n = Number(candidate);
            if (Number.isFinite(n) && n > 0) return n;
        }
    } catch {
        // ignore
    }

    // 2) Fallback: intentar extraer desde JWT (si el backend lo incluyera en claims)
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
        const [, payloadB64] = token.split(".");
        if (!payloadB64) return null;

        const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.codePointAt(0).toString(16)).slice(-2))
                .join("")
        );

        const payload = JSON.parse(json);

        // Ajusta aquí al claim real que tengas en tu JWT
        const id = payload?.userId ?? payload?.usuarioId ?? payload?.id;
        const n = Number(id);
        return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
        return null;
    }
};

export const useMaterialForm = () => {
    const { materials, loadMaterials } = useMaterialsContext();

    const [formData, setFormData] = useState({ ...MaterialModel });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [codeError, setCodeError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const generateMaterialCode = async () => {
        try {
            setCodeError(null);
            const code = await materialsService.generatedCode();
            const normalized = String(code || "").trim();
            setFormData((prev) => ({ ...prev, code: normalized }));
            return normalized;
        } catch (error) {
            console.error(error);
            setFormData((prev) => ({ ...prev, code: "" }));

            if (error?.code === "SESSION_EXPIRED") {
                setCodeError("SESSION_EXPIRED");
                return null;
            }

            setCodeError("NO_CODE");
            alert.error(error.message || "No se pudo generar el código");
            return null;
        }
    };

    const validateForm = () => {
        if (!formData.materialName?.trim()) {
            alert.error("El nombre del material es obligatorio");
            return false;
        }

        if (!formData.description?.trim()) {
            alert.error("La descripción del material es obligatoria");
            return false;
        }

        if (isEmpty(formData.stock) || Number.isNaN(Number(formData.stock))) {
            alert.error("El stock debe ser un número válido");
            return false;
        }

        if (isEmpty(formData.price) || Number.isNaN(Number(formData.price))) {
            alert.error("El precio debe ser un número válido");
            return false;
        }

        return true;
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (codeError === "SESSION_EXPIRED") {
            alert.error("Tu sesión expiró. Por favor vuelve a iniciar sesión.");
            return false;
        }

        const userId = getUserIdFromStorageOrJwt();
        if (!userId) {
            alert.error("Sesión inválida. Vuelve a iniciar sesión.");
            return false;
        }

        if (!validateForm()) return false;

        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                // asegurar tipos
                stock: Number(formData.stock ?? 0),
                price: Number(formData.price ?? 0),
                categoryId: formData.categoryId ? Number(formData.categoryId) : null,
                // clave! inyectar SIEMPRE el usuario logueado
                userId,
            };

            if (isEditing) {
                await materialsService.updateMaterial(payload.id, payload);
                alert.success("Material actualizado con éxito", "Éxito");
            } else {
                await materialsService.createMaterial(payload);
                alert.success("Material creado con éxito", "Éxito");
            }

            await resetForm({ withCode: !isEditing });
            await loadMaterials();
            return true;
        } catch (error) {
            console.error(error);
            alert.error(error.message || "No se pudo realizar la operación");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (material) => {
        setFormData({ ...material });
        setIsEditing(true);
    };

    const deleteMaterial = async (id) => {
        try {
            const result = await alert.confirm(
                "¿Eliminar material?",
                "Esta acción no se puede deshacer"
            );

            if (!result.isConfirmed) return;

            await materialsService.remove(id);
            alert.success("Material eliminado con éxito", "Éxito");
            loadMaterials();
        } catch (error) {
            console.error(error);
            alert.error("No se pudo eliminar el material");
        }
    };

    const resetForm = async (opts) => {
        const options = opts ?? { withCode: true };

        setFormData({ ...MaterialModel });
        setIsEditing(false);
        if (options?.withCode && codeError !== "SESSION_EXPIRED") {
            await generateMaterialCode();
        }
    };

    return {
        materials,
        formData,
        isEditing,
        isSubmitting,

        handleInputChange,
        submitForm,
        startEdit,
        deleteMaterial,
        resetForm,
        setFormData,
        generateMaterialCode,
    };
};
