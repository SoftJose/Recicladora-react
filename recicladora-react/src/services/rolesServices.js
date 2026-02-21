import {apiFetch} from "./api.js";

export const rolesServices = {

    findAllRoles: () => apiFetch("/"),

    findByIdRoles: (id) => apiFetch(`/${id}`),

    createRoles: (role) => apiFetch("/guardar",{method: "POST",
        body: JSON.stringify(role),}),

    updateRoles: (roleId,role) => apiFetch(`/editar/${roleId},${role}`,{method: "PUT",
        body: JSON.stringify(role),}),

    remove: (id) =>
        apiFetch(`/eliminar/${id}`, {
            method: "DELETE",
        }),
}