import PropTypes from "prop-types"
import "./UserMenu.css"

/**
 * Componente de menú de usuario
 * Muestra información del usuario autenticado y opciones de cuenta
 */
export const UserMenu = ({ user, onLogout }) => {
    if (!user) {
        return null;
    }

    const getDisplayName = () => {
        return user.username || user.email || user.name || "Usuario";
    };

    const getInitial = () => {
        const name = getDisplayName();
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
                type="button"
                id="userMenuDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <div className="avatar-placeholder me-2">
                    {getInitial()}
                </div>
                <span>{getDisplayName()}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuDropdown">
                <li>
                    <div className="dropdown-item-text">
                        <small className="text-muted">Conectado como</small>
                        <div className="fw-bold">{getDisplayName()}</div>
                    </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <a className="dropdown-item" href="/profile">
                        <i className="bi bi-person me-2"></i>
                        Mi Perfil
                    </a>
                </li>
                <li>
                    <a className="dropdown-item" href="/settings">
                        <i className="bi bi-gear me-2"></i>
                        Configuración
                    </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <button
                        className="dropdown-item text-danger"
                        onClick={onLogout}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar Sesión
                    </button>
                </li>
            </ul>
        </div>
    );
};

UserMenu.propTypes = {
    user: PropTypes.object.isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default UserMenu;

