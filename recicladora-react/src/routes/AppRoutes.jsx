import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, RoleProtectedRoute, PublicOnlyRoute } from "../components/auth/ProtectedRoute";

// Páginas (Asegúrate de que estas rutas sean correctas)
import HomePage from "../pages/home/HomePage.jsx";
import { LoginPage } from "../pages/login/LoginPage.jsx";
import CategoryPage from "../pages/Category/CategoryPage.jsx";

export const AppRoutes = () => {
    return (
        <Routes>
            {/* PÚBLICAS */}
            <Route path="/" element={<HomePage />} />

            <Route
                path="/login"
                element={
                    <PublicOnlyRoute redirectTo="/">
                        <LoginPage />
                    </PublicOnlyRoute>
                }
            />

            {/* PROTEGIDAS GENERALES */}
            {/* roles={["ADMIN"]}*/}
            <Route
                path="/categorias"
                element={
                    <PublicOnlyRoute>
                        <CategoryPage />
                    </PublicOnlyRoute>
                }
            />

            {/* PROTEGIDAS POR ROL (Usando DIVs temporales para que no falle) */}
            {/* roles={["ADMIN"]}*/}
            <Route
                path="/usuarios"
                element={
                    <PublicOnlyRoute roles={["ADMIN"]}>
                        <div className="container mt-5"><h1>Gestión de Usuarios</h1></div>
                    </PublicOnlyRoute>
                }
            />

            {/* roles={["ADMIN", "BODEGA"]}*/}
            <Route
                path="/materiales"
                element={
                    <PublicOnlyRoute>
                        <div className="container mt-5"><h1>Gestión de Materiales</h1></div>
                    </PublicOnlyRoute>
                }
            />

            {/* roles={["ADMIN", "VENDEDOR"]}*/}
            <Route
                path="/ventas"
                element={
                    <PublicOnlyRoute >
                        <div className="container mt-5"><h1>Facturación y Ventas</h1></div>
                    </PublicOnlyRoute>
                }
            />

            {/* ERRORES */}
            <Route path="/unauthorized" element={<div className="container mt-5"><h1>No autorizado</h1></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};