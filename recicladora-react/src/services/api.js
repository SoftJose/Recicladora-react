const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Variable para controlar si hay un refresh en progreso
 * Evita múltiples refresh simultáneos
 */
let isRefreshing = false
let refreshSubscribers = []

/**
 * Agrega un callback a la cola de suscriptores del refresh
 */
const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb)
};

/**
 * Notifica a todos los suscriptores con el nuevo token
 */
const onTokenRefreshed = (token) => {
    refreshSubscribers.forEach(cb => cb(token))
    refreshSubscribers = []
};
/**
 * Limpia todos los datos de autenticación
 */
const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};

/**
 * Función principal para hacer peticiones a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<any>} Respuesta de la API
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("accessToken")

    const config = {
        ...options,
        // IMPORTANTE: no usamos cookies en este proyecto (refreshToken viene en JSON)
        // credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
    }

    const url = `${API_URL}${endpoint}`

    try {
        const response = await fetch(url, config)

        if (response.ok) {
            if (response.status === 204) return null
            return await response.json()
        }

        const isAuthEndpoint = endpoint.includes("/login") || endpoint.includes("/refresh")

        if (response.status === 401 && !isAuthEndpoint) {
            return await handleUnauthorized(endpoint, options)
        }

        throw new Error(`Error ${response.status}`)
    } catch (err) {
        console.error("API error:", err)
        throw err
    }
}
/**
 * Variante para endpoints que devuelven texto plano (text/plain)
 */
export const apiFetchText = async (endpoint, options = {}) => {
    const token = localStorage.getItem("accessToken");

    const config = {
        // credentials: "include",
        ...options,
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 204) return "";

        if (response.ok) {
            return await response.text();
        }

        const isAuthEndpoint = endpoint.includes("/login") || endpoint.includes("/refresh")

        if (response.status === 401 && !isAuthEndpoint) {
            await handleUnauthorized(endpoint, options);
            const retry = await fetch(`${API_URL}${endpoint}`, {
                ...config,
                headers: {
                    ...(localStorage.getItem("accessToken") && { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }),
                    ...(options.headers || {}),
                }
            });
            if (retry.ok) return await retry.text();
            await handleApiError(retry);
        }

        await handleApiError(response);
    } catch (error) {
        console.error("Error en petición API (text):", error);
        throw error;
    }
};

/**
 * Maneja errores de la API y lanza excepciones apropiadas
 */
const handleApiError = async (response) => {
    let errorMessage = "Error en la petición";

    // Si no hay body (ej. Spring Security devuelve 401 con Content-Length: 0)
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
        // Mensajes por defecto según el status
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

        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
    }

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
    const refreshToken = localStorage.getItem("refreshToken")

    // Si no hay refreshToken, no intentamos refrescar (evita bucles)
    if (!refreshToken) {
        clearAuthData()
        onTokenRefreshed(null)
        const err = new Error("Sesión expirada")
        err.code = "SESSION_EXPIRED"
        throw err
    }

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            subscribeTokenRefresh((newToken) => {
                if (!newToken) {
                    const err = new Error("Sesión expirada")
                    err.code = "SESSION_EXPIRED"
                    reject(err)
                    return
                }

                originalOptions.headers = {
                    ...(originalOptions.headers || {}),
                    Authorization: `Bearer ${newToken}`,
                }

                resolve(apiFetch(endpoint, originalOptions))
            })
        })
    }

    isRefreshing = true

    try {
        const response = await fetch(`${API_URL}/v1/trabajadores/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        })

        if (!response.ok) throw new Error("Refresh falló")

        const data = await response.json()
        const newToken = data.accessToken || data.token

        if (!newToken) throw new Error("Refresh falló")

        localStorage.setItem("accessToken", newToken)
        onTokenRefreshed(newToken)

        originalOptions.headers = {
            ...(originalOptions.headers || {}),
            Authorization: `Bearer ${newToken}`,
        }

        return await apiFetch(endpoint, originalOptions)
    } catch (err) {
        clearAuthData()
        onTokenRefreshed(null)
        const e = new Error("Sesión expirada")
        e.code = "SESSION_EXPIRED"
        throw e
    } finally {
        isRefreshing = false
    }
}


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
