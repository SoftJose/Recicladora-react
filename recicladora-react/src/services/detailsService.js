import { apiFetch } from "./api.js";
import { detailsMapper } from "../interfaces/transactionDetailsModel.js";

// OJO: API_URL en api.js ya incluye `/api`, por eso aquí NO se pone `/api`
const BASE_URL = "/v1/detalles_facturas";

export const DetailsService = {
    // 📌 Listar
    async findAllDetails() {
        const data = await apiFetch(`${BASE_URL}/`);
        return (data || []).map(detailsMapper.fromBackend);
    },

    // 📌 Buscar por ID
    async findByIdDetails(idDetails) {
        const data = await apiFetch(`${BASE_URL}/${idDetails}`);
        return detailsMapper.fromBackend(data);
    },
};
