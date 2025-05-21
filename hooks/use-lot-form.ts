"use client"

import type React from "react"

import { useState, useCallback } from "react"

interface LotFormData {
  commodity: string
  quantidade: string
  localizacao: string
  preco: string
  entrega: string
  observacoes: string
}

export function useLotForm() {
  const [formData, setFormData] = useState<LotFormData>({
    commodity: "",
    quantidade: "",
    localizacao: "",
    preco: "",
    entrega: "",
    observacoes: "",
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      console.log("Dados do formulário:", formData)
      // Aqui seria implementada a lógica para enviar os dados para o backend
    },
    [formData],
  )

  return {
    formData,
    handleChange,
    handleSelectChange,
    handleSubmit,
  }
}
