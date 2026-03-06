import {useContext} from "react";
import {ClientsContext} from "./ClientsContext.jsx";


export const useClientsContext = () => {
    const context = useContext(ClientsContext)

    if (!context) {
        throw new Error("useClientsContext debe usarse dentro de ClientsProvider")
    }
    return context
}