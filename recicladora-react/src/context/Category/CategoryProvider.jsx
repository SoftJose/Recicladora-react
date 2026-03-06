import { useState, useEffect, useCallback, useMemo } from "react"
import { CategoryContext } from "./CategoryContext"
import { categoryService } from "../../services/categoryService"
import { useAuth } from "../../hooks/useAuth"

export const CategoryProvider = ({ children }) => {
    const { isAuthenticated } = useAuth()

    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const loadCategories = useCallback(async () => {
        const token = localStorage.getItem("accessToken")
        if (!token) {
            setCategories([])
            setError(null)
            return
        }

        try {
            setError(null)
            setLoading(true)
            const response = await categoryService.findAllCategories()
            setCategories(Array.isArray(response) ? response : [])
        } catch (err) {
            console.error("Error cargando categorías", err)
            setCategories([])
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            loadCategories()
        } else {
            setCategories([])
        }
    }, [isAuthenticated, loadCategories])

    const categoriesById = useMemo(() => {
        const map = new Map()
        ;(Array.isArray(categories) ? categories : []).forEach((c) => {
            if (c?.id != null) map.set(Number(c.id), c)
        })
        return map
    }, [categories])

    return (
        <CategoryContext.Provider value={{ categories, categoriesById, loading, error, loadCategories }}>
            {children}
        </CategoryContext.Provider>
    )
}