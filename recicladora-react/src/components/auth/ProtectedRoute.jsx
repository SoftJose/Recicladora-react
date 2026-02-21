import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import PropTypes from "prop-types"
import {AuthService} from "../../services/auth.services.js";

/**
 * HOC para proteger rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
export const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                <p>Cargando...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        // Guardar la ubicación a la que intentaba acceder
        return <Navigate to={redirectTo} state={{ from: location }} replace />
    }

    return children
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    redirectTo: PropTypes.string,
}

/**
 * HOC para proteger rutas basándose en roles
 * Redirige a /unauthorized si el usuario no tiene los roles necesarios
 */
export const RoleProtectedRoute = ({
    children,
    roles = [],
    requireAll = false,
    redirectTo = "/unauthorized"
}) => {
    const { isAuthenticated, hasRole, hasAnyRole, hasAllRoles, isLoading, user, getUserRoles } = useAuth()
    const location = useLocation()

    // LOGS DE DEPURACIÓN
    console.log("[RoleProtectedRoute] isAuthenticated:", isAuthenticated)
    console.log("[RoleProtectedRoute] user:", user)
    console.log("[RoleProtectedRoute] roles requeridos:", roles)
    console.log("[RoleProtectedRoute] roles usuario:", getUserRoles())
    if (typeof hasRole === 'function') {
        console.log("[RoleProtectedRoute] hasRole(ADMIN):", hasRole("ADMIN"))
    }

    if (isLoading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}>
                <p>Cargando...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }



    // Verificación de roles
    let hasAccess = false
    if (roles.length === 0) {
        hasAccess = true
    } else if (requireAll) {
        hasAccess = hasAllRoles(roles)
    } else {
        hasAccess = hasAnyRole(roles)
    }

    if (!hasAccess) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />
    }

    return children
}

RoleProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string),
    requireAll: PropTypes.bool,
    redirectTo: PropTypes.string,
}


/**
 * HOC para rutas públicas (solo para usuarios no autenticados)
 * Por ejemplo: login, register
 * Redirige al home si ya está autenticado
 */
export const PublicOnlyRoute = ({ children, redirectTo = "/" }) => {
    const { isAuthenticated } = useAuth()

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />
    }

    return children
}

PublicOnlyRoute.propTypes = {
    children: PropTypes.node.isRequired,
    redirectTo: PropTypes.string,
}
