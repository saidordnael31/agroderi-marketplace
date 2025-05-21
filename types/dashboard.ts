export interface Lote {
  id: string
  commodity: string
  quantidade: string
  preco: number
  localizacao: string
  status: "Publicado" | "Em negociação" | "Reservado" | "Entregue"
}

export interface LotFormData {
  commodity: string
  quantidade: string
  localizacao: string
  preco: string
  entrega: string
  observacoes: string
}
