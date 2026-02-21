import {apiFetch} from "./api.js";

export const materialsService = {
    findAllMaterials: () => apiFetch("/"),

    findMaterialById: (idMaterial) => apiFetch(`/${idMaterial}`),

    generateCodeMaterial:() => apiFetch(`/generar_codigo`),

    getLocationMaterial:(location) => apiFetch(`/buscar_ubicacion/${location}`),

    createMaterial:(material) => apiFetch("/guardar",{method: "POST",
        body: JSON.stringify(material),}),

    checkUsernameExists: (username) => apiFetch(`/existsMaterial/${username}`),

    updateCategory: (materialId,material) => apiFetch(`/editar/${materialId},${material}`,{method: "PUT",
        body: JSON.stringify(material),}),

    remove: (id) =>
        apiFetch(`/eliminar/${id}`, {
            method: "DELETE",
        }),

    exportToPdf: (pdf) => apiFetch(`${pdf}`),

    exportToPdfByLote: (lote) => apiFetch(`/lote/${lote}`),
}