import { useState, useEffect, useCallback } from "react"
import { CategoryContext } from "./CategoryContext"
import { categoryService } from "../../services/categoryService"

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true)
            const response = await categoryService.findAllCategories()
            setCategories(response || [])
            console.log(response)
        } catch (error) {
            console.error("Error cargando categorías", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadCategories()
    }, [loadCategories])

    return (
        <CategoryContext.Provider value={{ categories, loading, loadCategories }}>
            {children}
        </CategoryContext.Provider>
    )
}