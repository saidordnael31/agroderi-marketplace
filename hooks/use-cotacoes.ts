"use client"

import { useState, useEffect } from "react"

interface Cotacao {
  produto: string
  local: string
  preco: number
  data_coleta: string
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
          throw new Error("Falha ao buscar cotações")
        }

        const data = await response.json()
        setCotacoes(data.cotacoes)
      } catch (err) {
        console.error("Erro ao buscar cotações:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCotacoes()
  }, [])

  return { cotacoes, loading, error }
}
