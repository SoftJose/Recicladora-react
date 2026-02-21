import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { AuthService } from "../services/auth.services";


export const useLoginForm = () => {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const { login, isLoading, setLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        // Limpiar error al escribir
        if (error) setError("");
    };

    const validateForm = () => {
        if (!credentials.username?.trim()) {
            setError("El usuario es requerido");
            return false;
        }
        if (!credentials.password?.trim()) {
            setError("La contraseña es requerida");
            return false;
        }
        if (credentials.username.trim().length < 3) {
            setError("El usuario debe tener al menos 3 caracteres");
            return false;
        }
        if (credentials.password.length < 4) {
            setError("La contraseña debe tener al menos 4 caracteres");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validar formulario
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Log para debug (sin mostrar la contraseña completa)
            console.log("Intentando login con usuario:", credentials.username);

            const response = await AuthService.login(credentials);

            // Verificar que la respuesta tenga los datos necesarios
            if (!response?.token || !response?.user) {
                throw new Error("Respuesta inválida del servidor");
            }

            console.log("Login exitoso:", response.user.username);

            login(response.token, response.user, response.refreshToken);

            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            }

            // Navegar después de login exitoso
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Error en login:", err);
            const errorMessage = err.message || "Error al iniciar sesión. Verifica tus credenciales.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Exponemos solo lo que el UI necesita
    return {
        credentials,
        error,
        rememberMe,
        isLoading,
        setRememberMe,
        handleChange,
        handleSubmit
    };
};