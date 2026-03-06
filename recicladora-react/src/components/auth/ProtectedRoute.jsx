import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import PropTypes from "prop-types"

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
                                       redirectTo = "/unauthorized",
                                   }) => {
    const {
        isAuthenticated,
        isLoading,
        hasAnyRole,
        hasAllRoles,
    } = useAuth()

    const location = useLocation()

    if (isLoading) {
        return <div>Cargando...</div>
    }

    // 🔐 No autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // 🔑 Autenticado pero sin roles requeridos
    const allowed =
        roles.length === 0
            ? true
            : requireAll
                ? hasAllRoles(roles)
                : hasAnyRole(roles)

    if (!allowed) {
        return <Navigate to={redirectTo} replace />
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
