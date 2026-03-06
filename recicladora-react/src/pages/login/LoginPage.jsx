import { useLoginForm } from "../../hooks/useLoginForm";
import { Link } from "react-router-dom";
import loginImagen from "../../assets/img/login_imagen.jpg";
import "./login.css";

export const LoginPage = () => {
    const {
        credentials,
        error,
        rememberMe,
        isLoading,
        setRememberMe,
        handleChange,
        handleSubmit
    } = useLoginForm();

    const isInvalid = (field) =>
        !credentials[field] && error?.toLowerCase().includes("campos");

    return (
        <div className="login p-5">
            <div className="login__wrapper">

                {/* PANEL IZQUIERDO (IMAGEN) */}
                <div
                    className="login__image"
                    style={{ backgroundImage: `url(${loginImagen})` }}
                >
                    <div className="login__overlay">
                        <h1 className="login__brand">
                            <i className="bi bi-recycle me-2"></i>
                            Recicladora Ymir
                        </h1>
                        <p className="login__slogan">
                            Gestión responsable para un futuro sostenible
                        </p>
                    </div>
                </div>

                {/* PANEL DERECHO (FORMULARIO) */}
                <div className="login__form-container">
                    <div className="login__card">
                        <h2 className="login__title">Bienvenido</h2>


                        <form onSubmit={handleSubmit} className="login__form">
                            <div className="form-group mb-3">
                                <label className="login__label">Usuario</label>
                                <input
                                    type="text"
                                    name="username"
                                    className={`form-control login__input ${
                                        isInvalid("username") ? "is-invalid" : ""
                                    }`}
                                    value={credentials.username}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    placeholder="Ingresa tu usuario"
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="login__label">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    className={`form-control login__input ${
                                        isInvalid("password") ? "is-invalid" : ""
                                    }`}
                                    value={credentials.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    placeholder="Ingresa tu contraseña"
                                />
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        Recordarme
                                    </label>
                                </div>

                                <Link to="/recuperar-password" className="login__forgot">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="btn login__button w-100"
                                disabled={isLoading}
                            >
                                {isLoading ? "Cargando..." : "Ingresar"}
                            </button>

                            {error && (
                                <div className="alert alert-danger mt-3 text-center">
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};