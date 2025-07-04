"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle, BarChart3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface Investment {
  id: string
  amount: number
  tokens: number
  date: string
  status: "active" | "pending" | "completed"
  type: "pix" | "crypto"
  paymentMethod?: string
}

interface WithdrawRequest {
  amount: number
  type: "pix" | "crypto"
  pixKey?: string
  cryptoAddress?: string
  cryptoNetwork?: string
}

export default function InvestorDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawRequest, setWithdrawRequest] = useState<WithdrawRequest>({
    amount: 0,
    type: "pix",
  })
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)

  useEffect(() => {
    fetchUserProfile()
    fetchInvestments()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const email = urlParams.get("email")
      const cpf = urlParams.get("cpf")

      if (!email && !cpf) {
        throw new Error("Email ou CPF não fornecido")
      }

      const response = await fetch("/api/get-user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, cpf }),
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar perfil do usuário")
      }

      const data = await response.json()
      setUserProfile(data.user)
    } catch (error) {
      console.error("Erro ao buscar perfil:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu perfil. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const fetchInvestments = async () => {
    try {
      // Simular busca de investimentos
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Dados simulados - substituir pela API real
      const mockInvestments: Investment[] = [
        {
          id: "1",
          amount: 1000,
          tokens: 100,
          date: "2024-01-15",
          status: "active",
          type: "pix",
          paymentMethod: "PIX",
        },
        {
          id: "2",
          amount: 2500,
          tokens: 250,
          date: "2024-02-20",
          status: "active",
          type: "crypto",
          paymentMethod: "Bitcoin",
        },
      ]

      setInvestments(mockInvestments)
    } catch (error) {
      console.error("Erro ao buscar investimentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawRequest.amount || withdrawRequest.amount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para resgate.",
        variant: "destructive",
      })
      return
    }

    if (withdrawRequest.type === "pix" && !withdrawRequest.pixKey) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave PIX válida.",
        variant: "destructive",
      })
      return
    }

    if (withdrawRequest.type === "crypto" && (!withdrawRequest.cryptoAddress || !withdrawRequest.cryptoNetwork)) {
      toast({
        title: "Erro",
        description: "Por favor, insira o endereço da carteira e a rede.",
        variant: "destructive",
      })
      return
    }

    setSubmittingWithdraw(true)

    try {
      const endpoint = withdrawRequest.type === "pix" ? "/api/request-withdraw" : "/api/request-crypto-withdraw"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: userProfile?.email,
          amount: withdrawRequest.amount,
          ...(withdrawRequest.type === "pix"
            ? { pixKey: withdrawRequest.pixKey }
            : {
                cryptoAddress: withdrawRequest.cryptoAddress,
                cryptoNetwork: withdrawRequest.cryptoNetwork,
              }),
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao processar solicitação de resgate")
      }

      toast({
        title: "Sucesso!",
        description: `Solicitação de resgate via ${withdrawRequest.type.toUpperCase()} enviada com sucesso.`,
      })

      setWithdrawModalOpen(false)
      setWithdrawRequest({ amount: 0, type: "pix" })
    } catch (error) {
      console.error("Erro ao solicitar resgate:", error)
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  const handleInvestmentRedirect = () => {
    if (window.opener) {
      // Enviar dados do usuário para a janela principal
      window.opener.postMessage(
        {
          type: "USER_DATA",
          userData: userProfile,
        },
        "*",
      )

      // Focar na janela principal
      window.opener.focus()

      // Fechar esta janela
      window.close()
    } else {
      // Se não há janela pai, redirecionar na mesma janela
      window.location.href = "/?step=pagamento"
    }
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalTokens = investments.reduce((sum, inv) => sum + inv.tokens, 0)
  const currentValue = totalTokens * 10 // Assumindo R$ 10 por token

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard do Investidor</h1>
              <p className="text-gray-600 mt-1">Bem-vindo, {userProfile?.nome || "Investidor"}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            </div>
          </div>
        </div>

        {investments.length === 0 ? (
          /* No Investments State */
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum investimento encontrado</h3>
            <p className="text-gray-600 mb-6">Você ainda não possui investimentos em tokens AGD.</p>
            <Button
              onClick={handleInvestmentRedirect}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Fazer Investimento
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(totalInvested)}
                  </div>
                  <p className="text-xs text-muted-foreground">Valor total dos seus investimentos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tokens AGD</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTokens.toLocaleString("pt-BR")}</div>
                  <p className="text-xs text-muted-foreground">Quantidade total de tokens</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(currentValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{(((currentValue - totalInvested) / totalInvested) * 100).toFixed(1)}% de valorização
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Investments List */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Seus Investimentos</CardTitle>
                    <CardDescription>Histórico completo dos seus investimentos em tokens AGD</CardDescription>
                  </div>
                  <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <ArrowDownRight className="w-4 h-4 mr-2" />
                        Solicitar Resgate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Solicitar Resgate</DialogTitle>
                        <DialogDescription>
                          Escolha o método de resgate e preencha os dados necessários.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="amount">Valor do Resgate (R$)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0,00"
                            value={withdrawRequest.amount || ""}
                            onChange={(e) =>
                              setWithdrawRequest((prev) => ({
                                ...prev,
                                amount: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="type">Método de Resgate</Label>
                          <Select
                            value={withdrawRequest.type}
                            onValueChange={(value: "pix" | "crypto") =>
                              setWithdrawRequest((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="crypto">Criptomoeda</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {withdrawRequest.type === "pix" && (
                          <div>
                            <Label htmlFor="pixKey">Chave PIX</Label>
                            <Input
                              id="pixKey"
                              placeholder="Digite sua chave PIX"
                              value={withdrawRequest.pixKey || ""}
                              onChange={(e) =>
                                setWithdrawRequest((prev) => ({
                                  ...prev,
                                  pixKey: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}

                        {withdrawRequest.type === "crypto" && (
                          <>
                            <div>
                              <Label htmlFor="cryptoNetwork">Rede da Criptomoeda</Label>
                              <Input
                                id="cryptoNetwork"
                                placeholder="Ex: Bitcoin, Ethereum, Polygon, BSC, Solana..."
                                value={withdrawRequest.cryptoNetwork || ""}
                                onChange={(e) =>
                                  setWithdrawRequest((prev) => ({
                                    ...prev,
                                    cryptoNetwork: e.target.value,
                                  }))
                                }
                              />
                              <p className="text-xs text-gray-500 mt-1">Digite o nome da rede blockchain desejada</p>
                            </div>
                            <div>
                              <Label htmlFor="cryptoAddress">Endereço da Carteira</Label>
                              <Textarea
                                id="cryptoAddress"
                                placeholder="Digite o endereço da sua carteira"
                                value={withdrawRequest.cryptoAddress || ""}
                                onChange={(e) =>
                                  setWithdrawRequest((prev) => ({
                                    ...prev,
                                    cryptoAddress: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </>
                        )}

                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {withdrawRequest.type === "pix"
                              ? "Verifique se a chave PIX está correta. O valor será transferido em até 24 horas."
                              : "Verifique se o endereço e a rede estão corretos. Transações em blockchain são irreversíveis."}
                          </AlertDescription>
                        </Alert>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setWithdrawModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button className="flex-1" onClick={handleWithdraw} disabled={submittingWithdraw}>
                            {submittingWithdraw ? "Processando..." : "Confirmar Resgate"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{investment.tokens.toLocaleString("pt-BR")} Tokens AGD</p>
                          <p className="text-sm text-gray-500">
                            {new Date(investment.date).toLocaleDateString("pt-BR")} • {investment.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(investment.amount)}
                        </p>
                        <Badge
                          variant={investment.status === "active" ? "default" : "secondary"}
                          className={investment.status === "active" ? "bg-green-100 text-green-800" : ""}
                        >
                          {investment.status === "active" ? "Ativo" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>Seus dados cadastrais e informações de contato</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
                    <p className="mt-1">{userProfile?.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="mt-1">{userProfile?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">CPF</Label>
                    <p className="mt-1">{userProfile?.cpf}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                    <p className="mt-1">{userProfile?.telefone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
