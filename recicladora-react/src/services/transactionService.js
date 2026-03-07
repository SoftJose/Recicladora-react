import {apiFetch, apiFetchText} from "./api.js";
import { transactionMapper } from "../interfaces/transactionModel.js";

const BASE_URL = "/v1/transacciones";

export const transactionService = {

    async findAllInvoices() {
        const data = await apiFetch(`${BASE_URL}/`);
        return (data || []).map(transactionMapper.fromBackend);
    },

    async findInvoiceById(id) {
         return await apiFetch(`${BASE_URL}/${id}`);
    },

    createInvoice(invoice) {
        return apiFetch(`${BASE_URL}/guardar`, {
            method: "POST",
            body: JSON.stringify(transactionMapper.toBackend(invoice)),
        });
    },

    remove(id) {
        return apiFetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    },

    async generatedCode() {
        return apiFetchText(`${BASE_URL}/generar-codigo`);
    },

    async findAll() {
        return this.findAllInvoices();
    },

};