import { apiFetch } from "./api";

/**
 * Claves únicas de almacenamiento
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    USER: "user",
};

export const AuthService = {

    // =========================
    // LOGIN
    // =========================
    async login(credentials) {
        if (!credentials?.username?.trim() || !credentials?.password?.trim()) {
            throw new Error("Usuario y contraseña son requeridos");
        }

        const response = await apiFetch("/v1/trabajadores/login", {
            method: "POST",
            body: JSON.stringify({
                username: credentials.username.trim(),
                password: credentials.password,
            }),
        });

        const { accessToken, refreshToken, worker } = response;

        if (!accessToken || !worker) {
            throw new Error("Respuesta inválida del servidor");
        }

        // 🔐 GUARDAR SESIÓN (AQUÍ VA TODO)
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(worker));

        return {
            token: accessToken,
            user: worker,
            refreshToken,
        };
    },

    // =========================
    // REFRESH TOKEN
    // =========================
    async refreshToken() {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            this.clearAuth();
            throw new Error("No hay refresh token");
        }

        const response = await apiFetch("/v1/trabajadores/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
        });

        const newAccessToken = response.token || response.accessToken;

        if (!newAccessToken) {
            this.clearAuth();
            throw new Error("No se pudo refrescar el token");
        }

        this.setToken(newAccessToken);
        return newAccessToken;
    },

    // =========================
    // LOGOUT
    // =========================
    logout() {
        this.clearAuth();
    },

    // =========================
    // STORAGE HELPERS
    // =========================
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    setToken(token) {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        }
    },

    // Agregado: establece el refresh token para uso desde AuthProvider
    setRefreshToken(token) {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
        }
    },

    getRefreshToken() {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    getUser() {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    setUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    clearAuth() {
        Object.values(STORAGE_KEYS).forEach(key =>
            localStorage.removeItem(key)
        );
    },

    // =========================
    // AUTH CHECKS
    // =========================
    isAuthenticated() {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    },

    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    },

    // =========================
    // ROLES
    // =========================
    getUserRoles() {
        const user = this.getUser();
        if (!user) return [];

        if (user.roleName) {
            return [user.roleName.toUpperCase()];
        }

        if (user.roleId) {
            const roleMap = {
                1: "ADMIN",
                2: "VENDEDOR",
                3: "BODEGA",
            };
            return [roleMap[user.roleId]];
        }

        return [];
    },

    hasRole(role) {
        return this.getUserRoles().includes(role);
    },

    hasAnyRole(roles) {
        return roles.some(r => this.getUserRoles().includes(r));
    },

    hasAllRoles(roles) {
        return roles.every(r => this.getUserRoles().includes(r));
    },
};
