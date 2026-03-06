import {apiFetch} from "./api.js";

const BASE_URL = "/v1/clientes";

export const ClientService = {

    findAllClients: () => apiFetch(`${BASE_URL}/`),

    findByIdClient: (clientsId) =>
        apiFetch(`${BASE_URL}/${clientsId}`),

    createClient: (client) =>
        apiFetch(`${BASE_URL}/guardar`, {
            method: "POST",
            body: JSON.stringify(client),
        }),
};