"use client"

import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLotForm } from "@/hooks/use-lot-form"

export function LotForm() {
  const { formData, handleChange, handleSelectChange, handleSubmit } = useLotForm()

  return (
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
  )
}
