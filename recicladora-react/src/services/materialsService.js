import { apiFetch, apiFetchText } from "./api.js";
import { MaterialMapper } from "../interfaces/materialsModel.js";

const BASE_URL = "/v1/materiales";


export const materialsService = {

    // Listar todos
    async findAllMaterials() {
        const data = await apiFetch(`${BASE_URL}/`);
        return (data || []).map(MaterialMapper.fromBackend);
    },

    // Buscar por ID
    async findMaterialById(id) {
        const data = await apiFetch(`${BASE_URL}/${id}`);
        return MaterialMapper.fromBackend(data);
    },

    // Generar código (text/plain)
    async generatedCode(lote) {
        return await apiFetchText(`${BASE_URL}/generar_codigo?lote=${lote}`);
    },


    generateCodeMaterial(lote) {
        return this.generatedCode(lote);
    },



    // Crear
    createMaterial(material) {
        return apiFetch(`${BASE_URL}/guardar`, {
            method: "POST",
            body: JSON.stringify(MaterialMapper.toBackend(material)),
        });
    },

    // Actualizar
    updateMaterial(materialId, material) {
        return apiFetch(`${BASE_URL}/editar/${materialId}`, {
            method: "PUT",
            body: JSON.stringify(MaterialMapper.toBackend(material)),
        });
    },

    // Eliminar
    remove(id) {
        return apiFetch(`${BASE_URL}/eliminar/${id}`, {
            method: "DELETE",
        });
    },
};
