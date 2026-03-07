import { apiFetch } from "./api.js";
import { CategoryMapper } from "../interfaces/category.js";

const BASE_URL = "/v1/categorias";

export const categoryService = {

    //  Listar todas
    async findAllCategories() {
        const data = await apiFetch(`${BASE_URL}/`);
        return data.map(CategoryMapper.fromBackend);
    },

    // Crear
    createCategory(category) {
        return apiFetch(`${BASE_URL}/guardar`, {
            method: "POST",
            body: JSON.stringify(CategoryMapper.toBackend(category)),
        });
    },

    //  Actualizar
    updateCategory(id, category) {
        return apiFetch(`${BASE_URL}/editar/${id}`, {
            method: "PUT",
            body: JSON.stringify(CategoryMapper.toBackend(category)),
        });
    },

    // Eliminar
    remove(id) {
        return apiFetch(`${BASE_URL}/eliminar/${id}`, {
            method: "DELETE",
        });
    },
};
