import { apiFetch } from "./api";

const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    USER: "user",
};

const normalizeRole = (r) => {
    const role = String(r || "").trim().toUpperCase();
    if (!role) return "";
    return role.startsWith("ROLE_") ? role : `ROLE_${role}`;
};

const decodeJwtPayload = (token) => {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
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

        const { accessToken, worker } = response;

        if (!accessToken || !worker) {
            throw new Error("Respuesta inválida del servidor");
        }

        // Guardar solo accessToken
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(worker));

        return { token: accessToken, user: worker };
    },


    // =========================
    // REFRESH TOKEN
    // =========================
    async refreshToken() {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No hay refreshToken");

        const response = await apiFetch("/v1/trabajadores/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
        });

        const newAccessToken = response.accessToken || response.token;
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
    // STORAGE
    // =========================
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    setToken(token) {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        }
    },

    getUser() {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },


    clearAuth() {
        Object.values(STORAGE_KEYS).forEach(key =>
            localStorage.removeItem(key)
        );
        localStorage.removeItem("refreshToken");
    },

    setUser(user) {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user))
        }
    },

    setRefreshToken(refreshToken) {
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken)
        }
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
        const token = this.getToken();

        // Preferimos roles del token si existen
        if (token) {
            const payload = decodeJwtPayload(token);
            const rawRoles = payload?.roles || payload?.authorities || payload?.scope;

            if (Array.isArray(rawRoles)) {
                return rawRoles.map(normalizeRole).filter(Boolean);
            }

            if (typeof rawRoles === "string") {
                return rawRoles
                    .split(/[\s,]+/)
                    .map(normalizeRole)
                    .filter(Boolean);
            }
        }


        if (!user) return [];


        if (user.roleName) {
            return [normalizeRole(user.roleName)].filter(Boolean);
        }

        if (Array.isArray(user.roles)) {
            return user.roles.map(normalizeRole).filter(Boolean);
        }

        if (user.fkRoles?.name) {
            return [normalizeRole(user.fkRoles.name)].filter(Boolean);
        }

        return [];
    },

    hasRole(role) {
        const target = normalizeRole(role);
        return this.getUserRoles().includes(target);
    },

    hasAnyRole(roles) {
        const targets = (Array.isArray(roles) ? roles : []).map(normalizeRole).filter(Boolean);
        if (targets.length === 0) return true;
        const userRoles = this.getUserRoles();
        return targets.some(r => userRoles.includes(r));
    },

    hasAllRoles(roles) {
        const targets = (Array.isArray(roles) ? roles : []).map(normalizeRole).filter(Boolean);
        if (targets.length === 0) return true;
        const userRoles = this.getUserRoles();
        return targets.every(r => userRoles.includes(r));
    },
};