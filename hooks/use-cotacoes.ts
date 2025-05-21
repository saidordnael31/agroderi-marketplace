"use client"

import { useState, useEffect } from "react"

export interface Cotacao {
  id?: number
  produto: string
  local: string
  preco: number
  data_coleta: string
  created_at?: string
}

export function useCotacoes() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCotacoes() {
      try {
        setLoading(true)
        const response = await fetch("/api/cotacoes/latest")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Falha ao buscar cotações")
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.cotacoes)) {
          setCotacoes(data.cotacoes)
        } else {
          setCotacoes([])
          console.warn("Formato de dados inesperado:", data)
        }
      } catch (err) {
        console.error("Erro ao buscar cotações:", err)
        setError(err.message || "Erro ao carregar cotações")
      } finally {
        setLoading(false)
      }
    }

    fetchCotacoes()
  }, [])

  return { cotacoes, loading, error }
}
