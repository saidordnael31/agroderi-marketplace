export interface Product {
  id: number
  name: string
  image: string
  quantity: string
  price: number
  location: string
  seller: string
  type: string
  country: string
}

export interface FilterOptions {
  type: string
  location: string
  minPrice: string
  maxPrice: string
}
