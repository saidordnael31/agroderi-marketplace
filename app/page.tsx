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
  FileText,
  Loader2,
  ArrowRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { maskCPF, maskRG, maskPhone, maskDate, validateDate, unmaskValue } from "@/utils/input-masks"

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
    birthday: "", // Adicionar este campo
    password: "",
    confirmPassword: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("pix")
  const [loading, setLoading] = useState(false)
  const [pixCode, setPixCode] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    birthday: "", // Adicionar este campo
    amount: "",
    password: "",
    confirmPassword: "",
  })

  const checkoutRef = useRef<HTMLDivElement>(null)
  const qrCodeRef = useRef<HTMLCanvasElement>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  // Gerar QR Code quando chegar no step 2.5
  useEffect(() => {
    if (currentStep === 2.5) {
      generatePixCode()
    }
  }, [currentStep, amount, userData.email])

  const generatePixCode = async () => {
    // Gerar código PIX simulado
    const pixCodeGenerated = `00020126580014br.gov.bcb.pix0136${userData.email.replace("@", "").replace(".", "")}520400005303986540${amount.toFixed(2)}5802BR5925AGRODERI TECNOLOGIA LTDA6009SAO PAULO62070503***6304ABCD`
    setPixCode(pixCodeGenerated)

    // Gerar QR Code usando API externa
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCodeGenerated)}`
    setQrCodeUrl(qrCodeApiUrl)
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      // Aqui você pode adicionar um toast de sucesso
      alert("Código PIX copiado!")
    } catch (err) {
      console.error("Erro ao copiar:", err)
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
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      birthday: "", // Adicionar este campo
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

    if (!amount || amount < 50) {
      errors.amount = "Valor mínimo de investimento é R$ 50"
    }

    setFormErrors(errors)
    return Object.values(errors).every((error) => error === "")
  }

  const registerUser = async () => {
    try {
      setLoading(true)

      // Separar nome completo em primeiro e último nome
      const nameParts = userData.name.trim().split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ") || firstName

      // Preparar dados para envio (removendo máscaras)
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
        birthday: userData.birthday, // Adicionar este campo no formato DD/MM/AAAA
      }

      console.log("📝 Dados de registro:", registrationData)

      // Usar a rota interna do Next.js (sem CORS)

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
          // Status 2xx
          console.log("Usuário registrado com sucesso!", result)
          alert("Registro bem-sucedido!")
          // Redirecionar para a página de login, por exemplo
        } else {
          console.error("Erro no registro:", result)
          alert("Erro no registro: " + (result.error || JSON.stringify(result)))
        }
      } catch (error) {
        console.error("Erro de rede ou inesperado:", error)
        alert("Erro de conexão. Tente novamente.")
      }
    } catch (error) {
      console.error("💥 Erro geral:", error)
      alert("Erro inesperado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  // Função separada para tratar erros de registro
  const handleRegistrationErrors = (data: any) => {
    const backendErrors = {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      birthday: "", // Adicionar este campo
      amount: "",
      password: "",
      confirmPassword: "",
    }

    // Mapear erros do backend para os campos do formulário
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

    // Se houver erro geral não mapeado
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

      // Fazer requisição para registrar usuário
      await registerUser()
      return // A função registerUser já gerencia o próximo step
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePayment = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setCurrentStep(2.5)
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

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                  onClick={scrollToCheckout}
                >
                  Quero meus tokens AGD agora
                </Button>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  ⏳ <span>Tempo limitado. Quando esse lote acabar, o preço muda.</span>
                </p>
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
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Validação Completa</h3>
              <div className="space-y-4">
                {[
                  "Tecnologia validada por especialistas em cripto e agro",
                  "Operação registrada e auditável",
                  "Tokens com rastreabilidade completa",
                  "Equipe com histórico de bilhões em operações agroindustriais",
                  "Conformidade com CVM e Banco Central",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

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
                ].map(([traditional, agroderi], index) => (
                  <div
                    key={index}
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

      {/* Como Funciona */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-100">
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

      {/* Checkout Section */}
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

            {/* Step 2: Pagamento PIX */}
            {currentStep === 2 && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Método de Pagamento</CardTitle>
                  <CardDescription>Total: R$ {amount.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-600 font-bold text-xs">PIX</span>
                      </div>
                      <div>
                        <div className="font-medium">PIX</div>
                        <div className="text-sm text-gray-500">Aprovação instantânea</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Resumo do Investimento</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Valor investido:</span>
                        <span>R$ {amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Método:</span>
                        <span>PIX</span>
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

            {/* Step 2.5: QR Code PIX */}
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
                    {/* QR Code Real */}
                    <div className="w-64 h-64 mx-auto mb-4 flex items-center justify-center">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl || "/placeholder.svg"}
                          alt="QR Code PIX"
                          className="w-full h-full object-contain border rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Código PIX Copia e Cola:</p>
                        <div className="bg-white border rounded p-3 text-xs font-mono break-all max-h-20 overflow-y-auto">
                          {pixCode}
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={copyPixCode}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar Código PIX
                        </Button>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Valor:</strong> R$ {amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Beneficiário:</strong> Brasil Bitcoin - AgroDeri Tecnologia Ltda
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-yellow-800 text-xs">!</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 mb-1">Aguardando pagamento</p>
                        <p className="text-yellow-700">
                          Após o pagamento, você receberá a confirmação automaticamente e seu contrato será gerado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                      Voltar
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} className="flex-1">
                      Já paguei
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                    Enviamos seu contrato de mútuo por e-mail para assinatura digital. Verifique sua caixa de entrada e
                    spam.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">📧</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Contrato enviado por e-mail</p>
                        <p className="text-blue-700">
                          Enviamos seu contrato de mútuo para <strong>{userData.email}</strong>. Você receberá um link
                          da Clicksign para assinatura digital. Verifique também sua caixa de spam.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-4">Detalhes do seu investimento:</h3>
                    <div className="space-y-2 text-left">
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
                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Visualizar Contrato
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline">
                        <Shield className="mr-2 h-4 w-4" />
                        Área do Investidor
                      </Button>
                      <Button variant="outline">
                        <Coins className="mr-2 h-4 w-4" />
                        Staking AGD
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      Após a assinatura do contrato, você receberá acesso completo à plataforma AgroDeri. Bem-vindo à
                      revolução do agro tokenizado!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sprout className="h-6 w-6 text-green-400" />
            <span className="text-xl font-bold">AgroDeri</span>
          </div>
          <p className="text-gray-400 mb-4">Revolucionando o agro através da tecnologia blockchain</p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <span>Termos de Uso</span>
            <span>Política de Privacidade</span>
            <span>Contato</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
