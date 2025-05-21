"use client"

import { useCotacoes } from "@/hooks/use-cotacoes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Loader2, RefreshCcw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCommodityIcon } from "@/lib/utils"
import { useState } from "react"

export function CotacoesWidget() {
  const { cotacoes, loading, error } = useCotacoes()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Primeiro, vamos tentar popular a tabela com dados de exemplo
      await fetch("/api/cotacoes/seed", { method: "POST" })

      // Forçar recarregamento da página para atualizar os dados
      window.location.reload()
    } catch (err) {
      console.error("Erro ao atualizar cotações:", err)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span>Cotações do Dia</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span>Cotações do Dia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4 gap-3">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <p className="text-center text-gray-600">Não foi possível carregar as cotações.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              {refreshing ? "Atualizando..." : "Carregar dados de exemplo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filtrar para mostrar apenas commodities principais
  const principaisCommodities = ["Soja", "Milho", "Café", "Boi Gordo", "Trigo"]
  const cotacoesFiltradas = cotacoes
    .filter((c) => principaisCommodities.some((commodity) => c.produto?.includes(commodity)))
    .slice(0, 5)

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <span>Cotações do Dia</span>
          <Badge className="ml-auto bg-green-100 text-green-800 border-green-200">
            {new Date().toLocaleDateString("pt-BR")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cotacoesFiltradas.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotacoesFiltradas.map((cotacao, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium flex items-center gap-1.5">
                      {getCommodityIcon(cotacao.produto?.split(" ")[0] || "Outro")}
                      {cotacao.produto}
                    </TableCell>
                    <TableCell>{cotacao.local}</TableCell>
                    <TableCell className="text-right font-semibold text-green-700">
                      R$ {typeof cotacao.preco === "number" ? cotacao.preco.toFixed(2) : cotacao.preco}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 gap-3">
            <p className="text-center text-gray-500">Nenhuma cotação disponível no momento.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              {refreshing ? "Carregando..." : "Carregar dados de exemplo"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
