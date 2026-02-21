import { AppRoutes } from "./routes/AppRoutes"
import MainLayout from "./components/layout/Home/MainLayout.jsx"

import './App.css'
import { CategoryProvider } from "./context/Category/CategoryProvider.jsx"

function App() {
    return (
        <CategoryProvider>
            <MainLayout>
                <AppRoutes />
            </MainLayout>
        </CategoryProvider>
    )
}

export default App
