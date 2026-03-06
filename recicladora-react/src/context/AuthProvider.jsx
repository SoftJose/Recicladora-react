import { useState, useMemo, useCallback, useEffect } from "react"
import PropTypes from "prop-types"
import { AuthContext } from "./AuthContext"
import { AuthService } from "../services/auth.services"

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => AuthService.getToken())
    const [user, setUser] = useState(() => AuthService.getUser())
    const [isLoading, setIsLoading] = useState(false)

    // Mantener estado sincronizado si el storage cambia (ej. refresh en api.js)
    useEffect(() => {
        const syncFromStorage = () => {
            setToken(AuthService.getToken())
            setUser(AuthService.getUser())
        }

        // sync inicial por si el state quedó null momentáneamente
        syncFromStorage()

        const onStorage = (e) => {
            if (["accessToken", "user", "refreshToken"].includes(e.key)) {
                syncFromStorage()
            }
        }

        window.addEventListener("storage", onStorage)
        return () => window.removeEventListener("storage", onStorage)
    }, [])

    const login = useCallback((jwt, userData, refreshToken = null) => {
        AuthService.setToken(jwt)
        AuthService.setUser(userData)
        if (refreshToken) AuthService.setRefreshToken(refreshToken)

        setToken(jwt)
        setUser(userData)
    }, [])

    const logout = useCallback(() => {
        AuthService.logout()
        setToken(null)
        setUser(null)
    }, [])

    // ✅ Autenticado si hay token y NO está expirado.
    // El user puede tardar en cargarse o venir null si el backend no lo devolvió,
    // pero no deberíamos botar al usuario si el token es válido.
    const isAuthenticated = useMemo(
        () => !!token && !AuthService.isTokenExpired(token),
        [token]
    )

    const contextValue = useMemo(
        () => ({
            token,
            user,
            isLoading,
            isAuthenticated,
            login,
            logout,
            setLoading: setIsLoading,
            hasRole: AuthService.hasRole.bind(AuthService),
            hasAnyRole: AuthService.hasAnyRole.bind(AuthService),
            hasAllRoles: AuthService.hasAllRoles.bind(AuthService),
            getUserRoles: AuthService.getUserRoles.bind(AuthService),
        }),
        [token, user, isLoading, isAuthenticated, login, logout]
    )

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
