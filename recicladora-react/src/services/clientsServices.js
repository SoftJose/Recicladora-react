import {apiFetch} from "./api.js";
import {PersonMapper} from "../interfaces/personModel.js";

const BASE_URL = "/v1/clientes";

export const ClientService = {

    // Listar Clientes/Personas
    findAllClients: async () => {
        const response = await apiFetch(`${BASE_URL}/`);
        return Array.isArray(response)
            ? response.map(dto => PersonMapper.fromBackend(dto))
            : [];
    },

   
    // Guardar Clientes/Personas
    createClient: (client) => {
        const payload = PersonMapper.toBackend(client);
        return apiFetch(`${BASE_URL}/guardar`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
};