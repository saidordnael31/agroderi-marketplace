"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Coins,
  Wallet,
  Copy,
} from "lucide-react"
import { maskCPF, maskPhone, maskRG } from "@/utils/input-masks"

export default function InvestorDashboard() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [error, setError] = useState("")
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [contractGenerating, setContractGenerating] = useState(false)
  const [contractGenerated, setContractGenerated] = useState(false)
  const [contractDownloadUrl, setContractDownloadUrl] = useState("")

  // Estados para resgate crypto
  const [showCryptoWithdrawModal, setShowCryptoWithdrawModal] = useState(false)
  const [cryptoWithdrawLoading, setCryptoWithdrawLoading] = useState(false)
  const [cryptoWithdrawSuccess, setCryptoWithdrawSuccess] = useState(false)
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [cryptoNetwork, setCryptoNetwork] = useState("")

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

        // Determinar tipo de depósito e valor
        const depositValue = Number.parseFloat(profileData.deposit_value || "0")
        const depositCryptoValue = Number.parseFloat(profileData.deposit_crypto_value || "0")
        const depositCryptoName = profileData.deposit_crypto_name

        console.log("💰 Depósito PIX:", depositValue)
        console.log("🪙 Depósito Crypto:", depositCryptoValue, depositCryptoName)

        // Determinar qual tipo de depósito foi feito
        let paymentType = "none"
        let totalDepositValue = 0
        let paymentDetails = {}

        if (depositValue > 0) {
          paymentType = "pix"
          totalDepositValue = depositValue
          paymentDetails = {
            method: "PIX",
            value: depositValue,
            currency: "BRL",
          }
        } else if (depositCryptoValue > 0 && depositCryptoName) {
          paymentType = "crypto"
          totalDepositValue = depositCryptoValue
          paymentDetails = {
            method: "Criptomoeda",
            value: depositCryptoValue,
            currency: depositCryptoName,
            cryptoName: depositCryptoName,
          }
        }

        console.log("💳 Tipo de pagamento detectado:", paymentType)
        console.log("💰 Valor total do depósito:", totalDepositValue)

        // Calcular informações adicionais baseadas nos dados
        const packageInfo = getPackageInfo(totalDepositValue)

        setUserProfile({
          ...profileData,
          investment_date: new Date().toISOString(), // Por enquanto usar data atual
          package_type: packageInfo.name,
          tokens_amount: calculateTokens(totalDepositValue, packageInfo.bonus),
          vesting_period: packageInfo.vesting,
          cliff_period: packageInfo.cliff,
          bonus_percentage: packageInfo.bonus,
          // Adicionar informações de pagamento
          payment_type: paymentType,
          total_deposit_value: totalDepositValue,
          payment_details: paymentDetails,
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

  const handleWithdrawRequest = async () => {
    try {
      setWithdrawLoading(true)
      console.log("💰 Solicitando resgate do investimento...")

      const response = await fetch("/api/request-withdraw/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: userProfile.cpf,
          value: userProfile.total_deposit_value, // Usar valor total independente do tipo
          pixKey: userProfile.cpf,
        }),
      })

      console.log("📊 Status da resposta de resgate:", response.status)

      const result = await response.json()
      console.log("📦 Resultado do resgate:", result)

      if (result.success) {
        console.log("✅ Resgate solicitado com sucesso!")
        setWithdrawSuccess(true)
      } else {
        console.error("❌ Erro ao solicitar resgate:", result)
        alert("Erro ao solicitar resgate: " + (result.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("💥 Erro na solicitação de resgate:", error)
      alert("Erro de conexão ao solicitar resgate. Tente novamente.")
    } finally {
      setWithdrawLoading(false)
    }
  }

  const handleCryptoWithdrawRequest = async () => {
    try {
      setCryptoWithdrawLoading(true)
      console.log("🪙 Solicitando resgate crypto...")

      // Validar campos
      if (!cryptoAddress.trim()) {
        alert("Por favor, insira o endereço da carteira")
        return
      }

      if (!cryptoNetwork.trim()) {
        alert("Por favor, selecione a rede")
        return
      }

      const response = await fetch("/api/request-crypto-withdraw/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: userProfile.cpf,
          address: cryptoAddress.trim(),
          coin: userProfile.payment_details.cryptoName,
          amount: userProfile.total_deposit_value,
          network: cryptoNetwork,
        }),
      })

      console.log("📊 Status da resposta de resgate crypto:", response.status)

      const result = await response.json()
      console.log("📦 Resultado do resgate crypto:", result)

      if (result.success) {
        console.log("✅ Resgate crypto solicitado com sucesso!")
        setCryptoWithdrawSuccess(true)
      } else {
        console.error("❌ Erro ao solicitar resgate crypto:", result)
        alert("Erro ao solicitar resgate: " + (result.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("💥 Erro na solicitação de resgate crypto:", error)
      alert("Erro de conexão ao solicitar resgate. Tente novamente.")
    } finally {
      setCryptoWithdrawLoading(false)
    }
  }

  const handleGenerateContract = async () => {
    try {
      setContractGenerating(true)
      console.log("📄 Gerando contrato para usuário existente...")

      const response = await fetch("/api/create-contract-document/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: {
            name: `${userProfile.first_name} ${userProfile.last_name}`,
            email: userProfile.email,
            cpf: maskCPF(userProfile.cpf),
            rg: userProfile.rg,
            phone: userProfile.whatsapp,
          },
          amount: userProfile.total_deposit_value, // Usar valor total
        }),
      })

      console.log("📊 Status da resposta de geração de contrato:", response.status)

      const result = await response.json()
      console.log("📦 Resultado da geração de contrato:", result)

      if (result.success) {
        console.log("✅ Contrato gerado com sucesso!")
        setContractGenerated(true)

        if (result.contract && result.contract.downloadUrl) {
          setContractDownloadUrl(result.contract.downloadUrl)
        }

        // Atualizar o perfil do usuário para refletir que o contrato foi gerado
        setUserProfile((prev) => ({
          ...prev,
          contract_generated_successfully: true,
        }))

        alert("Contrato gerado com sucesso! Você pode baixá-lo agora.")
      } else {
        console.error("❌ Erro ao gerar contrato:", result)
        alert("Erro ao gerar contrato: " + (result.error || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("💥 Erro na geração de contrato:", error)
      alert("Erro de conexão ao gerar contrato. Tente novamente.")
    } finally {
      setContractGenerating(false)
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copiado para a área de transferência!")
  }

  const resetCryptoWithdrawModal = () => {
    setCryptoAddress("")
    setCryptoNetwork("")
    setCryptoWithdrawSuccess(false)
    setShowCryptoWithdrawModal(false)
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
              <Button onClick={handleRefresh} variant="outline" className="w-full bg-transparent">
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

  const hasInvestment = userProfile.total_deposit_value > 0

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
                  {userProfile.payment_type === "crypto" ? (
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userProfile.payment_type === "crypto" ? (
                      <>
                        {userProfile.total_deposit_value.toLocaleString()} {userProfile.payment_details.currency}
                        <div className="text-sm text-gray-500 font-normal">
                          ≈ R$ {userProfile.total_deposit_value.toLocaleString("pt-BR")}
                        </div>
                      </>
                    ) : (
                      `R$ ${userProfile.total_deposit_value.toLocaleString("pt-BR")}`
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={userProfile.payment_type === "crypto" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {userProfile.payment_details.method}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {userProfile.contract_generated_successfully
                        ? "Investimento confirmado"
                        : "Aguardando confirmação"}
                    </p>
                  </div>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Método de Pagamento</CardTitle>
                  {userProfile.payment_type === "crypto" ? (
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{userProfile.payment_details.method}</div>
                  {userProfile.payment_type === "crypto" && (
                    <p className="text-xs text-muted-foreground">{userProfile.payment_details.cryptoName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Valor:{" "}
                    {userProfile.payment_type === "crypto"
                      ? `${userProfile.total_deposit_value} ${userProfile.payment_details.currency}`
                      : `R$ ${userProfile.total_deposit_value.toLocaleString("pt-BR")}`}
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

                  {/* Detalhes do Pagamento */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Detalhes do Pagamento:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Método:</span>
                          <p className="font-medium">{userProfile.payment_details.method}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor:</span>
                          <p className="font-medium">
                            {userProfile.payment_type === "crypto"
                              ? `${userProfile.total_deposit_value} ${userProfile.payment_details.currency}`
                              : `R$ ${userProfile.total_deposit_value.toLocaleString("pt-BR")}`}
                          </p>
                        </div>
                        {userProfile.payment_type === "crypto" && (
                          <>
                            <div>
                              <span className="text-gray-500">Criptomoeda:</span>
                              <p className="font-medium">{userProfile.payment_details.cryptoName}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Equivalente:</span>
                              <p className="font-medium">
                                R$ {userProfile.total_deposit_value.toLocaleString("pt-BR")}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
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
                        <p className="font-medium">{Math.floor(userProfile.total_deposit_value)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status do Contrato:</span>
                      <Badge
                        variant={
                          userProfile.contract_generated_successfully || contractGenerated ? "default" : "secondary"
                        }
                      >
                        {userProfile.contract_generated_successfully || contractGenerated ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Gerado
                          </>
                        ) : hasInvestment ? (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Pronto para gerar
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Aguardando investimento
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
                  {/* Botão de Gerar Contrato - só aparece se tem investimento mas não tem contrato */}
                  {hasInvestment && !userProfile.contract_generated_successfully && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleGenerateContract}
                      disabled={contractGenerating}
                    >
                      {contractGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando contrato...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Gerar Contrato de Investimento
                        </>
                      )}
                    </Button>
                  )}

                  {/* Botão de Download - só aparece se o contrato foi gerado */}
                  {(userProfile.contract_generated_successfully || contractGenerated) && contractDownloadUrl && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => window.open(contractDownloadUrl, "_blank")}
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Baixar Contrato (DOCX)
                    </Button>
                  )}

                  {/* Botões de Resgate - diferentes para PIX e Crypto */}
                  {userProfile.payment_type === "crypto" ? (
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={() => setShowCryptoWithdrawModal(true)}
                      disabled={!hasInvestment}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Pedir resgate em {userProfile.payment_details.cryptoName}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      onClick={() => setShowWithdrawModal(true)}
                      disabled={!hasInvestment}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Pedir resgate via PIX
                    </Button>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Próximos Passos:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {!userProfile.contract_generated_successfully && !contractGenerated && hasInvestment && (
                        <li>• Gere seu contrato de investimento</li>
                      )}
                      {!userProfile.contract_generated_successfully && !contractGenerated && !hasInvestment && (
                        <li>• Aguarde a confirmação do pagamento</li>
                      )}
                      {(userProfile.contract_generated_successfully || contractGenerated) && (
                        <li>• ✅ Contrato gerado e disponível para download</li>
                      )}
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
                        userProfile.total_deposit_value > 0 ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {userProfile.total_deposit_value > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${userProfile.total_deposit_value > 0 ? "" : "text-gray-500"}`}>
                        Investimento Realizado
                      </p>
                      <p className="text-sm text-gray-500">
                        {userProfile.total_deposit_value > 0
                          ? `${userProfile.payment_details.method}: ${
                              userProfile.payment_type === "crypto"
                                ? `${userProfile.total_deposit_value} ${userProfile.payment_details.currency}`
                                : `R$ ${userProfile.total_deposit_value.toLocaleString("pt-BR")}`
                            }`
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

      {/* Modal de Confirmação de Resgate PIX */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl text-center text-red-600">⚠️ Confirmar Resgate PIX</CardTitle>
              <CardDescription className="text-center">
                Tem certeza que deseja cancelar seu investimento e solicitar o resgate via PIX?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {withdrawSuccess ? (
                <div className="text-center space-y-4">
                  <div className="text-6xl">✅</div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 mb-2">Resgate Solicitado com Sucesso!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Seu reembolso será processado e o pagamento será enviado para a chave PIX registrada no seu CPF.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Valor:</strong> R$ {userProfile.total_deposit_value.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Chave PIX:</strong> {userProfile?.cpf}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setShowWithdrawModal(false)
                      setWithdrawSuccess(false)
                      // Atualizar dados do usuário
                      fetchUserProfile()
                    }}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">⚠️</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 mb-1">Atenção!</p>
                        <p className="text-yellow-700">
                          Esta ação irá cancelar permanentemente seu investimento em tokens AGD. O valor será devolvido
                          via PIX para a chave registrada no seu CPF.
                        </p>
                      </div>
                    </div>
                  </div>

                  {userProfile && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Detalhes do Resgate:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor a ser devolvido:</span>
                          <span className="font-medium">
                            R$ {userProfile.total_deposit_value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chave PIX:</span>
                          <span className="font-medium">{userProfile.cpf}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Método original:</span>
                          <span className="font-medium">{userProfile.payment_details.method}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowWithdrawModal(false)}
                      className="flex-1"
                      disabled={withdrawLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleWithdrawRequest}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={withdrawLoading}
                    >
                      {withdrawLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Confirmar Resgate"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Resgate Crypto */}
      {showCryptoWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-xl text-center text-orange-600">
                <Wallet className="inline mr-2 h-6 w-6" />
                Resgate em {userProfile?.payment_details?.cryptoName}
              </CardTitle>
              <CardDescription className="text-center">
                Informe o endereço da sua carteira para receber o resgate em criptomoeda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cryptoWithdrawSuccess ? (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🪙</div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 mb-2">Resgate Crypto Solicitado!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Seu resgate em {userProfile?.payment_details?.cryptoName} foi solicitado com sucesso e será
                      processado em breve.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                      <p className="text-sm text-blue-800">
                        <strong>Valor:</strong> {userProfile?.total_deposit_value}{" "}
                        {userProfile?.payment_details?.currency}
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Endereço:</strong>
                        <span className="font-mono text-xs break-all">{cryptoAddress}</span>
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Rede:</strong> {cryptoNetwork}
                      </p>
                    </div>
                  </div>
                  <Button onClick={resetCryptoWithdrawModal} className="w-full">
                    Fechar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                        <Coins className="text-white h-3 w-3" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-orange-800 mb-1">Resgate em Criptomoeda</p>
                        <p className="text-orange-700">
                          Você receberá {userProfile?.total_deposit_value} {userProfile?.payment_details?.cryptoName} no
                          endereço informado. Verifique cuidadosamente o endereço e a rede antes de confirmar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="crypto-address">Endereço da Carteira *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="crypto-address"
                          placeholder={`Endereço da sua carteira ${userProfile?.payment_details?.cryptoName}`}
                          value={cryptoAddress}
                          onChange={(e) => setCryptoAddress(e.target.value)}
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            try {
                              const text = await navigator.clipboard.readText()
                              setCryptoAddress(text)
                            } catch (err) {
                              console.error("Erro ao colar:", err)
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Cole o endereço da sua carteira {userProfile?.payment_details?.cryptoName}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="crypto-network">Rede *</Label>
                      <Input
                        id="crypto-network"
                        placeholder="Ex: TRC20, ERC20, BEP20, Bitcoin, etc."
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Digite a rede correta para evitar perda de fundos (Ex: TRC20 para Tron, ERC20 para Ethereum)
                      </p>
                    </div>

                    {userProfile && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Resumo do Resgate:</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Criptomoeda:</span>
                            <span className="font-medium">{userProfile.payment_details.cryptoName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor:</span>
                            <span className="font-medium">
                              {userProfile.total_deposit_value} {userProfile.payment_details.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Equivalente:</span>
                            <span className="font-medium">
                              R$ {userProfile.total_deposit_value.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={resetCryptoWithdrawModal}
                      className="flex-1 bg-transparent"
                      disabled={cryptoWithdrawLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCryptoWithdrawRequest}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      disabled={cryptoWithdrawLoading || !cryptoAddress.trim() || !cryptoNetwork}
                    >
                      {cryptoWithdrawLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Confirmar Resgate
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
