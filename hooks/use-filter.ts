"use client"

import { useState, useCallback } from "react"
import type { FilterOptions, Product } from "@/types/marketplace"

export function useFilter(products: Product[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    location: "all",
    minPrice: "",
    maxPrice: "",
  })

  const handleFilterChange = useCallback((name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }, [])

  const filteredProducts = products.filter((product) => {
    if (filters.type !== "all" && product.type !== filters.type) return false
    if (filters.location !== "all" && product.country !== filters.location) return false
    if (filters.minPrice && product.price < Number.parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && product.price > Number.parseFloat(filters.maxPrice)) return false
    return true
  })

  return {
    filters,
    handleFilterChange,
    filteredProducts,
  }
}
