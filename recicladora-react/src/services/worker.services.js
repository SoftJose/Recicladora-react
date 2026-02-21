import { apiFetch } from "./api.js";

export const WorkerServices = {
    findAllWorkers: () =>
        apiFetch("/v1/trabajadores/"),

    findByIdWorker: (idWorker) =>
        apiFetch(`/v1/trabajadores/${idWorker}`),

    createWorker: (worker) =>
        apiFetch("/v1/trabajadores/guardar", {
            method: "POST",
            body: JSON.stringify(worker),
        }),

    updateWorker: (idWorker, worker) =>
        apiFetch(`/v1/trabajadores/editar/${idWorker}`, {
            method: "PUT",
            body: JSON.stringify(worker),
        }),

    remove: (id) =>
        apiFetch(`/v1/trabajadores/eliminar/${id}`, {
            method: "DELETE",
        }),
};
