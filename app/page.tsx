"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Sprout,
  TrendingUp,
  Crown,
  CheckCircle,
  Star,
  Gift,
  Zap,
  Play,
  ArrowDown,
  Shield,
  Target,
  Coins,
  BarChart3,
  Loader2,
  ArrowRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react"
import { maskCPF, maskRG, maskPhone, maskDate, validateDate, unmaskValue } from "@/utils/input-masks"
import { AVAILABLE_CRYPTOS } from "@/utils/crypto-list"

export default function AgroDeriLanding() {
  const [showCheckout, setShowCheckout] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState("")
  const [amount, setAmount] = useState(0)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    birthday: "",
    password: "",
    confirmPassword: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("pix")
  const [loading, setLoading] = useState(false)
  const [pixCode, setPixCode] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [paymentString, setPaymentString] = useState("")
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)
  // Adicionar novos estados após os estados existentes
  const [contractCreated, setContractCreated] = useState(false)
  const [contractData, setContractData] = useState(null)
  const [documentIdClicksign, setDocumentIdClicksign] = useState("")
  const [contractDownloadUrl, setContractDownloadUrl] = useState("")
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    birthday: "",
    amount: "",
    password: "",
    confirmPassword: "",
  })
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [showAllCryptos, setShowAllCryptos] = useState(false)

  const checkoutRef = useRef<HTMLDivElement>(null)
  const qrCodeRef = useRef<HTMLCanvasElement>(null)

  const [showPassword, setShowConfirmPassword] = useState(false)
  const [showConfirmPassword, setShowPassword] = useState(false)

  const packages = [
    {
      id: "starter",
      name: "Raiz do Agro",
      minValue: 50,
      maxValue: 249,
      cliff: 0,
      vesting: 12,
      bonus: "5% em AGD",
      features: ["Tokens AGD proporcionais", "Grupo WhatsApp oficial", "Alertas de mercado", "Campanhas da comunidade"],
      color: "green",
    },
    {
      id: "plus",
      name: "AgroDeri+",
      minValue: 250,
      maxValue: 999,
      cliff: 0,
      vesting: 18,
      bonus: "10% em AGD",
      features: [
        "Tudo do pacote anterior",
        "Acesso antecipado staking",
        "NFT investidor pioneiro",
        "5% desconto próxima rodada",
        "Grupo fechado AgroDeri+",
      ],
      color: "blue",
      popular: true,
    },
    {
      id: "premium",
      name: "Agro Master",
      minValue: 1000,
      maxValue: 4999,
      cliff: 3,
      vesting: 24,
      bonus: "15% em AGD",
      features: [
        "Tokens AGD + 15% bônus",
        "NFT exclusivo Master",
        "Acesso aos fundadores",
        "Staking taxa promocional",
        "Prioridade nas próximas fases",
      ],
      color: "yellow",
    },
    {
      id: "elite",
      name: "Agro Elite",
      minValue: 5000,
      maxValue: 19999,
      cliff: 6,
      vesting: 24,
      bonus: "25% + NFT",
      features: [
        "Tokens AGD + 25% bônus",
        "NFT Elite exclusivo",
        "Reuniões estratégicas",
        "Staking VIP",
        "Acesso antecipado a novos produtos",
      ],
      color: "purple",
    },
    {
      id: "whale",
      name: "Agro Whale",
      minValue: 20000,
      maxValue: 99999,
      cliff: 6,
      vesting: 36,
      bonus: "30% + Staking",
      features: [
        "Tokens AGD + 30% bônus",
        "NFT Whale ultra-raro",
        "Consultoria personalizada",
        "Staking premium",
        "Participação em decisões estratégicas",
      ],
      color: "indigo",
    },
    {
      id: "institutional",
      name: "Institucional",
      minValue: 100000,
      maxValue: 500000,
      cliff: 6,
      vesting: 36,
      bonus: "35% + Staking + NFT VIP",
      features: [
        "Tokens AGD + 35% bônus",
        "NFT VIP institucional",
        "Acesso direto à diretoria",
        "Staking institucional",
        "Participação no conselho consultivo",
      ],
      color: "gray",
    },
  ]

  const steps = ["Pacote", "Dados", "PIX", "Confirmação"]

  // Gerar QR Code PIX real quando chegar no step 2.5
  useEffect(() => {
    if (currentStep === 2.5) {
      generateRealPixCode()
    }
  }, [currentStep, amount, userData.cpf])

  // Adicionar novos estados para o modal de login após os estados existentes:
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginErrors, setLoginErrors] = useState({
    username: "",
    password: "",
    general: "",
  })

  // Modificar a função createContractDocument para usar a nova API
  const createContractDocument = async () => {
    try {
      console.log("📄 Criando contrato completo...")
      setLoading(true)

      const response = await fetch("/api/create-contract-document/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: userData,
          amount: amount,
        }),
      })

      const result = await response.json()
      console.log("📄 Resultado da criação do contrato:", result)

      if (result.success) {
        console.log("✅ Contrato completo criado com sucesso!")
        setContractCreated(true)
        setContractData(result.contract)

        // Extrair IDs importantes da nova resposta
        if (result.contract) {
          if (result.contract.envelope_id) {
            console.log("📋 Envelope ID:", result.contract.envelope_id)
          }
          if (result.contract.document_id) {
            setDocumentIdClicksign(result.contract.document_id)
            console.log("📋 Document ID:", result.contract.document_id)
          }
          if (result.contract.downloadUrl) {
            setContractDownloadUrl(result.contract.downloadUrl)
            console.log("📥 URL de download do contrato:", result.contract.downloadUrl)
          }
        }

        console.log("✅ Processo completo: contrato criado e signatário notificado!")
        return true
      } else {
        console.error("❌ Erro ao criar contrato:", result)
        alert("Erro ao criar contrato: " + (result.error || "Erro desconhecido"))
        return false
      }
    } catch (error) {
      console.error("💥 Erro na criação do contrato:", error)
      alert("Erro de conexão ao criar contrato.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentConfirmation = async () => {
    try {
      setCheckingPayment(true)
      console.log("🔍 Verificando status do pagamento manualmente...")

      const response = await fetch("/api/check-payment-status/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: unmaskValue(userData.cpf),
        }),
      })

      console.log("📊 Status da resposta:", response.status)

      const result = await response.json()
      console.log("📦 Resultado completo:", result)

      if (result.success && result.confirmed) {
        console.log("✅ Pagamento confirmado!")
        setPaymentConfirmed(true)

        // Criar documento de contrato
        const contractSuccess = await createContractDocument()

        if (contractSuccess) {
          // Avançar para tela de confirmação
          setCurrentStep(3)
        }
      } else {
        console.log("❌ Pagamento não confirmado ainda")
        alert("Pagamento ainda não foi identificado. Aguarde alguns minutos e tente novamente.")
      }
    } catch (error) {
      console.error("❌ Erro ao verificar status do pagamento:", error)
      alert("Erro ao verificar pagamento. Tente novamente.")
    } finally {
      setCheckingPayment(false)
    }
  }

  const generateRealPixCode = async () => {
    try {
      setLoading(true)
      console.log("🔄 Gerando PIX real...")

      const response = await fetch("/api/generate-pix/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: amount,
          cpf: unmaskValue(userData.cpf),
        }),
      })

      console.log("📊 Status da resposta:", response.status)

      const result = await response.json()
      console.log("📦 Resposta completa da API PIX:", JSON.stringify(result, null, 2))

      if (response.ok && result.success) {
        console.log("✅ PIX gerado com sucesso!")

        // Verificar se temos QR Code
        if (result.qrCode) {
          console.log("🖼️ QR Code encontrado:", result.qrCode)
          setQrCodeUrl(result.qrCode)
        } else {
          console.log("⚠️ QR Code não encontrado na resposta, gerando fallback...")
          generateFallbackPixCode()
        }

        // Verificar se temos Payment String
        if (result.paymentString) {
          console.log("💳 Payment String encontrada:", result.paymentString.substring(0, 50) + "...")
          setPaymentString(result.paymentString)
        } else {
          console.log("⚠️ Payment String não encontrada na resposta")
          // Usar dados originais se disponível
          if (result.originalData) {
            console.log("🔍 Tentando extrair dados da resposta original...")
            const originalData = result.originalData

            // Tentar diferentes campos possíveis
            const possibleQrFields = ["qrCode", "qr_code", "qr", "qrcode"]
            const possibleStringFields = ["paymentString", "payment_string", "pix_code", "code", "pix"]

            for (const field of possibleQrFields) {
              if (originalData[field]) {
                console.log(`📸 QR Code encontrado em ${field}:`, originalData[field])
                setQrCodeUrl(originalData[field])
                break
              }
            }

            for (const field of possibleStringFields) {
              if (originalData[field]) {
                console.log(`💳 Payment String encontrada em ${field}:`, originalData[field].substring(0, 50) + "...")
                setPaymentString(originalData[field])
                break
              }
            }
          }

          // Se ainda não temos dados, usar fallback
          if (!paymentString) {
            generateFallbackPixCode()
          }
        }
      } else {
        console.error("❌ Erro ao gerar PIX:", result)
        alert("Erro ao gerar PIX: " + (result.error || "Erro desconhecido"))
        generateFallbackPixCode()
      }
    } catch (error) {
      console.error("💥 Erro na geração do PIX:", error)
      alert("Erro de conexão ao gerar PIX. Usando código de exemplo.")
      generateFallbackPixCode()
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackPixCode = () => {
    console.log("🔄 Gerando PIX de fallback...")

    // PIX simulado como fallback
    const pixCodeGenerated = `00020126580014br.gov.bcb.pix0136${userData.email.replace("@", "").replace(".", "")}520400005303986540${amount.toFixed(2)}5802BR5925AGRODERI TECNOLOGIA LTDA6009SAO PAULO62070503***6304ABCD`
    setPaymentString(pixCodeGenerated)

    console.log("💳 PIX de fallback gerado:", pixCodeGenerated.substring(0, 50) + "...")

    // Gerar QR Code usando API externa
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCodeGenerated)}`
    setQrCodeUrl(qrCodeApiUrl)

    console.log("🖼️ QR Code de fallback gerado:", qrCodeApiUrl)
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(paymentString)
      alert("Código PIX copiado!")
    } catch (err) {
      console.error("Erro ao copiar:", err)
      alert("Erro ao copiar código PIX")
    }
  }

  const scrollToCheckout = () => {
    setShowCheckout(true)
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg.id)
    setAmount(pkg.minValue)
    setCurrentStep(1)
  }

  const validateCPF = (cpf: string) => {
    const cleanCPF = unmaskValue(cpf)
    if (cleanCPF.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    return remainder === Number.parseInt(cleanCPF.charAt(10))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const cleanPhone = unmaskValue(phone)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }

  const validatePassword = (password: string) => {
    // Permitir letras, números e caracteres especiais
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  }

  // Adicionar função de login após as funções existentes:
  const handleLogin = async () => {
    try {
      setLoginLoading(true)
      setLoginErrors({ username: "", password: "", general: "" })

      // Validação básica
      const errors = { username: "", password: "", general: "" }

      if (!loginData.username.trim()) {
        errors.username = "Email é obrigatório"
      } else if (!validateEmail(loginData.username)) {
        errors.username = "Email inválido"
      }

      if (!loginData.password.trim()) {
        errors.password = "Senha é obrigatória"
      }

      if (errors.username || errors.password) {
        setLoginErrors(errors)
        return
      }

      console.log("🔐 Fazendo login...")

      const response = await fetch("https://api.agroderivative.tech/api/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      })

      const result = await response.json()
      console.log("📊 Resultado do login:", result)

      if (response.ok) {
        console.log("✅ Login realizado com sucesso!")
        console.log("📊 Dados do login:", result)

        // Fechar modal
        setShowLoginModal(false)

        // Abrir nova aba com área do investidor passando o CPF
        const investorUrl = `/investor-dashboard?token=${result.token}&user=${encodeURIComponent(loginData.username)}&cpf=${result.cpf}&user_id=${result.user_id}`
        window.open(investorUrl, "_blank")

        // Limpar dados do formulário
        setLoginData({ username: "", password: "" })
      } else {
        console.error("❌ Erro no login:", result)

        // Tratar diferentes tipos de erro
        if (result.non_field_errors) {
          setLoginErrors({
            ...errors,
            general: Array.isArray(result.non_field_errors) ? result.non_field_errors[0] : result.non_field_errors,
          })
        } else if (result.detail) {
          setLoginErrors({ ...errors, general: result.detail })
        } else if (result.username) {
          setLoginErrors({ ...errors, username: Array.isArray(result.username) ? result.username[0] : result.username })
        } else if (result.password) {
          setLoginErrors({ ...errors, password: Array.isArray(result.password) ? result.password[0] : result.password })
        } else {
          setLoginErrors({ ...errors, general: "Credenciais inválidas. Verifique seu email e senha." })
        }
      }
    } catch (error) {
      console.error("💥 Erro na requisição de login:", error)
      setLoginErrors({ username: "", password: "", general: "Erro de conexão. Tente novamente." })
    } finally {
      setLoginLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      birthday: "",
      amount: "",
      password: "",
      confirmPassword: "",
    }

    if (!userData.name.trim()) {
      errors.name = "Nome completo é obrigatório"
    } else if (userData.name.trim().length < 3) {
      errors.name = "Nome deve ter pelo menos 3 caracteres"
    }

    if (!userData.email.trim()) {
      errors.email = "E-mail é obrigatório"
    } else if (!validateEmail(userData.email)) {
      errors.email = "E-mail inválido"
    }

    if (!userData.password.trim()) {
      errors.password = "Senha é obrigatória"
    } else if (!validatePassword(userData.password)) {
      errors.password = "Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número"
    }

    if (!userData.confirmPassword.trim()) {
      errors.confirmPassword = "Confirmação de senha é obrigatória"
    } else if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = "Senhas não coincidem"
    }

    if (!userData.phone.trim()) {
      errors.phone = "WhatsApp é obrigatório"
    } else if (!validatePhone(userData.phone)) {
      errors.phone = "Número de telefone inválido"
    }

    if (!userData.cpf.trim()) {
      errors.cpf = "CPF é obrigatório"
    } else if (!validateCPF(userData.cpf)) {
      errors.cpf = "CPF inválido"
    }

    if (!userData.rg.trim()) {
      errors.rg = "RG é obrigatório"
    } else if (unmaskValue(userData.rg).length < 7) {
      errors.rg = "RG deve ter pelo menos 7 caracteres"
    }

    if (!userData.birthday.trim()) {
      errors.birthday = "Data de nascimento é obrigatória"
    } else if (!validateDate(userData.birthday)) {
      errors.birthday = "Data de nascimento inválida"
    }

    if (!amount || amount < 1) {
      errors.amount = "Valor mínimo de investimento é R$ 50"
    }

    setFormErrors(errors)
    return Object.values(errors).every((error) => error === "")
  }

  const registerUser = async () => {
    try {
      setLoading(true)

      const nameParts = userData.name.trim().split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ") || firstName

      const registrationData = {
        username: userData.email,
        email: userData.email,
        password: userData.password,
        password2: userData.confirmPassword,
        first_name: firstName,
        last_name: lastName,
        cpf: unmaskValue(userData.cpf),
        whatsapp: unmaskValue(userData.phone),
        rg: unmaskValue(userData.rg),
        birthday: userData.birthday,
      }

      console.log("📝 Dados de registro:", registrationData)

      try {
        const response = await fetch("https://api.agroderivative.tech/api/users/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(registrationData),
        })

        const result = await response.json()

        if (response.ok) {
          console.log("✅ Usuário registrado com sucesso!", result)
          alert("Registro bem-sucedido!")
          setCurrentStep(2)
        } else {
          console.error("❌ Erro no registro:", result)
           handleRegistrationErrors(result)
          //setCurrentStep(2)
        }
      } catch (error) {
        console.error("🌐 Erro de rede:", error)
        alert("Erro de conexão. Tente novamente.")
      }
    } catch (error) {
      console.error("💥 Erro geral:", error)
      alert("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationErrors = (data: any) => {
    const backendErrors = {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      birthday: "",
      amount: "",
      password: "",
      confirmPassword: "",
    }

    if (data.email) {
      backendErrors.email = Array.isArray(data.email) ? data.email[0] : data.email
    }
    if (data.password) {
      backendErrors.password = Array.isArray(data.password) ? data.password[0] : data.password
    }
    if (data.password2) {
      backendErrors.confirmPassword = Array.isArray(data.password2) ? data.password2[0] : data.password2
    }
    if (data.cpf) {
      backendErrors.cpf = Array.isArray(data.cpf) ? data.cpf[0] : data.cpf
    }
    if (data.whatsapp) {
      backendErrors.phone = Array.isArray(data.whatsapp) ? data.whatsapp[0] : data.whatsapp
    }
    if (data.rg) {
      backendErrors.rg = Array.isArray(data.rg) ? data.rg[0] : data.rg
    }
    if (data.username) {
      backendErrors.email = Array.isArray(data.username) ? data.username[0] : data.username
    }
    if (data.first_name) {
      backendErrors.name = Array.isArray(data.first_name) ? data.first_name[0] : data.first_name
    }
    if (data.last_name && !backendErrors.name) {
      backendErrors.name = Array.isArray(data.last_name) ? data.last_name[0] : data.last_name
    }

    if (data.birthday) {
      backendErrors.birthday = Array.isArray(data.birthday) ? data.birthday[0] : data.birthday
    }

    if (data.non_field_errors) {
      alert(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors)
    }

    setFormErrors(backendErrors)
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!validateForm()) {
        return
      }
      await registerUser()
      return
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const resetCheckout = () => {
    setCurrentStep(0)
    setSelectedPackage("")
    setAmount(0)
    setUserData({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      birthday: "",
      password: "",
      confirmPassword: "",
    })
    setPaymentMethod("pix")
    setPixCode("")
    setQrCodeUrl("")
    setPaymentString("")
    setPaymentConfirmed(false)
    setContractCreated(false)
    setContractData(null)
    setDocumentIdClicksign("")
    setContractDownloadUrl("")
    setFormErrors({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      birthday: "",
      amount: "",
      password: "",
      confirmPassword: "",
    })
    setSelectedCrypto("")
  }

  const handleBack = () => {
    if (currentStep === 1) {
      // Se estiver no step 1 (Dados), voltar para step 0 (Pacotes) e resetar
      resetCheckout()
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePayment = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (paymentMethod === "pix") {
        setCurrentStep(2.5) // PIX QR Code
      } else if (paymentMethod === "crypto") {
        setCurrentStep(2.7) // Crypto Address (novo step)
      }
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case "cpf":
        setUserData({ ...userData, cpf: maskCPF(value) })
        break
      case "rg":
        setUserData({ ...userData, rg: maskRG(value) })
        break
      case "phone":
        setUserData({ ...userData, phone: maskPhone(value) })
        break
      case "password":
        setUserData({ ...userData, password: value })
        break
      case "confirmPassword":
        setUserData({ ...userData, confirmPassword: value })
        break
      case "birthday":
        setUserData({ ...userData, birthday: maskDate(value) })
        break
      default:
        setUserData({ ...userData, [field]: value })
    }
  }

  const getPackageIcon = (color: string) => {
    if (color === "green") return <Sprout className="h-8 w-8" />
    if (color === "blue") return <Gift className="h-8 w-8" />
    if (color === "yellow") return <Crown className="h-8 w-8" />
    if (color === "purple") return <Star className="h-8 w-8" />
    if (color === "indigo") return <TrendingUp className="h-8 w-8" />
    return <Shield className="h-8 w-8" />
  }

  const getColorClass = (color: string) => {
    if (color === "green") return "border-green-200 bg-green-50 text-green-600"
    if (color === "blue") return "border-blue-200 bg-blue-50 text-blue-600"
    if (color === "yellow") return "border-yellow-200 bg-yellow-50 text-yellow-600"
    if (color === "purple") return "border-purple-200 bg-purple-50 text-purple-600"
    if (color === "indigo") return "border-indigo-200 bg-indigo-50 text-indigo-600"
    return "border-gray-200 bg-gray-50 text-gray-600"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">AgroDeri</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Pré-venda Ativa
          </Badge>
        </div>
      </header>

      {/* Hero Section com VSL */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Você nunca ouviu isso no agro.
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Um homem simples, um celular de botão, 12 toneladas de milho vendidas por USDT em segundos.
                  <br />
                  <span className="font-semibold text-green-600">
                    Isso não é promessa, é tecnologia. É agro real tokenizado.
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "Acesso a soja, milho, petróleo e café com R$50",
                  "Token AGD com utilidade real, rastreável e líquido",
                  "Pré-venda exclusiva com 6% do supply disponível",
                  "Estrutura auditável, transparente e segura",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Na seção Hero, substituir o botão único por dois botões lado a lado: */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                  onClick={scrollToCheckout}
                >
                  Quero meus tokens AGD agora
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 sm:flex-none border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg"
                  onClick={() => setShowLoginModal(true)}
                >
                  Acompanhar Investimento
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white rounded-full p-6">
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                  <div className="absolute bottom-4 left-4 text-white text-sm">
                    🎥 VSL: A revolução do agro tokenizado (60s)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Validação e Autoridade */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4"></div>
      </section>

      {/* Validação e Autoridade */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              A revolução do agro não é teórica. Ela já começou.
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              O AgroDeri nasceu com base no que movimenta a economia de verdade — commodities reais.
              <br />E conta com o apoio dos maiores nomes da tecnologia e do agro.
            </p>
          </div>

          {/* Logos dos Parceiros */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-16 opacity-60">
            {["Google for Startups", "Nubank", "Transfero", "SGS", "Blockchain"].map((partner) => (
              <div key={partner} className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-sm">{partner}</span>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Coluna 1 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Validação Completa</h3>
              <div className="space-y-4">
                {[
                  "Tecnologia validada por especialistas em cripto e agro",
                  "Operação registrada e auditável",
                  "Tokens com rastreabilidade completa",
                  "Equipe com histórico de bilhões em operações agroindustriais",
                  "Conformidade com CVM e Banco Central",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Comparativo</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-gray-600 border-b pb-2">
                  <span>Agro Tradicional</span>
                  <span>AgroDeri</span>
                </div>
                {[
                  ["Acesso só pra poucos", "Aberto a todos com R$50"],
                  ["Intermediários caros", "Liquidez direta"],
                  ["Sem rastreabilidade", "100% auditável na blockchain"],
                  ["Dependente de bancos", "Wallet própria, USDT e BTC"],
                ].map(([traditional, agroderi]) => (
                  <div
                    key={traditional}
                    className="grid grid-cols-2 gap-4 text-sm py-2 border-b border-gray-200 last:border-0"
                  >
                    <span className="text-red-600">❌ {traditional}</span>
                    <span className="text-green-600">✅ {agroderi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={scrollToCheckout}
            >
              Quero entender como funciona
            </Button>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-br from-green-50 to emerald-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">Tá, mas como eu ganho com isso?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Você compra AGD. Ele é a chave de entrada para participar de uma nova economia, conectada à realidade do
              agro.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                step: "1️⃣",
                icon: <Coins className="h-8 w-8" />,
                title: "Compre AGD",
                description: "Com Pix, USDT ou Cartão",
              },
              {
                step: "2️⃣",
                icon: <Target className="h-8 w-8" />,
                title: "Escolha exposição",
                description: "Soja, milho, café, petróleo",
              },
              {
                step: "3️⃣",
                icon: <Zap className="h-8 w-8" />,
                title: "Use tokens",
                description: "Staking, missões, descontos",
              },
              {
                step: "4️⃣",
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Receba lucros",
                description: "Bônus e benefícios",
              },
            ].map((item, index) => (
              <Card key={index} className="text-center bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit text-green-600">{item.icon}</div>
                  <div className="text-3xl font-bold text-green-600 mb-2">{item.step}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Extra</h3>
            <p className="text-lg text-gray-600 mb-6">
              Tudo rastreado. Tudo transparente. Você acompanha cada passo com dados reais do agro.
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
              onClick={scrollToCheckout}
            >
              Quero garantir meus primeiros tokens
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      {showCheckout && (
        <section ref={checkoutRef} className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Escolha seu Pacote AGD</h2>
              <p className="text-xl text-gray-600">Diferentes formas de participar da revolução do agro tokenizado</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStep ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${index <= currentStep ? "text-green-600" : "text-gray-500"}`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${index < currentStep ? "bg-green-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 0: Escolha do Pacote */}
            {currentStep === 0 && (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`relative ${pkg.popular ? "ring-2 ring-blue-500 scale-105" : ""} hover:shadow-lg transition-all`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                        Mais Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${getColorClass(pkg.color)}`}>
                        {getPackageIcon(pkg.color)}
                      </div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-gray-900">
                        R$ {pkg.minValue.toLocaleString()} - R$ {pkg.maxValue.toLocaleString()}
                      </div>
                      <CardDescription className="text-green-600 font-semibold">{pkg.bonus}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Cliff: {pkg.cliff}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <span>Vesting: {pkg.vesting}m</span>
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button className="w-full" onClick={() => handlePackageSelect(pkg)}>
                        Escolher este pacote
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Dados Pessoais</CardTitle>
                  <CardDescription>
                    Preencha seus dados para continuar. Campos marcados com * são obrigatórios.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome completo"
                        value={userData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={userData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                        className={formErrors.cpf ? "border-red-500" : ""}
                      />
                      {formErrors.cpf && <p className="text-red-500 text-sm mt-1">{formErrors.cpf}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rg">RG *</Label>
                      <Input
                        id="rg"
                        placeholder="00.000.000-0"
                        value={userData.rg}
                        onChange={(e) => handleInputChange("rg", e.target.value)}
                        className={formErrors.rg ? "border-red-500" : ""}
                      />
                      {formErrors.rg && <p className="text-red-500 text-sm mt-1">{formErrors.rg}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">WhatsApp *</Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={userData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={formErrors.phone ? "border-red-500" : ""}
                      />
                      {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={userData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="birthday">Data de Nascimento *</Label>
                    <Input
                      id="birthday"
                      placeholder="DD/MM/AAAA"
                      value={userData.birthday}
                      onChange={(e) => handleInputChange("birthday", e.target.value)}
                      className={formErrors.birthday ? "border-red-500" : ""}
                      maxLength={10}
                    />
                    {formErrors.birthday && <p className="text-red-500 text-sm mt-1">{formErrors.birthday}</p>}
                    <p className="text-xs text-gray-500 mt-1">Formato: DD/MM/AAAA</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Senha *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={userData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={`pr-10 ${formErrors.password ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          value={userData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className={`pr-10 ${formErrors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="amount">Valor do Investimento *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Digite o valor"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className={formErrors.amount ? "border-red-500" : ""}
                      min="50"
                    />
                    {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
                    <p className="text-sm text-gray-500 mt-1">Valor mínimo: R$ 50</p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Voltar
                    </Button>
                    <Button onClick={handleNext} className="flex-1" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        <>
                          Continuar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Método de Pagamento */}
            {currentStep === 2 && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Método de Pagamento</CardTitle>
                  <CardDescription>Total: R$ {amount.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seleção do método de pagamento */}
                  {/* Resumo do Investimento */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Resumo do Investimento</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Valor investido:</span>
                        <span>R$ {amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Método:</span>
                        <span className="capitalize">PIX</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Voltar
                    </Button>
                    <Button onClick={handlePayment} className="flex-1" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando PIX...
                        </>
                      ) : (
                        "Gerar PIX"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2.5: QR Code PIX com Botão Manual */}
            {currentStep === 2.5 && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Pague com PIX</CardTitle>
                  <CardDescription>
                    Escaneie o QR Code ou copie o código PIX para finalizar seu investimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center">
                    {/* QR Code Real da API */}
                    <div className="w-64 h-64 mx-auto mb-4 flex items-center justify-center">
                      {loading ? (
                        <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Gerando PIX...</p>
                          </div>
                        </div>
                      ) : qrCodeUrl ? (
                        <div className="w-full h-full relative">
                          <img
                            src={qrCodeUrl || "/placeholder.svg"}
                            alt="QR Code PIX"
                            className="w-full h-full object-contain border rounded-lg"
                            onError={(e) => {
                              console.error("❌ Erro ao carregar QR Code:", qrCodeUrl)
                              console.error("❌ Evento de erro:", e)
                              e.target.src = "/placeholder.svg?height=256&width=256&text=Erro+ao+carregar+QR+Code"
                              e.target.style.backgroundColor = "#f3f4f6"
                            }}
                            onLoad={() => {
                              console.log("✅ QR Code carregado com sucesso!")
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">QR Code não disponível</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                console.log("🔄 Tentando gerar PIX novamente...")
                                generateRealPixCode()
                              }}
                            >
                              Tentar Novamente
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Código PIX Copia e Cola:</p>
                        <div className="bg-white border rounded p-3 text-xs font-mono break-all max-h-20 overflow-y-auto">
                          {paymentString || "Carregando código PIX..."}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={copyPixCode}
                          disabled={!paymentString}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar Código PIX
                        </Button>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Valor:</strong> R$ {amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>CPF:</strong> {userData.cpf}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Beneficiário:</strong> AgroDeri Tecnologia LTDA
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">⚠️</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 mb-1">Após realizar o pagamento</p>
                        <p className="text-yellow-700">
                          Clique no botão "Já fiz o pagamento" para verificar se o PIX foi processado e continuar para a
                          próxima etapa.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Voltar
                    </Button>
                    {paymentConfirmed ? (
                      <Button className="flex-1 bg-green-600 text-white" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Pagamento Confirmado
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePaymentConfirmation}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={checkingPayment}
                      >
                        {checkingPayment ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          "Já fiz o pagamento"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2.7: Endereço Crypto */}
            {currentStep === 2.7 && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Pague com {selectedCrypto}</CardTitle>
                  <CardDescription>
                    Envie {selectedCrypto} para o endereço abaixo para finalizar seu investimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
                    {/* Crypto Info */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <img
                        src={AVAILABLE_CRYPTOS.find((c) => c.coin === selectedCrypto)?.icon || "/placeholder.svg"}
                        alt={selectedCrypto}
                        className="w-8 h-8"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=32&width=32"
                        }}
                      />
                      <div>
                        <div className="font-bold text-lg">{selectedCrypto}</div>
                        <div className="text-sm text-gray-500">
                          {AVAILABLE_CRYPTOS.find((c) => c.coin === selectedCrypto)?.name}
                        </div>
                      </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="w-64 h-64 mx-auto mb-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Gerando endereço...</p>
                      </div>
                    </div>

                    {/* Crypto Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Endereço da carteira:</p>
                      <div className="bg-white border rounded p-3 text-xs font-mono break-all">
                        1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          navigator.clipboard.writeText("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")
                          alert("Endereço copiado!")
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Endereço
                      </Button>
                    </div>

                    <div className="text-center space-y-2 mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Valor:</strong> R$ {amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Rede:</strong> {selectedCrypto === "USDT" ? "TRC20 (Tron)" : "Mainnet"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">⚠️</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 mb-1">Após enviar a criptomoeda</p>
                        <p className="text-yellow-700">
                          Clique no botão "Já fiz o pagamento" para verificar se a transação foi processada e continuar
                          para a próxima etapa.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBack} className="flex-1">
                      Voltar
                    </Button>
                    {paymentConfirmed ? (
                      <Button className="flex-1 bg-green-600 text-white" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Pagamento Confirmado
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePaymentConfirmation}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={checkingPayment}
                      >
                        {checkingPayment ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          "Já fiz o pagamento"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmação */}
            {currentStep === 3 && (
              <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <CardTitle className="text-3xl text-green-600">Investimento Confirmado!</CardTitle>
                  <CardDescription className="text-lg">
                    Seu contrato foi criado com sucesso e está disponível para download e assinatura.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">📄</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Contrato gerado com sucesso</p>
                        <p className="text-blue-700">
                          Seu contrato de investimento foi criado e está pronto para download.
                          {documentIdClicksign && (
                            <span className="block mt-1 text-xs">ID do documento: {documentIdClicksign}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-4">Detalhes do seu investimento:</h3>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between">
                        <span>Investidor:</span>
                        <span className="font-medium">{userData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPF:</span>
                        <span className="font-medium">{userData.cpf}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>E-mail:</span>
                        <span className="font-medium">{userData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor investido:</span>
                        <span className="font-medium">R$ {amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Método de pagamento:</span>
                        <span className="font-medium capitalize">{paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium text-green-600">Confirmado</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {contractDownloadUrl && (
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

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={resetCheckout}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Novo Investimento
                      </Button>
                      <Button variant="outline">
                        <Shield className="mr-2 h-4 w-4" />
                        Área do Investidor
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      Seu contrato está disponível para download no formato DOCX. Após baixar, você pode revisar os
                      termos e aguardar as próximas instruções para assinatura digital. Bem-vindo à revolução do agro
                      tokenizado!
                 
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Acompanhar Investimento</CardTitle>
              <CardDescription className="text-center">Faça login para acessar sua área do investidor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginErrors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{loginErrors.general}</p>
                </div>
              )}

              <div>
                <Label htmlFor="loginEmail">Email</Label>
                <Input
                  id="loginEmail"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className={loginErrors.username ? "border-red-500" : ""}
                />
                {loginErrors.username && <p className="text-red-500 text-sm mt-1">{loginErrors.username}</p>}
              </div>

              <div>
                <Label htmlFor="loginPassword">Senha</Label>
                <Input
                  id="loginPassword"
                  type="password"
                  placeholder="Sua senha"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className={loginErrors.password ? "border-red-500" : ""}
                />
                {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLoginModal(false)
                    setLoginData({ username: "", password: "" })
                    setLoginErrors({ username: "", password: "", general: "" })
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleLogin}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <footer className="bg-gray-50 py-12 border-t">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
          <p className="text-sm">
            © {new Date().getFullYear()} AgroDeri Tecnologia LTDA. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2">
            AgroDeri é uma plataforma de tecnologia que facilita o acesso a investimentos no agronegócio.
          </p>
        </div>
      </footer>
    </div>
  )
}
