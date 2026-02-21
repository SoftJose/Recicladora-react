import { useState, useMemo, useCallback } from "react"
import PropTypes from "prop-types"
import { AuthContext } from "./AuthContext"
import { AuthService } from "../services/auth.services"

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => AuthService.getToken())
    const [user, setUser] = useState(() => AuthService.getUser())
    const [isLoading, setIsLoading] = useState(false)

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

    const isAuthenticated = useMemo(
        () => !!token && !!user,
        [token, user]
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
