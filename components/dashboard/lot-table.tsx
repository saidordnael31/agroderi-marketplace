import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getCommodityIcon } from "@/lib/utils"
import type { Lote } from "@/types/dashboard"

interface LotTableProps {
  lotes: Lote[]
}

export function LotTable({ lotes }: LotTableProps) {
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

  return (
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
              {lotes.map((lote) => (
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
  )
}
