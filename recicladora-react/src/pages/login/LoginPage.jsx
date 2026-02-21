import { useLoginForm } from "../../hooks/useLoginForm";
import { Link } from "react-router-dom";
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

    // Lógica para validación visual (sustituye al is-invalid de Angular)
    const isInvalid = (field) => !credentials[field] && error.includes("campos");

    return (
        <div className="login-container container-fluid vh-100 d-flex justify-content-center align-items-center">
            {/* Partículas de fondo con BEM */}
            <div className="login-container__particles">
                <div className="login-container__circle login-container__circle--top-right"></div>
                <div className="login-container__circle login-container__circle--middle-left"></div>
                <div className="login-container__circle login-container__circle--bottom-right"></div>
            </div>

            <div className="card login-card">
                <div className="card-body login-card__body">
                    <h2 className="text-center mb-4 login-card__title">Bienvenido</h2>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="mb-4">
                            <label htmlFor="username" className="form-label login-form__label">Usuario</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Ingresa tu usuario"
                                className={`form-control login-form__input ${isInvalid('username') ? 'is-invalid' : ''}`}
                                value={credentials.username}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {isInvalid('username') && (
                                <div className="invalid-feedback">Por favor ingresa un usuario válido.</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label login-form__label">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Ingresa tu contraseña"
                                className={`form-control login-form__input ${isInvalid('password') ? 'is-invalid' : ''}`}
                                value={credentials.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {isInvalid('password') && (
                                <div className="invalid-feedback">La contraseña es requerida.</div>
                            )}
                        </div>

                        <div className="mb-4 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input login-form__checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="rememberMe">Recordarme</label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 login-form__button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Cargando..." : "Ingresar"}
                        </button>
                    </form>

                    {error && (
                        <div className="alert alert-danger mt-4 login-card__alert" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="mt-4 text-center">
                        <Link to="/recuperar-password" title="Recuperar" className="text-decoration-none login-card__link">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};