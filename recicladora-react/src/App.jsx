import { AppRoutes } from "./routes/AppRoutes"
import MainLayout from "./components/layout/Home/MainLayout.jsx"

import "./App.css"
import { CategoryProvider } from "./context/Category/CategoryProvider.jsx"
import { ClientsProvider } from "./context/Clients/ClientsProvider.jsx";
import { MaterialProvider } from "./context/Material/MaterialProvider.jsx";
import { DetailsProvider } from "./context/Details/DetailsProvider.jsx";
import { TransactionProvider } from "./context/Transaction/TransactionProvider.jsx";

function App() {
    return (
        <CategoryProvider>
            <ClientsProvider>
                <MaterialProvider>
                    <TransactionProvider>
                        <DetailsProvider>
                            <MainLayout>
                                <AppRoutes />
                            </MainLayout>
                        </DetailsProvider>
                    </TransactionProvider>
                </MaterialProvider>
            </ClientsProvider>
        </CategoryProvider>
    )
}

export default App
