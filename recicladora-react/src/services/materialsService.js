import { apiFetch, apiFetchText } from "./api.js";
import { MaterialMapper } from "../interfaces/materialsModel.js";

const BASE_URL = "/v1/materiales";

const buildQuery = (params) => {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        const s = String(v).trim();
        if (!s) return;
        sp.set(k, s);
    });
    const qs = sp.toString();
    return qs ? `?${qs}` : "";
};

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

export const materialsService = {

    // 📌 Listar todos
    async findAllMaterials() {
        const data = await apiFetch(`${BASE_URL}/`);
        return (data || []).map(MaterialMapper.fromBackend);
    },

    // 📌 Buscar por ID
    async findMaterialById(id) {
        const data = await apiFetch(`${BASE_URL}/${id}`);
        return MaterialMapper.fromBackend(data);
    },

    // 📌 Generar código (text/plain)
    async generatedCode() {
        return await apiFetchText(`${BASE_URL}/generar_codigo`);
    },

    // Alias (por si ya lo usas en otras partes)
    generateCodeMaterial() {
        return this.generatedCode();
    },

    // 📌 Buscar por ubicación
    async getLocationMaterial(location) {
        const data = await apiFetch(`${BASE_URL}/buscar_ubicacion/${location}`);
        return (data || []).map(MaterialMapper.fromBackend);
    },

    // 📌 Crear
    createMaterial(material) {
        return apiFetch(`${BASE_URL}/guardar`, {
            method: "POST",
            body: JSON.stringify(MaterialMapper.toBackend(material)),
        });
    },

    // 📌 Actualizar
    updateMaterial(materialId, material) {
        return apiFetch(`${BASE_URL}/editar/${materialId}`, {
            method: "PUT",
            body: JSON.stringify(MaterialMapper.toBackend(material)),
        });
    },

    // 📌 Eliminar
    remove(id) {
        return apiFetch(`${BASE_URL}/eliminar/${id}`, {
            method: "DELETE",
        });
    },

    // 📌 Exportaciones (si el backend las expone así)
    exportToPdf(pdfPath) {
        return apiFetch(`${BASE_URL}${pdfPath}`);
    },

    exportToPdfByLote(lote) {
        return apiFetch(`${BASE_URL}/lote/${lote}`);
    },

    // 📌 Descargar Reporte PDF
    async downloadReportPdf({ location, lote } = {}) {
        const token = localStorage.getItem("accessToken");
        const qs = buildQuery({ location, lote });
        const res = await fetch(`http://localhost:8080/api${BASE_URL}/reporte/pdf${qs}`, {
            method: "GET",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `No se pudo generar el PDF (HTTP ${res.status})`);
        }

        const blob = await res.blob();

        const parts = ["reporte-materiales"];
        if (location) parts.push(`ubicacion-${String(location).trim()}`);
        if (lote) parts.push(`lote-${String(lote).trim()}`);
        const filename = `${parts.join("-")}.pdf`;

        downloadBlob(blob, filename);
        return true;
    },
};
