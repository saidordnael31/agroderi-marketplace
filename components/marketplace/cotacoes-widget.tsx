"use client"

import { useCotacoes } from "@/hooks/use-cotacoes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wheat, TrendingUp, Loader2 } from "lucide-react"

export function CotacoesWidget() {
  const { cotacoes, loading, error } = useCotacoes()

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
          <div className="text-center py-4 text-red-500">Erro ao carregar cotações. Tente novamente mais tarde.</div>
        </CardContent>
      </Card>
    )
  }

  // Filtrar para mostrar apenas commodities principais
  const principaisCommodities = ["Soja", "Milho", "Café", "Boi Gordo", "Trigo"]
  const cotacoesFiltradas = cotacoes
    .filter((c) => principaisCommodities.some((commodity) => c.produto.includes(commodity)))
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
                      <Wheat className="h-4 w-4 text-amber-600" />
                      {cotacao.produto}
                    </TableCell>
                    <TableCell>{cotacao.local}</TableCell>
                    <TableCell className="text-right font-semibold text-green-700">
                      R$ {cotacao.preco.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Nenhuma cotação disponível no momento.</div>
        )}
      </CardContent>
    </Card>
  )
}
