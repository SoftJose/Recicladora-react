const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Variable para controlar si hay un refresh en progreso
 * Evita múltiples refresh simultáneos
 */
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Agrega un callback a la cola de suscriptores del refresh
 */
const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

/**
 * Notifica a todos los suscriptores con el nuevo token
 */
const onTokenRefreshed = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

/**
 * Función principal para hacer peticiones a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<any>} Respuesta de la API
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("accessToken");

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 204) return null;

        if (response.ok) {
            return await response.json();
        }

        if (response.status === 401 && !endpoint.includes("/auth/") && !endpoint.includes("/login")) {
            return await handleUnauthorized(endpoint, options);
        }

        await handleApiError(response);
    } catch (error) {
        console.error("Error en petición API:", error);
        throw error;
    }
};

/**
 * Maneja errores de la API y lanza excepciones apropiadas
 */
const handleApiError = async (response) => {
    let errorMessage = "Error en la petición";

    try {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
        } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
        }
    } catch (parseError) {
        console.error("Error al parsear respuesta de error:", parseError);
    }

    // Si el mensaje está vacío, usar mensajes por defecto según el status
    if (!errorMessage || errorMessage.trim() === "") {
        switch (response.status) {
            case 400:
                errorMessage = "Datos inválidos. Verifica la información enviada.";
                break;
            case 401:
                errorMessage = "Credenciales inválidas. Usuario o contraseña incorrectos.";
                break;
            case 403:
                errorMessage = "No tienes permisos para realizar esta acción.";
                break;
            case 404:
                errorMessage = "Recurso no encontrado.";
                break;
            case 409:
                errorMessage = "Conflicto. El recurso ya existe.";
                break;
            case 500:
                errorMessage = "Error interno del servidor. Intenta más tarde.";
                break;
            default:
                errorMessage = `Error ${response.status}: ${response.statusText || "Error desconocido"}`;
        }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.statusText = response.statusText;

    throw error;
};

/**
 * Maneja errores 401 intentando refrescar el token
 */
const handleUnauthorized = async (endpoint, originalOptions) => {
    const refreshToken = localStorage.getItem("refreshToken");

    console.log("🔄 Manejando 401 - endpoint:", endpoint);
    console.log("🔄 RefreshToken disponible:", !!refreshToken);

    if (!refreshToken) {
        console.log("❌ No hay refresh token disponible");
        clearAuthData();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    // Si ya hay refresh en progreso, esperar
    if (isRefreshing) {
        console.log("⏳ Refresh en progreso, esperando...");
        return new Promise((resolve, reject) => {
            subscribeTokenRefresh((newToken) => {
                if (!newToken) {
                    reject(new Error("No se pudo refrescar el token"));
                    return;
                }

                originalOptions.headers = {
                    ...(originalOptions.headers || {}),
                    Authorization: `Bearer ${newToken}`,
                };

                resolve(apiFetch(endpoint, originalOptions));
            });
        });
    }

    isRefreshing = true;
    console.log("🔄 Iniciando refresh token...");

    try {
        const response = await fetch(`${API_URL}/v1/trabajadores/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        console.log("🔄 Respuesta del refresh:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.log("❌ Error en refresh:", errorText);
            throw new Error("Refresh token inválido");
        }

        const data = await response.json();
        console.log("✅ Datos del refresh recibidos:", data);

        const newToken = data.token || data.accessToken;

        if (!newToken) {
            console.log("❌ Token no recibido en la respuesta");
            throw new Error("Token no recibido en la respuesta");
        }

        localStorage.setItem("accessToken", newToken);
        console.log("✅ Nuevo token guardado");

        onTokenRefreshed(newToken);

        originalOptions.headers = {
            ...(originalOptions.headers || {}),
            Authorization: `Bearer ${newToken}`,
        };

        console.log("🔄 Reintentando petición original...");
        return await apiFetch(endpoint, originalOptions);
    } catch (error) {
        console.error("❌ Error al refrescar token:", error);
        clearAuthData();
        onTokenRefreshed(null);
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    } finally {
        isRefreshing = false;
        console.log("🔄 Refresh process terminado");
    }
};

/**
 * Limpia todos los datos de autenticación
 */
const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
};

/**
 * Métodos HTTP específicos para mayor comodidad
 */
export const apiGet = (endpoint, options = {}) => {
    return apiFetch(endpoint, { ...options, method: "GET" });
};

export const apiPost = (endpoint, data, options = {}) => {
    return apiFetch(endpoint, {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const apiPut = (endpoint, data, options = {}) => {
    return apiFetch(endpoint, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const apiPatch = (endpoint, data, options = {}) => {
    return apiFetch(endpoint, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

export const apiDelete = (endpoint, options = {}) => {
    return apiFetch(endpoint, { ...options, method: "DELETE" });
};
