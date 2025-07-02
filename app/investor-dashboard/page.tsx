"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Copy,
  DollarSign,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  Shield,
  Sprout,
  User,
  Wallet,
} from "lucide-react"

import { maskCPF, maskPhone, maskRG } from "@/utils/input-masks"

type PaymentDetails =
  | {
      method: "PIX"
      value: number
      currency: "BRL"
    }
  | {
      method: "Criptomoeda"
      value: number
      currency: string
      cryptoName: string
    }

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  whatsapp: string | null
  cpf: string
  rg: string | null
  // investment data
  investment_date: string
  package_type: string
  tokens_amount: string
  vesting_period: number
  cliff_period: number
  bonus_percentage: number
  payment_type: "pix" | "crypto" | "none"
  total_deposit_value: number
  payment_details: PaymentDetails
  contract_generated_successfully: boolean
}

export default function InvestorDashboard() {
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  /* -- Withdraw (PIX) -- */
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  /* -- Withdraw (Crypto) -- */
  const [showCryptoWithdrawModal, setShowCryptoWithdrawModal] = useState(false)
  const [cryptoWithdrawLoading, setCryptoWithdrawLoading] = useState(false)
  const [cryptoWithdrawSuccess, setCryptoWithdrawSuccess] = useState(false)
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [cryptoNetwork, setCryptoNetwork] = useState("")

  /* -- Contract Generation -- */
  const [contractGenerating, setContractGenerating] = useState(false)
  const [contractGenerated, setContractGenerated] = useState(false)
  const [contractDownloadUrl, setContractDownloadUrl] = useState("")

  /* -- URL Params -- */
  const cpf = searchParams.get("cpf") ?? ""
  const token = searchParams.get("token") ?? ""
  const userId = searchParams.get("user_id") ?? ""

  /* ───────────── Fetch user profile ───────────── */
  useEffect(() => {
    if (cpf) fetchUserProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpf])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await fetch(`/api/get-user-profile?cpf=${cpf}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Erro ao carregar dados.")
        return
      }

      const data = await res.json()

      const depositValue = Number.parseFloat(data.deposit_value || "0")
      const depositCryptoValue = Number.parseFloat(data.deposit_crypto_value || "0")
      const depositCryptoName = data.deposit_crypto_name

      let payment_type: UserProfile["payment_type"] = "none"
      let total_deposit_value = 0
      let payment_details: PaymentDetails = {
        method: "PIX",
        value: 0,
        currency: "BRL",
      }

      if (depositValue > 0) {
        payment_type = "pix"
        total_deposit_value = depositValue
        payment_details = { method: "PIX", value: depositValue, currency: "BRL" }
      } else if (depositCryptoValue > 0 && depositCryptoName) {
        payment_type = "crypto"
        total_deposit_value = depositCryptoValue
        payment_details = {
          method: "Criptomoeda",
          value: depositCryptoValue,
          currency: depositCryptoName,
          cryptoName: depositCryptoName,
        }
      }

      /* calc package + tokens */
      const pkg = getPackageInfo(total_deposit_value)

      setUserProfile({
        ...data,
        investment_date: new Date().toISOString(),
        package_type: pkg.name,
        tokens_amount: calculateTokens(total_deposit_value, pkg.bonus),
        vesting_period: pkg.vesting,
        cliff_period: pkg.cliff,
        bonus_percentage: pkg.bonus,
        payment_type,
        total_deposit_value,
        payment_details,
        contract_generated_successfully: data.contract_generated_successfully ?? false,
      })
    } catch (err) {
      console.error(err)
      setError("Erro de conexão ao carregar dados do investimento.")
    } finally {
      setLoading(false)
    }
  }

  /* ───────────── Helpers ───────────── */
  const getPackageInfo = (value: number) => {
    if (value >= 100000) return { name: "Institucional", bonus: 35, cliff: 6, vesting: 36 }
    if (value >= 20000) return { name: "Agro Whale", bonus: 30, cliff: 6, vesting: 36 }
    if (value >= 5000) return { name: "Agro Elite", bonus: 25, cliff: 6, vesting: 24 }
    if (value >= 1000) return { name: "Agro Master", bonus: 15, cliff: 3, vesting: 24 }
    if (value >= 250) return { name: "AgroDeri+", bonus: 10, cliff: 0, vesting: 18 }
    return { name: "Raiz do Agro", bonus: 5, cliff: 0, vesting: 12 }
  }

  const calculateTokens = (value: number, bonus: number) => {
    const base = value
    const extra = (base * bonus) / 100
    return Math.floor(base + extra).toString()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copiado para a área de transferência!")
    })
  }

  /* ───────────── Actions ───────────── */
  const handleLogout = () => window.close()
  const handleRefresh = () => fetchUserProfile()

  const handleWithdrawRequest = async () => {
    try {
      setWithdrawLoading(true)
      const res = await fetch("/api/request-withdraw/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: userProfile?.cpf,
          value: userProfile?.total_deposit_value,
          pixKey: userProfile?.cpf,
        }),
      })

      const result = await res.json()
      if (result.success) setWithdrawSuccess(true)
      else alert(result.error || "Erro desconhecido")
    } catch (err) {
      console.error(err)
      alert("Erro de conexão ao solicitar resgate.")
    } finally {
      setWithdrawLoading(false)
    }
  }

  const handleCryptoWithdrawRequest = async () => {
    if (!cryptoAddress.trim()) return alert("Endereço da carteira é obrigatório")
    if (!cryptoNetwork.trim()) return alert("Rede é obrigatória")

    try {
      setCryptoWithdrawLoading(true)
      const res = await fetch("/api/request-crypto-withdraw/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: userProfile?.cpf,
          address: cryptoAddress.trim(),
          coin: (userProfile?.payment_details as any)?.cryptoName,
          amount: userProfile?.total_deposit_value,
          network: cryptoNetwork.trim(),
        }),
      })

      const result = await res.json()
      if (result.success) setCryptoWithdrawSuccess(true)
      else alert(result.error || "Erro desconhecido")
    } catch (err) {
      console.error(err)
      alert("Erro de conexão ao solicitar resgate crypto.")
    } finally {
      setCryptoWithdrawLoading(false)
    }
  }

  const redirectToInvestment = () => {
    // Preparar dados para preencher automaticamente o formulário de investimento
    if (userProfile) {
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
    }
  }

  /* ───────────── Render helpers ───────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userProfile) return null

  const hasInvestment = userProfile.total_deposit_value > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ------------- Header ------------- */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold">AgroDeri</span>
            <Badge variant="secondary" className="ml-2">
              Área do Investidor
            </Badge>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ------------- Welcome ------------- */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bem-vindo, {userProfile.first_name}!</h1>
          <p className="text-gray-600">
            {hasInvestment
              ? "Acompanhe os detalhes do seu investimento em tokens AGD."
              : "Você ainda não possui investimentos registrados."}
          </p>
        </div>

        {/* ------------- Investment Overview ------------- */}
        {hasInvestment && (
          <>
            {/* --- Stat cards --- */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Valor investido */}
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
                        {userProfile.total_deposit_value.toLocaleString()}{" "}
                        {(userProfile.payment_details as any).currency}
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

              {/* Pacote */}
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

              {/* Status */}
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
                    {userProfile.contract_generated_successfully ? "Contrato gerado" : "Aguardando contrato"}
                  </p>
                </CardContent>
              </Card>

              {/* Método */}
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
                    <p className="text-xs text-muted-foreground">{(userProfile.payment_details as any).cryptoName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Valor:{" "}
                    {userProfile.payment_type === "crypto"
                      ? `${userProfile.total_deposit_value} ${(userProfile.payment_details as any).currency}`
                      : `R$ ${userProfile.total_deposit_value.toLocaleString("pt-BR")}`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ------------- Details + Actions ------------- */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Investor details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Detalhes do Investimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Personal */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nome:</span>
                      <p className="font-medium">
                        {userProfile.first_name} {userProfile.last_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">CPF:</span>
                      <p className="font-medium">{maskCPF(userProfile.cpf)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{userProfile.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">WhatsApp:</span>
                      <p className="font-medium">{maskPhone(userProfile.whatsapp ?? "")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">RG:</span>
                      <p className="font-medium">{maskRG(userProfile.rg ?? "")}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ID do Usuário:</span>
                      <p className="font-medium">#{userProfile.id}</p>
                    </div>
                  </div>

                  {/* Payment details */}
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
                              ? `${userProfile.total_deposit_value} ${(userProfile.payment_details as any).currency}`
                              : `R$ ${userProfile.total_deposit_value.toLocaleString("pt-BR")}`}
                          </p>
                        </div>
                        {userProfile.payment_type === "crypto" && (
                          <div>
                            <span className="text-gray-500">Criptomoeda:</span>
                            <p className="font-medium">{(userProfile.payment_details as any).cryptoName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Package */}
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

                  {/* Contract status */}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-gray-500">Status do Contrato:</span>
                    <Badge
                      variant={
                        userProfile.contract_generated_successfully || contractGenerated ? "default" : "secondary"
                      }
                    >
                      {userProfile.contract_generated_successfully || contractGenerated ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Gerado
                        </>
                      ) : (
                        <>
                          <Clock className="mr-1 h-3 w-3" /> Pronto para gerar
                        </>
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Ações Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Generate contract */}
                  {hasInvestment && !userProfile.contract_generated_successfully && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={async () => {
                        try {
                          setContractGenerating(true)
                          const res = await fetch("/api/create-contract-document/", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userData: {
                                name: `${userProfile.first_name} ${userProfile.last_name}`,
                                email: userProfile.email,
                                cpf: maskCPF(userProfile.cpf),
                                rg: userProfile.rg,
                                phone: userProfile.whatsapp,
                              },
                              amount: userProfile.total_deposit_value,
                            }),
                          })
                          const result = await res.json()
                          if (result.success) {
                            setContractGenerated(true)
                            setContractDownloadUrl(result.contract.downloadUrl)
                            alert("Contrato gerado com sucesso!")
                          } else {
                            alert(result.error || "Erro desconhecido")
                          }
                        } catch (err) {
                          console.error(err)
                          alert("Erro de conexão ao gerar contrato")
                        } finally {
                          setContractGenerating(false)
                        }
                      }}
                      disabled={contractGenerating}
                    >
                      {contractGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando…
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" /> Gerar Contrato
                        </>
                      )}
                    </Button>
                  )}

                  {/* Download contract */}
                  {(userProfile.contract_generated_successfully || contractGenerated) && contractDownloadUrl && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => window.open(contractDownloadUrl, "_blank")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3M6 14V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 11.414V19a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                        />
                      </svg>
                      Baixar Contrato
                    </Button>
                  )}

                  {/* Withdraw buttons */}
                  {userProfile.payment_type === "crypto" ? (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setShowCryptoWithdrawModal(true)}
                    >
                      <Wallet className="mr-2 h-4 w-4" /> Pedir resgate em{" "}
                      {(userProfile.payment_details as any).cryptoName}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setShowWithdrawModal(true)}
                    >
                      <DollarSign className="mr-2 h-4 w-4" /> Pedir resgate via PIX
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* ------------- No investment state ------------- */}
        {!hasInvestment && (
          <Card className="text-center">
            <CardContent className="p-8 space-y-4">
              <div className="text-6xl">📊</div>
              <h3 className="text-xl font-semibold">Nenhum investimento encontrado</h3>
              <p className="text-gray-600 mb-6">Você ainda não possui investimentos em tokens AGD.</p>
              <Button onClick={redirectToInvestment} className="bg-green-600 hover:bg-green-700 text-white">
                Fazer Investimento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ---------- PIX withdraw modal ---------- */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">⚠️ Confirmar Resgate PIX</CardTitle>
              <CardDescription className="text-center">
                Tem certeza que deseja cancelar seu investimento?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {withdrawSuccess ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-6xl">✅</div>
                    <p className="text-green-600 font-semibold">Resgate solicitado com sucesso!</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowWithdrawModal(false)
                      setWithdrawSuccess(false)
                    }}
                  >
                    Fechar
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                    Esta ação irá cancelar permanentemente seu investimento.
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowWithdrawModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 text-white hover:bg-red-700"
                      disabled={withdrawLoading}
                      onClick={handleWithdrawRequest}
                    >
                      {withdrawLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando…
                        </>
                      ) : (
                        "Confirmar"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ---------- Crypto withdraw modal ---------- */}
      {showCryptoWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-center text-orange-600 flex items-center gap-2 justify-center">
                <Wallet className="h-6 w-6" /> Resgate em {(userProfile.payment_details as any).cryptoName}
              </CardTitle>
              <CardDescription className="text-center">Informe o endereço da sua carteira e a rede.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cryptoWithdrawSuccess ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="text-6xl">🪙</div>
                    <p className="text-green-600 font-semibold">Resgate crypto solicitado!</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowCryptoWithdrawModal(false)
                      setCryptoWithdrawSuccess(false)
                      setCryptoAddress("")
                      setCryptoNetwork("")
                    }}
                  >
                    Fechar
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="crypto-address">Endereço da Carteira *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="crypto-address"
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder={`Endereço ${(userProfile.payment_details as any).cryptoName}`}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            setCryptoAddress(await navigator.clipboard.readText())
                          } catch {
                            /* no-op */
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="crypto-network">Rede *</Label>
                    <Input
                      id="crypto-network"
                      value={cryptoNetwork}
                      onChange={(e) => setCryptoNetwork(e.target.value)}
                      placeholder="Ex: TRC20, ERC20, BEP20, Bitcoin, etc."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowCryptoWithdrawModal(false)}
                      disabled={cryptoWithdrawLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                      disabled={cryptoWithdrawLoading || !cryptoAddress.trim() || !cryptoNetwork.trim()}
                      onClick={handleCryptoWithdrawRequest}
                    >
                      {cryptoWithdrawLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando…
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" /> Confirmar
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
