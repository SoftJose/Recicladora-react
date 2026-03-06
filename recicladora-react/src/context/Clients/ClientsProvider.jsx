import { ClientService as clientsService } from "../../services/clientsServices.js";
import { useCallback, useEffect, useState } from "react";
import { ClientsContext } from "./ClientsContext.jsx";

export const ClientsProvider = ({ children }) => {

    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(false)

    const loadClients = useCallback(async () => {
        const token = localStorage.getItem("accessToken")
        if (!token) {
            setClients([])
            return
        }

        try {
            setLoading(true)
            const response = await clientsService.findAllClients()
            setClients(response || [])
        } catch (error) {
            console.error("Error cargando clientes", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadClients()
    }, [loadClients])

    return (
        <ClientsContext.Provider value={{ clients, loading, loadClients }}>
            {children}
        </ClientsContext.Provider>
    )
}