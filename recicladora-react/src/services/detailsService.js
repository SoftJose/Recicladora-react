import { apiFetch } from "./api.js";
import { detailsMapper } from "../interfaces/transactionDetailsModel.js";


const BASE_URL = "/v1/detalles_facturas";

export const DetailsService = {
    // Listar Detalles
    async findAllDetails() {
        const data = await apiFetch(`${BASE_URL}/`);
        return (data || []).map(detailsMapper.fromBackend);
    },

};
