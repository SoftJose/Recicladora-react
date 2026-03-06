import { Routes, Route, Navigate } from "react-router-dom";
import { PublicOnlyRoute, RoleProtectedRoute } from "../components/auth/ProtectedRoute";

// Páginas (Asegúrate de que estas rutas sean correctas)
import HomePage from "../pages/home/HomePage.jsx";
import { LoginPage } from "../pages/login/LoginPage.jsx";
import CategoryPage from "../pages/Category/CategoryPage.jsx";
import ClientsPage from "../pages/Clients/ClientsPage.jsx";
import MaterialPage from "../pages/Material/MaterialPage.jsx";
import TransactionPage from "../pages/Transaction/TransactionPage.jsx";
import TransactionDetailsPage from "../pages/Transaction/transactionDetailsPage.jsx";

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

            {/* PROTEGIDAS */}
            <Route
                path="/categorias"
                element={
                    <RoleProtectedRoute roles={["ADMIN", "BODEGA"]}>
                        <CategoryPage />
                    </RoleProtectedRoute>
                }
            />

            <Route
                path="/clientes"
                element={
                    <RoleProtectedRoute roles={["ADMIN"]}>
                        <ClientsPage />
                    </RoleProtectedRoute>
                }
            />

            <Route
                path="/usuarios"
                element={
                    <RoleProtectedRoute roles={["ADMIN"]}>
                        <div className="container mt-5"><h1>Gestión de Usuarios</h1></div>
                    </RoleProtectedRoute>
                }
            />

            <Route
                path="/materiales"
                element={
                    <RoleProtectedRoute roles={["ADMIN", "BODEGA"]}>
                        <MaterialPage />
                    </RoleProtectedRoute>
                }
            />

            <Route
                path="/ventas"
                element={
                    <RoleProtectedRoute roles={["VENDEDOR"]}>
                        <TransactionPage />
                    </RoleProtectedRoute>
                }
            />

            <Route
                path="/facturacion"
                element={
                    <RoleProtectedRoute roles={["VENDEDOR"]}>
                        <TransactionDetailsPage />
                    </RoleProtectedRoute>
                }
            />

            {/* ERRORES */}
            <Route path="/unauthorized" element={<div className="container mt-5"><h1>No autorizado</h1></div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};