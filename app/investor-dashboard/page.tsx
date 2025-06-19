"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sprout,
  User,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Shield,
  Download,
  RefreshCw,
  LogOut,
  Loader2,
} from "lucide-react"

export default function InvestorDashboard() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [error, setError] = useState("")

  const userEmail = searchParams.get("user")
  const token = searchParams.get("token")

  useEffect(() => {
    if (userEmail) {
      fetchUserProfile()
    }
  }, [userEmail])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      console.log("📊 Buscando perfil do usuário:", userEmail)

      // Simular dados do usuário por enquanto
      // Em produção, você faria uma requisição real para buscar os dados
      setTimeout(() => {
        setUserProfile({
          id: 1,
          username: userEmail,
          email: userEmail,
          first_name: "João",
          last_name: "Silva",
          cpf: "123.456.789-00",
          whatsapp: "(11) 99999-9999",
          deposit_value: "1500.00",
          contract_generated_successfully: true,
          investment_date: "2024-01-15",
          package_type: "AgroDeri+",
          tokens_amount: "1650", // 1500 + 10% bonus
          vesting_period: 18,
          cliff_period: 0,
        })
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error("❌ Erro ao buscar perfil:", error)
      setError("Erro ao carregar dados do investimento")
      setLoading(false)
    }
  }

  const handleLogout = () => {
    window.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando seus dados de investimento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 mb-4">❌</div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchUserProfile} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">AgroDeri</span>
            <Badge variant="secondary" className="ml-2">
              Área do Investidor
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {userProfile?.first_name}!</h1>
          <p className="text-gray-600">Acompanhe aqui todos os detalhes do seu investimento em tokens AGD</p>
        </div>

        {/* Investment Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {Number(userProfile?.deposit_value || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Investimento confirmado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens AGD</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.tokens_amount}</div>
              <p className="text-xs text-muted-foreground">Incluindo bônus do pacote</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacote</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.package_type}</div>
              <p className="text-xs text-muted-foreground">Vesting: {userProfile?.vesting_period} meses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data do Investimento</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(userProfile?.investment_date || "").toLocaleDateString("pt-BR")}
              </div>
              <p className="text-xs text-muted-foreground">Contrato assinado</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Investment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Detalhes do Investimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nome:</span>
                  <p className="font-medium">
                    {userProfile?.first_name} {userProfile?.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">CPF:</span>
                  <p className="font-medium">{userProfile?.cpf}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{userProfile?.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">WhatsApp:</span>
                  <p className="font-medium">{userProfile?.whatsapp}</p>
                </div>
                <div>
                  <span className="text-gray-500">Cliff:</span>
                  <p className="font-medium">{userProfile?.cliff_period} meses</p>
                </div>
                <div>
                  <span className="text-gray-500">Vesting:</span>
                  <p className="font-medium">{userProfile?.vesting_period} meses</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status do Contrato:</span>
                  <Badge variant={userProfile?.contract_generated_successfully ? "default" : "secondary"}>
                    {userProfile?.contract_generated_successfully ? "✅ Gerado" : "⏳ Pendente"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ações Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar Contrato
              </Button>

              <Button className="w-full" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Acessar Staking
              </Button>

              <Button className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar Dados
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Próximos Passos:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Aguarde o início do período de vesting</li>
                  <li>• Participe das atividades da comunidade</li>
                  <li>• Acompanhe atualizações do projeto</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Timeline */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Timeline do Investimento</CardTitle>
            <CardDescription>Acompanhe as etapas do seu investimento em tokens AGD</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium">Investimento Realizado</p>
                  <p className="text-sm text-gray-500">
                    {new Date(userProfile?.investment_date || "").toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium">Contrato Gerado</p>
                  <p className="text-sm text-gray-500">Documento disponível para download</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">⏳</span>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Início do Vesting</p>
                  <p className="text-sm text-gray-400">Aguardando início do período</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">⏳</span>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Tokens Disponíveis</p>
                  <p className="text-sm text-gray-400">Após período de vesting</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
