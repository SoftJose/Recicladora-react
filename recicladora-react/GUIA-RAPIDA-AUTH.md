# 🚀 Guía Rápida de Implementación - Sistema de Autenticación

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ **Configuración Inicial**

#### Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

#### Instalar dependencias (si no las tienes):
```bash
npm install react-router-dom prop-types
```

---

### 2️⃣ **Integrar AuthProvider en tu App**

Actualiza `src/main.jsx`:

```jsx
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

---

### 3️⃣ **Usar el Hook en cualquier componente**

```jsx
import { useAuth } from './hooks/useAuth'

function MyComponent() {
    const { user, isAuthenticated, logout } = useAuth()

    if (!isAuthenticated) {
        return <p>No has iniciado sesión</p>
    }

    return (
        <div>
            <h1>Bienvenido {user.username}</h1>
            <button onClick={logout}>Cerrar Sesión</button>
        </div>
    )
}
```

---

### 4️⃣ **Proteger Rutas**

En tu archivo de rutas:

```jsx
import { ProtectedRoute } from './components/auth/ProtectedRoute'

<Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    
    {/* Ruta protegida */}
    <Route 
        path="/dashboard" 
        element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        } 
    />
</Routes>
```

---

### 5️⃣ **Implementar Login**

```jsx
import { useAuth } from './hooks/useAuth'
import { AuthService } from './services/auth.services'

function LoginForm() {
    const { login, setLoading } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await AuthService.login({
                username: 'admin',
                password: 'password123'
            })

            login(response.token, response.user, response.refreshToken)
            navigate('/dashboard')
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

---

## 📚 Ejemplos Comunes

### ✅ Verificar Autenticación

```jsx
const { isAuthenticated } = useAuth()

if (!isAuthenticated) {
    return <Navigate to="/login" />
}
```

### ✅ Mostrar Info del Usuario

```jsx
const { user } = useAuth()

<div>
    <p>Usuario: {user.username}</p>
    <p>Email: {user.email}</p>
</div>
```

### ✅ Verificar Roles

```jsx
const { hasRole, hasAnyRole } = useAuth()

{hasRole('ADMIN') && <AdminButton />}
{hasAnyRole(['ADMIN', 'MANAGER']) && <ReportsLink />}
```

### ✅ Logout

```jsx
const { logout } = useAuth()

<button onClick={logout}>Cerrar Sesión</button>
```

### ✅ Estado de Carga

```jsx
const { isLoading } = useAuth()

{isLoading && <Spinner />}
```

---

## 🎯 Componentes Listos para Usar

### **UserMenu** - Menú de usuario completo
```jsx
import { UserMenu } from './components/auth/UserMenu'

<Header>
    <UserMenu />
</Header>
```

### **ProtectedRoute** - Proteger rutas
```jsx
import { ProtectedRoute } from './components/auth/ProtectedRoute'

<ProtectedRoute>
    <Dashboard />
</ProtectedRoute>
```

### **RoleProtectedRoute** - Por roles
```jsx
import { RoleProtectedRoute } from './components/auth/ProtectedRoute'

<RoleProtectedRoute roles={['ADMIN']}>
    <AdminPanel />
</RoleProtectedRoute>
```

### **LoginPage** - Página de login completa
```jsx
import { LoginPage } from './pages/LoginPage'

<Route path="/login" element={<LoginPage />} />
```

---

## 🔧 API Client - Métodos HTTP

### GET
```jsx
import { apiGet } from './services/api'

const users = await apiGet('/v1/users')
```

### POST
```jsx
import { apiPost } from './services/api'

const newUser = await apiPost('/v1/users', {
    name: 'Juan',
    email: 'juan@example.com'
})
```

### PUT
```jsx
import { apiPut } from './services/api'

await apiPut('/v1/users/1', { name: 'Juan Pérez' })
```

### DELETE
```jsx
import { apiDelete } from './services/api'

await apiDelete('/v1/users/1')
```

---

## 🎁 Características Incluidas

✅ **Refresh Token Automático** - Sin interrupciones
✅ **Sincronización Multi-tab** - Logout/login sincronizado
✅ **Verificación de Expiración** - Logout automático
✅ **Sistema de Roles** - Control de acceso granular
✅ **Protección de Rutas** - HOCs listos para usar
✅ **Estado de Carga** - UX mejorada
✅ **Manejo de Errores** - Robusto y descriptivo
✅ **Componentes UI** - UserMenu, LoginPage, etc.

---

## 🐛 Troubleshooting

### Problema: "Token expirado constantemente"
**Solución**: Verifica que tu backend retorne `refreshToken` en el login.

### Problema: "No se sincroniza entre pestañas"
**Solución**: Asegúrate de estar usando `localStorage` y no `sessionStorage`.

### Problema: "Roles no funcionan"
**Solución**: Verifica que el objeto `user` del backend tenga un array `roles`:
```json
{
    "user": {
        "id": 1,
        "username": "admin",
        "roles": ["ADMIN", "USER"]
    }
}
```

---

## 📞 API Requirements

Tu backend debe retornar:

### Login Response:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "roles": ["ADMIN"]
    },
    "refreshToken": "refresh_token_aquí"
}
```

### Token Structure (JWT):
```json
{
    "sub": "1",
    "username": "admin",
    "roles": ["ADMIN"],
    "exp": 1738445678
}
```

---

## 🚀 ¡Listo!

Con estos 5 pasos tu sistema de autenticación estará funcionando. El resto de features (refresh automático, sincronización, etc.) ya están integradas y funcionarán automáticamente.

**¿Necesitas más ayuda?** Revisa la documentación completa en `mejoras-auth-system.md`

