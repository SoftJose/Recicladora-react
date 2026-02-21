import {apiFetch} from "./api.js";

export const InvoicesService= {
    findAllInvoices: () => apiFetch("/"),

    findInvoiceById: (idInvoice) => apiFetch(`/${idInvoice}`),
    createInvoice: (invoice) => apiFetch("/guardar",{method: "POST",
    body: JSON.stringify(invoice)}),

    updateInvoice: (idInvoice,invoice) => apiFetch(`/editar/${idInvoice},${invoice}`,{method: "PUT",
        body: JSON.stringify(idInvoice,invoice),}),

    remove: (id) =>
        apiFetch(`/eliminar/${id}`, {
            method: "DELETE",
        }),


}