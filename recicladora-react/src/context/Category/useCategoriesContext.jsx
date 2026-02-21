import { useContext } from "react"
import { CategoryContext } from "./CategoryContext.jsx"

export const useCategoriesContext = () => {
    const context = useContext(CategoryContext)

    if (!context) {
        throw new Error("useCategoriesContext debe usarse dentro de CategoryProvider")
    }

    return context
}
