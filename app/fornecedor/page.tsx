"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Wheat, Coffee, FuelIcon as Oil, DiamondPlusIcon as Gold, Upload, Info } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface Lote {
  id: string
  commodity: string
  quantidade: string
  preco: number
  localizacao: string
  status: "Publicado" | "Em negociação" | "Reservado" | "Entregue"
}

export default function PainelFornecedor() {
  const [formData, setFormData] = useState({
    commodity: "",
    quantidade: "",
    localizacao: "",
    preco: "",
    entrega: "",
    observacoes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Dados do formulário:", formData)
    // Aqui seria implementada a lógica para enviar os dados para o backend
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publicado":
        return "bg-green-100 text-green-800 border-green-200"
      case "Em negociação":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Reservado":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Entregue":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCommodityIcon = (type: string) => {
    switch (type) {
      case "Soja":
        return <Wheat className="h-4 w-4 text-amber-600" />
      case "Milho":
        return <Wheat className="h-4 w-4 text-yellow-500" />
      case "Café":
        return <Coffee className="h-4 w-4 text-amber-800" />
      case "Petróleo":
        return <Oil className="h-4 w-4 text-gray-800" />
      case "Ouro":
        return <Gold className="h-4 w-4 text-yellow-400" />
      default:
        return <Wheat className="h-4 w-4 text-amber-600" />
    }
  }

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
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-800">Cadastrar Novo Lote</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commodity">Tipo de Commodity</Label>
                  <Select onValueChange={(value) => handleSelectChange("commodity", value)} value={formData.commodity}>
                    <SelectTrigger id="commodity">
                      <SelectValue placeholder="Selecione o tipo de commodity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soja">Soja</SelectItem>
                      <SelectItem value="Milho">Milho</SelectItem>
                      <SelectItem value="Café">Café</SelectItem>
                      <SelectItem value="Petróleo">Petróleo</SelectItem>
                      <SelectItem value="Ouro">Ouro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade Disponível</Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantidade"
                      name="quantidade"
                      type="number"
                      placeholder="Ex: 5000"
                      value={formData.quantidade}
                      onChange={handleChange}
                    />
                    <Select defaultValue="kg">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                        <SelectItem value="sacas">Sacas</SelectItem>
                        <SelectItem value="ton">Toneladas</SelectItem>
                        <SelectItem value="barris">Barris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    name="localizacao"
                    placeholder="Cidade, Estado, País"
                    value={formData.localizacao}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco">Preço por Unidade (USDT)</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      value={formData.preco}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entrega">Tipo de Entrega</Label>
                  <Select onValueChange={(value) => handleSelectChange("entrega", value)} value={formData.entrega}>
                    <SelectTrigger id="entrega">
                      <SelectValue placeholder="Selecione o tipo de entrega" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Retirada no local</SelectItem>
                      <SelectItem value="nacional">Entrega nacional</SelectItem>
                      <SelectItem value="internacional">Entrega internacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentos">Upload de Documentos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Arraste e solte arquivos aqui ou</p>
                    <Button type="button" variant="outline" size="sm">
                      Selecionar Arquivos
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">Certificação, SGS, nota fiscal, etc. (PDF, JPG, PNG)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    placeholder="Informações adicionais sobre o lote..."
                    rows={4}
                    value={formData.observacoes}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white">
                  Publicar Lote
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tabela de Lotes */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <span>📦 Meus Lotes</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80 text-sm">
                        Aqui você pode visualizar todos os seus lotes cadastrados e acompanhar o status de cada um.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Commodity</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Preço (USDT)</TableHead>
                      <TableHead className="hidden md:table-cell">Localização</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meusLotes.map((lote) => (
                      <TableRow key={lote.id}>
                        <TableCell className="font-medium">{lote.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getCommodityIcon(lote.commodity)}
                            {lote.commodity}
                          </div>
                        </TableCell>
                        <TableCell>{lote.quantidade}</TableCell>
                        <TableCell>${lote.preco.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">{lote.localizacao}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lote.status)}>{lote.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
