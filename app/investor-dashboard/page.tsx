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
  Shield,
  RefreshCw,
  LogOut,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react"
import { maskCPF, maskPhone, maskRG } from "@/utils/input-masks"

export default function InvestorDashboard() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [error, setError] = useState("")

  const userEmail = searchParams.get("user")
  const token = searchParams.get("token")
  const cpf = searchParams.get("cpf")
  const userId = searchParams.get("user_id")

  useEffect(() => {
    if (cpf) {
      fetchUserProfile()
    }
  }, [cpf])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("📊 Buscando perfil do usuário com CPF:", cpf)

      // Usar nossa API route ao invés da requisição direta
      const response = await fetch(`/api/get-user-profile?cpf=${cpf}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      console.log("📊 Status da resposta:", response.status)

      if (response.ok) {
        const profileData = await response.json()
        console.log("📦 Dados do perfil:", profileData)

        // Calcular informações adicionais baseadas nos dados
        const depositValue = Number.parseFloat(profileData.deposit_value || "0")
        const packageInfo = getPackageInfo(depositValue)

        setUserProfile({
          ...profileData,
          investment_date: new Date().toISOString(), // Por enquanto usar data atual
          package_type: packageInfo.name,
          tokens_amount: calculateTokens(depositValue, packageInfo.bonus),
          vesting_period: packageInfo.vesting,
          cliff_period: packageInfo.cliff,
          bonus_percentage: packageInfo.bonus,
        })
      } else {
        const errorData = await response.json()
        console.error("❌ Erro na API:", errorData)
        setError(errorData.error || "Não foi possível carregar os dados do investimento")
      }
    } catch (error) {
      console.error("❌ Erro ao buscar perfil:", error)
      setError("Erro de conexão ao carregar dados do investimento")
    } finally {
      setLoading(false)
    }
  }

  // Função para determinar o pacote baseado no valor investido
  const getPackageInfo = (value) => {
    if (value >= 100000) {
      return { name: "Institucional", bonus: 35, cliff: 6, vesting: 36 }
    } else if (value >= 20000) {
      return { name: "Agro Whale", bonus: 30, cliff: 6, vesting: 36 }
    } else if (value >= 5000) {
      return { name: "Agro Elite", bonus: 25, cliff: 6, vesting: 24 }
    } else if (value >= 1000) {
      return { name: "Agro Master", bonus: 15, cliff: 3, vesting: 24 }
    } else if (value >= 250) {
      return { name: "AgroDeri+", bonus: 10, cliff: 0, vesting: 18 }
    } else {
      return { name: "Raiz do Agro", bonus: 5, cliff: 0, vesting: 12 }
    }
  }

  // Função para calcular tokens com bônus
  const calculateTokens = (depositValue, bonusPercentage) => {
    const baseTokens = depositValue // 1 real = 1 token (ajustar conforme necessário)
    const bonusTokens = (baseTokens * bonusPercentage) / 100
    return Math.floor(baseTokens + bonusTokens).toString()
  }

  const handleLogout = () => {
    window.close()
  }

  const handleRefresh = () => {
    fetchUserProfile()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando seus dados de investimento...</p>
          <p className="text-sm text-gray-500 mt-2">CPF: {cpf}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 mb-4 text-4xl">❌</div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={handleRefresh} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full">
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-yellow-500 mb-4 text-4xl">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Nenhum investimento encontrado</h3>
            <p className="text-gray-600 mb-4">Não encontramos nenhum investimento associado ao CPF {cpf}</p>
            <Button onClick={handleLogout} variant="outline">
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const depositValue = Number.parseFloat(userProfile.deposit_value || "0")
  const hasInvestment = depositValue > 0

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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {userProfile.first_name}!</h1>
          <p className="text-gray-600">
            {hasInvestment
              ? "Acompanhe aqui todos os detalhes do seu investimento em tokens AGD"
              : "Você ainda não possui investimentos registrados"}
          </p>
        </div>

        {hasInvestment ? (
          <>
            {/* Investment Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {depositValue.toLocaleString("pt-BR")}</div>
                  <p className="text-xs text-muted-foreground">
                    {userProfile.contract_generated_successfully ? "Investimento confirmado" : "Aguardando confirmação"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pacote</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile.package_type}</div>
                  <p className="text-xs text-muted-foreground">Vesting: {userProfile.vesting_period} meses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProfile.contract_generated_successfully ? (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userProfile.contract_generated_successfully
                      ? "Contrato gerado e enviado por e-mail"
                      : "Aguardando contrato"}
                  </p>
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
                        {userProfile.first_name} {userProfile.last_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">CPF:</span>
                      <p className="font-medium">{maskCPF(userProfile.cpf || "")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{userProfile.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">WhatsApp:</span>
                      <p className="font-medium">{maskPhone(userProfile.whatsapp || "")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">RG:</span>
                      <p className="font-medium">{maskRG(userProfile.rg || "")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ID do Usuário:</span>
                      <p className="font-medium">#{userProfile.id}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Detalhes do Pacote:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Cliff:</span>
                        <p className="font-medium">{userProfile.cliff_period} meses</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Vesting:</span>
                        <p className="font-medium">{userProfile.vesting_period} meses</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bônus:</span>
                        <p className="font-medium">{userProfile.bonus_percentage}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tokens Base:</span>
                        <p className="font-medium">{Math.floor(depositValue)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status do Contrato:</span>
                      <Badge variant={userProfile.contract_generated_successfully ? "default" : "secondary"}>
                        {userProfile.contract_generated_successfully ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Gerado
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Pendente
                          </>
                        )}
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
                    Pedir resgate e cancelar investimento
                  </Button>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Próximos Passos:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {!userProfile.contract_generated_successfully && <li>• Aguarde a geração do contrato</li>}
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
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Cadastro Realizado</p>
                      <p className="text-sm text-gray-500">Conta criada com sucesso</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        depositValue > 0 ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {depositValue > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${depositValue > 0 ? "" : "text-gray-500"}`}>Investimento Realizado</p>
                      <p className="text-sm text-gray-500">
                        {depositValue > 0
                          ? `R$ ${depositValue.toLocaleString("pt-BR")} investidos`
                          : "Aguardando investimento"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        userProfile.contract_generated_successfully ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {userProfile.contract_generated_successfully ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${userProfile.contract_generated_successfully ? "" : "text-gray-500"}`}
                      >
                        Contrato Gerado
                      </p>
                      <p className="text-sm text-gray-500">
                        {userProfile.contract_generated_successfully
                          ? "Documento disponível para download"
                          : "Aguardando geração do contrato"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Início do Vesting</p>
                      <p className="text-sm text-gray-400">Aguardando início do período</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Tokens Disponíveis</p>
                      <p className="text-sm text-gray-400">Após período de vesting</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* No Investment State */
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum investimento encontrado</h3>
              <p className="text-gray-600 mb-6">
                Você ainda não possui investimentos em tokens AGD. Que tal começar agora?
              </p>
              <Button
                onClick={() => {
                  // Redirecionar para a página principal com dados pré-preenchidos
                  const params = new URLSearchParams({
                    prefill: "true",
                    name: `${userProfile.first_name} ${userProfile.last_name}`,
                    email: userProfile.email,
                    cpf: userProfile.cpf,
                    phone: userProfile.whatsapp || "",
                    rg: userProfile.rg || "",
                    user_id: userProfile.id.toString(),
                  })

                  window.opener?.postMessage(
                    {
                      type: "PREFILL_INVESTMENT_DATA",
                      data: {
                        name: `${userProfile.first_name} ${userProfile.last_name}`,
                        email: userProfile.email,
                        cpf: userProfile.cpf,
                        phone: userProfile.whatsapp || "",
                        rg: userProfile.rg || "",
                        user_id: userProfile.id,
                      },
                    },
                    "*",
                  )

                  // Focar na janela principal
                  window.opener?.focus()

                  // Fechar esta janela
                  window.close()
                }}
              >
                Fazer Investimento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
