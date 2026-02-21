/**
 * Utilidades para debuggear problemas de autenticación
 * Puedes usar estas funciones en la consola del navegador
 */

export let debugAuth = {
    // Mostrar todo el estado de autenticación
    checkAuthState() {
        console.log("🔍 Estado de Autenticación:");
        console.log("AccessToken:", localStorage.getItem("accessToken"));
        console.log("RefreshToken:", localStorage.getItem("refreshToken"));
        console.log("User:", JSON.parse(localStorage.getItem("user") || "null"));

        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                console.log("Token Payload:", payload);
                console.log("Token Expira:", new Date(payload.exp * 1000));
                console.log("Token Expirado:", payload.exp * 1000 < Date.now());
            } catch (e) {
                console.log("❌ Token inválido:", e.message);
            }
        }
    },

    // Limpiar todo el estado de auth
    clearAuth() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        console.log("✅ Estado de autenticación limpiado");
    },

    // Probar refresh token manualmente
    async testRefresh() {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            console.log("❌ No hay refresh token");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/v1/trabajadores/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            console.log("Respuesta refresh:", response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Refresh exitoso:", data);
                return data;
            } else {
                const error = await response.text();
                console.log("❌ Error en refresh:", error);
            }
        } catch (error) {
            console.log("❌ Error de red:", error);
        }
    },

    // Probar creación de categoría
    async testCreateCategory() {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.log("❌ No hay access token");
            return;
        }

        const testCategory = {
            name: "Categoría Test",
            description: "Categoría de prueba para testing"
        };

        try {
            const response = await fetch("http://localhost:8080/api/v1/categorias/guardar", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(testCategory)
            });

            console.log("Respuesta crear categoría:", response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Categoría creada exitosamente:", data);
                return data;
            } else {
                const error = await response.text();
                console.log("❌ Error al crear categoría:", error);

                if (response.status === 403) {
                    console.log("🔒 Sin permisos. Tu rol ADMIN necesita acceso a crear categorías en el backend");
                }
            }
        } catch (error) {
            console.log("❌ Error de red:", error);
        }
    },

    // Probar una petición autenticada
    async testAuthenticatedRequest() {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.log("❌ No hay access token");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/v1/categorias/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            console.log("Respuesta categorías:", response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Petición exitosa:", data);
                return data;
            } else {
                const error = await response.text();
                console.log("❌ Error en petición:", error);
            }
        } catch (error) {
            console.log("❌ Error de red:", error);
        }
    }
};

// Exponer globalmente para uso en consola
if (typeof window !== 'undefined') {
    window.debugAuth = debugAuth;
}
