"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LotForm } from "@/components/forms/lot-form"
import { LotTable } from "@/components/dashboard/lot-table"
import type { Lote } from "@/types/dashboard"

export default function PainelFornecedor() {
  // Dados mockados para a tabela de lotes
  const meusLotes: Lote[] = [
    {
      id: "LOT-001",
      commodity: "Soja",
      quantidade: "10.000 kg",
      preco: 25.5,
      localizacao: "Sorriso - MT, Brasil",
      status: "Publicado",
    },
    {
      id: "LOT-002",
      commodity: "Milho",
      quantidade: "5.000 kg",
      preco: 15.0,
      localizacao: "Chapadão do Sul - MS, Brasil",
      status: "Em negociação",
    },
    {
      id: "LOT-003",
      commodity: "Café",
      quantidade: "2.500 kg",
      preco: 32.75,
      localizacao: "Patrocínio - MG, Brasil",
      status: "Reservado",
    },
    {
      id: "LOT-004",
      commodity: "Soja",
      quantidade: "8.000 kg",
      preco: 26.2,
      localizacao: "Rio Verde - GO, Brasil",
      status: "Entregue",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-800">🌾 Painel do Fornecedor – Cadastrar Novo Lote</h1>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao Marketplace</span>
              <span className="sm:hidden">Voltar</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Cadastro */}
          <LotForm />

          {/* Tabela de Lotes */}
          <LotTable lotes={meusLotes} />
        </div>
      </div>
    </div>
  )
}
