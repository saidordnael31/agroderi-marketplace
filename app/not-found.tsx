"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {/* Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/agro-logo.png" alt="AgroDeri Logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold text-gray-900">AgroDeri</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="pt-20">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🌱</div>
            <CardTitle className="text-2xl">Página não encontrada</CardTitle>
            <CardDescription>A página que você está procurando não existe ou foi movida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Que tal conhecer nossos pacotes de investimento em tokens AGD?</p>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Ir para página inicial
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/?step=cadastro">
                  <Sprout className="mr-2 h-4 w-4" />
                  Começar investimento
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t text-center">
              <p className="text-xs text-gray-500">Precisa de ajuda? Entre em contato conosco.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
