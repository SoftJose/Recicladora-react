import {apiFetch} from "./api.js";

export const ClientService= {

    findAllClients:() => apiFetch("/"),

    findByIdClient:(clientsId) => apiFetch(`${clientsId}`),

    createClient:(client) => apiFetch("/guardar",{method: "POST",
        body: JSON.stringify(client),}),

    exportPdf:(pdf) => apiFetch(`${pdf}`),



}