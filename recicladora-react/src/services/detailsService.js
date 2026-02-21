import {apiFetch} from "./api.js";

export const DetailsService= {

    findAllDetails: () => apiFetch("/"),

    findByIdDetails: (idDetails) => apiFetch(`${idDetails}`),

    exportPdfDetails: (idDetails) => apiFetch(`${idDetails}`),

    create: (details) => apiFetch("/guardar",{method: "POST",
        body: JSON.stringify(details)})
}