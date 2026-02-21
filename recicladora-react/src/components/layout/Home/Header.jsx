import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../../hooks/useAuth.js";
import UserMenu from "../../auth/UserMenu.jsx";
import "./Header.css";
import {AuthService} from "../../../services/auth.services.js";

function Header() {
    // Traemos la info real del usuario
    const {isAuthenticated, user, logout} = useAuth();
    const navigate = useNavigate();

    const closeOffcanvas = () => {
        const menu = document.getElementById('offcanvasNavbar');
        const bsOffcanvas = window.bootstrap?.Offcanvas?.getInstance(menu);
        if (bsOffcanvas) bsOffcanvas.hide();
    }

    const navTo = (e, path) => {
        e.preventDefault();
        navigate(path);
        closeOffcanvas();
    }

    // 🔐 Los roles vienen SOLO del AuthService
    const roles = user ? AuthService.getUserRoles() : []
    { /*const role = roles[0] || "INVITADO" */}

    console.log("🔍 Header - Usuario:", user)
    console.log("🎭 Header - Roles:", roles)
    console.log("🔍 Header - isAuthenticated:", isAuthenticated)


    return (
        <header className="header shadow-sm">
            <nav className="header__navbar navbar fixed-top">
                <div className="container-fluid d-flex align-items-center">

                    {/* Botón Hamburguesa */}
                    <button
                        className="navbar-toggler me-2"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasNavbar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="d-flex align-items-center w-75">
                        <div className="header__brand">
                            <i className="bi bi-recycle header__brand-icon"></i>
                            <h1 className="header__title">
                                Sistema de Gestión Recicladora Ymir
                            </h1>
                            <i className="bi bi-recycle header__brand-icon"></i>
                        </div>

                        {/* LOGIN DESKTOP */}
                        {!isAuthenticated && (
                            <div className="ms-auto header__login-desktop">
                                <Link to="/login" className="btn btn-outline-light rounded">
                                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                                </Link>
                            </div>
                        )}

                        {/* USER MENU DESKTOP */}
                        {isAuthenticated && (
                            <div className="ms-auto">
                                <UserMenu user={user} onLogout={logout}/>
                            </div>
                        )}

                        {/* Menú Lateral (Offcanvas) */}
                        <div className="offcanvas offcanvas-start header__offcanvas" id="offcanvasNavbar" tabIndex="-1">
                            <div className="offcanvas-header header__offcanvas-header">
                                <h5 className="m-0">Menú de Navegación</h5>
                                <button type="button" className="btn-close btn-close-white"
                                        data-bs-dismiss="offcanvas"></button>
                            </div>

                            <div className="offcanvas-body">
                                <ul className="navbar-nav header__nav-list">

                                    {/* Opciones comunes */}
                                    <li className="nav-item">
                                        <Link to="/" className="nav-link" data-bs-dismiss="offcanvas"
                                              onClick={(e) => navTo(e, "/")}>
                                            <i className="bi bi-house-door me-2"></i> Home
                                        </Link>
                                    </li>

                                    {/* Filtro por Roles profesional */}
                                    { /*(role === "ADMIN" || role === "VENDEDOR")&& */}
                                    { (
                                        <>
                                            <li className="nav-item">
                                                <Link to="/materiales" className="nav-link" data-bs-dismiss="offcanvas"
                                                      onClick={(e) => navTo(e, "/materiales")}>
                                                    <i className="bi bi-boxes me-2"></i> Materiales
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/clientes" className="nav-link" data-bs-dismiss="offcanvas"
                                                      onClick={(e) => navTo(e, "/clientes")}>
                                                    <i className="bi bi-people-fill me-2"></i> Clientes
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/usuarios" className="nav-link" data-bs-dismiss="offcanvas"
                                                      onClick={(e) => navTo(e, "/usuarios")}>
                                                    <i className="bi bi-person-vcard me-2"></i> Usuarios
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/categorias" className="nav-link" data-bs-dismiss="offcanvas"
                                                      onClick={(e) => navTo(e, "/categorias")}>
                                                    <i className="bi bi-tags-fill me-2"></i> Categorías
                                                </Link>
                                            </li>
                                        </>
                                    )}

                                    { /*(role === "ADMIN" || role === "VENDEDOR")&& */}
                                    { (
                                        <>
                                            <li className="nav-item">
                                                <Link to="/ventas" className="nav-link" data-bs-dismiss="offcanvas"
                                                      onClick={(e) => navTo(e, "/ventas")}>
                                                    <i className="bi bi-cash-stack me-2"></i> Ventas
                                                </Link>
                                            </li>
                                            <li className="nav-item">
                                                <Link to="/facturacion" className="nav-link" data-bs-dismiss="offcanvas"
                                                      onClick={(e) => navTo(e, "/facturacion")}>
                                                    <i className="bi bi-receipt-cutoff me-2"></i> Facturación
                                                </Link>
                                            </li>
                                        </>
                                    )}

                                    {/* Botón Logout al final */}
                                    {isAuthenticated && (
                                        <li className="nav-item mt-4">
                                            <button
                                                className="btn btn-outline-danger w-100 header__logout-btn"
                                                onClick={() => {
                                                    logout();
                                                    const menu = document.getElementById('offcanvasNavbar');
                                                    const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(menu);
                                                    if (bsOffcanvas) {
                                                        bsOffcanvas.hide();
                                                    }
                                                }}
                                            >
                                                <i className="bi bi-box-arrow-left me-2"></i> Cerrar Sesión
                                            </button>
                                        </li>
                                    )}

                                    {/* LOGIN MOBILE */}
                                    {!isAuthenticated && (
                                        <li className="nav-item header__login-mobile">
                                            <Link
                                                to="/login"
                                                className="btn btn-success w-100"
                                                data-bs-dismiss="offcanvas"
                                            >
                                                <i className="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
                                            </Link>
                                        </li>
                                    )}

                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;