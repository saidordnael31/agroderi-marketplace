"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  TrendingUp,
  Crown,
  CheckCircle,
  Star,
  Loader2,
  ArrowRight,
  Clock,
  Eye,
  EyeOff,
  Shield,
  Sprout,
} from "lucide-react"
import { maskCPF, maskRG, maskPhone, unmaskValue } from "@/utils/input-masks"
import { AVAILABLE_CRYPTOS } from "@/utils/crypto-list"
import { useSearchParams } from "next/navigation"

export default function AgroDeriLanding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState("")
  const [amount, setAmount] = useState(0)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
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
    amount: "",
    password: "",
    confirmPassword: "",
  })
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [showAllCryptos, setShowAllCryptos] = useState(false)
  const [isPrefilledUser, setIsPrefilledUser] = useState(false)

  const checkoutRef = useRef<HTMLDivElement>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const [cryptoAddress, setCryptoAddress] = useState("")
  const [cryptoNetwork, setCryptoNetwork] = useState("")
  const [cryptoNetworkName, setCryptoNetworkName] = useState("")
  const [cryptoLoading, setCryptoLoading] = useState(false)

  const searchParams = useSearchParams()

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
      color: "blue",
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

  const steps = ["Pacote", "Dados", "Pagamento", "Confirmação"]

  // Gerar QR Code PIX real quando chegar no step 2.5
  useEffect(() => {
    if (currentStep === 2.5) {
      generateRealPixCode()
    }
  }, [currentStep, amount, userData.cpf])

  // Gerar endereço crypto quando chegar no step 2.7
  useEffect(() => {
    if (currentStep === 2.7 && selectedCrypto) {
      generateCryptoAddress()
    }
  }, [currentStep, selectedCrypto])

  // Detectar step da URL
  useEffect(() => {
    const stepParam = searchParams?.get("step")

    if (stepParam) {
      // Mapear os steps da URL para os números internos
      switch (stepParam) {
        case "cadastro":
          setCurrentStep(1)
          break
        case "pagamento":
          setCurrentStep(2)
          break
        case "contrato":
          setCurrentStep(3)
          break
        default:
          setCurrentStep(0)
      }
    }
  }, [searchParams])

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      )
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Verificar retorno do localStorage
  useEffect(() => {
    const returnUrl = localStorage.getItem("agroDeriReturnUrl")
    const userData = localStorage.getItem("agroDeriUserData")

    if (returnUrl && userData) {
      try {
        const user = JSON.parse(userData)
        setTimeout(() => {
          alert(`Olá novamente, ${user.name}! Você retornou da área do investidor.`)
        }, 1000)

        localStorage.removeItem("agroDeriReturnUrl")
        localStorage.removeItem("agroDeriUserData")
      } catch (error) {
        console.error("Erro ao processar dados de retorno:", error)
      }
    }
  }, [])

  // Listener para mensagens de pré-preenchimento
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "PREFILL_INVESTMENT_DATA") {
        const data = event.data.data

        setIsPrefilledUser(true)

        setUserData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          cpf: data.cpf || "",
          rg: data.rg || "",
          password: "",
          confirmPassword: "",
        })

        setCurrentStep(0)

        setTimeout(() => {
          checkoutRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)

        alert(`Bem-vindo de volta, ${data.name}! Seus dados foram pré-preenchidos. Escolha seu pacote de investimento.`)
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const createContractDocument = async () => {
    try {
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

      if (result.success) {
        setContractCreated(true)
        setContractData(result.contract)

        if (result.contract) {
          if (result.contract.document_id) {
            setDocumentIdClicksign(result.contract.document_id)
          }
          if (result.contract.downloadUrl) {
            setContractDownloadUrl(result.contract.downloadUrl)
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

      const result = await response.json()
      console.log("📦 Resultado completo:", result)

      if (result.success && result.confirmed) {
        console.log("✅ Pagamento confirmado!")
        setPaymentConfirmed(true)

        const contractSuccess = await createContractDocument()

        if (contractSuccess) {
          setCurrentStep(3)
          updateUrlForStep(3)
        }
      } else if (result.success && result.data) {
        if (paymentMethod === "crypto") {
          const depositCryptoValue = result.data.deposit_crypto_value
          const depositCryptoName = result.data.deposit_crypto_name

          console.log("🪙 Verificando pagamento crypto:")
          console.log("- deposit_crypto_value:", depositCryptoValue)
          console.log("- deposit_crypto_name:", depositCryptoName)

          if (
            depositCryptoValue &&
            depositCryptoName &&
            depositCryptoValue !== "0.0" &&
            depositCryptoValue !== null &&
            depositCryptoName !== "0.0" &&
            depositCryptoName !== null &&
            Number.parseFloat(depositCryptoValue) > 0
          ) {
            console.log("✅ Pagamento crypto confirmado!")
            console.log(`💰 Valor: ${depositCryptoValue} ${depositCryptoName}`)

            setPaymentConfirmed(true)

            const contractSuccess = await createContractDocument()

            if (contractSuccess) {
              setCurrentStep(3)
              updateUrlForStep(3)
            }
          } else {
            console.log("⏳ Pagamento crypto ainda não confirmado")
            alert(
              "Pagamento crypto ainda não foi identificado. Aguarde alguns minutos após a confirmação na blockchain e tente novamente.",
            )
          }
        } else {
          const depositValue = result.data.deposit_value

          if (depositValue && Number.parseFloat(depositValue) > 0) {
            console.log("✅ Pagamento PIX confirmado!")
            setPaymentConfirmed(true)

            const contractSuccess = await createContractDocument()

            if (contractSuccess) {
              setCurrentStep(3)
              updateUrlForStep(3)
            }
          } else {
            console.log("⏳ Pagamento PIX ainda não confirmado")
            alert("Pagamento PIX ainda não foi identificado. Aguarde alguns minutos e tente novamente.")
          }
        }
      } else {
        console.log("❌ Pagamento não confirmado ainda")
        const message =
          paymentMethod === "crypto"
            ? "Pagamento crypto ainda não foi identificado. Aguarde alguns minutos após a confirmação na blockchain e tente novamente."
            : "Pagamento PIX ainda não foi identificado. Aguarde alguns minutos e tente novamente."
        alert(message)
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

      const result = await response.json()

      if (response.ok && result.success) {
        if (result.qrCode) {
          setQrCodeUrl(result.qrCode)
        } else {
          generateFallbackPixCode()
        }

        if (result.paymentString) {
          setPaymentString(result.paymentString)
        } else {
          if (result.originalData) {
            const originalData = result.originalData

            const possibleQrFields = ["qrCode", "qr_code", "qr", "qrcode"]
            const possibleStringFields = ["paymentString", "payment_string", "pix_code", "code", "pix"]

            for (const field of possibleQrFields) {
              if (originalData[field]) {
                setQrCodeUrl(originalData[field])
                break
              }
            }

            for (const field of possibleStringFields) {
              if (originalData[field]) {
                setPaymentString(originalData[field])
                break
              }
            }
          }

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
    const pixCodeGenerated = `00020126580014br.gov.bcb.pix0136${userData.email.replace("@", "").replace(".", "")}520400005303986540${amount.toFixed(2)}5802BR5925AGRODERI TECNOLOGIA LTDA6009SAO PAULO62070503***6304ABCD`
    setPaymentString(pixCodeGenerated)

    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCodeGenerated)}`
    setQrCodeUrl(qrCodeApiUrl)
  }

  const generateCryptoAddress = async () => {
    try {
      setCryptoLoading(true)
      console.log("🔄 Gerando endereço crypto para:", selectedCrypto)

      const response = await fetch("/api/generate-crypto-address/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coin: selectedCrypto,
        }),
      })

      console.log("📊 Status da resposta crypto:", response.status)

      const result = await response.json()
      console.log("📦 Resposta da API crypto:", result)

      if (response.ok && result.success && result.address_info) {
        console.log("✅ Endereço crypto gerado com sucesso!")
        setCryptoAddress(result.address_info.address)
        setCryptoNetwork(result.address_info.network)
        setCryptoNetworkName(result.address_info.networkName)
      } else {
        console.error("❌ Erro ao gerar endereço crypto:", result)
        alert("Erro ao gerar endereço crypto: " + (result.error || result.message || "Erro desconhecido"))
      }
    } catch (error) {
      console.error("💥 Erro na geração do endereço crypto:", error)
      alert("Erro de conexão ao gerar endereço crypto.")
    } finally {
      setCryptoLoading(false)
    }
  }

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(paymentString)
      alert("Código PIX copiado!")
    } catch (err) {
      alert("Erro ao copiar código PIX")
    }
  }

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg.id)
    setAmount(pkg.minValue)
    setCurrentStep(1)
    updateUrlForStep(1)
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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  }

  const handleLogin = async () => {
    try {
      setLoginLoading(true)
      setLoginErrors({ username: "", password: "", general: "" })

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

      if (response.ok) {
        setShowLoginModal(false)

        const investorUrl = `/investor-dashboard?token=${result.token}&user=${encodeURIComponent(loginData.username)}&cpf=${result.cpf}&user_id=${result.user_id}`

        if (isMobile) {
          console.log("📱 Dispositivo móvel detectado, usando redirecionamento direto")

          const newWindow = window.open(investorUrl, "_blank")

          if (!newWindow || newWindow.closed || typeof newWindow.closed == "undefined") {
            console.log("🚫 Pop-up bloqueado, redirecionando na mesma aba")

            const confirmRedirect = confirm(
              `Olá ${result.first_name || loginData.username}!\n\n` +
                "Você será redirecionado para sua área do investidor. " +
                "Para voltar a esta página, use o botão 'Voltar' do navegador.\n\n" +
                "Deseja continuar?",
            )

            if (confirmRedirect) {
              localStorage.setItem("agroDeriReturnUrl", window.location.href)
              localStorage.setItem(
                "agroDeriUserData",
                JSON.stringify({
                  name: result.first_name || loginData.username,
                  email: loginData.username,
                }),
              )

              window.location.href = investorUrl
            }
          } else {
            console.log("✅ Nova aba aberta com sucesso")
            alert(
              `Bem-vindo, ${result.first_name || loginData.username}! Sua área do investidor foi aberta em uma nova aba.`,
            )
          }
        } else {
          const newWindow = window.open(investorUrl, "_blank")

          if (!newWindow) {
            alert("Pop-ups estão bloqueados. Por favor, permita pop-ups para este site e tente novamente.")
          } else {
            alert(
              `Bem-vindo, ${result.first_name || loginData.username}! Sua área do investidor foi aberta em uma nova aba.`,
            )
          }
        }

        setLoginData({ username: "", password: "" })
      } else {
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

    if (!isPrefilledUser) {
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

    if (!amount || amount < 50) {
      errors.amount = "Valor mínimo de investimento é R$ 50"
    }

    setFormErrors(errors)
    return Object.values(errors).every((error) => error === "")
  }

  const registerUser = async () => {
    try {
      setLoading(true)

      if (isPrefilledUser) {
        setCurrentStep(2)
        updateUrlForStep(2)
        return
      }

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
      }

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
          alert("Registro bem-sucedido!")
          setCurrentStep(2)
          updateUrlForStep(2)
        } else {
          handleRegistrationErrors(result)
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

    if (data.non_field_errors) {
      alert(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors)
    }

    setFormErrors(backendErrors)
  }

  const updateUrlForStep = (step: number) => {
    const stepNames: { [key: number]: string } = {
      0: "",
      1: "cadastro",
      2: "pagamento",
      2.5: "pagamento",
      2.7: "pagamento",
      3: "contrato",
    }

    const stepName = stepNames[step]
    if (stepName) {
      window.history.replaceState({}, "", `/?step=${stepName}`)
    } else {
      window.history.replaceState({}, "", "/")
    }
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
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      updateUrlForStep(newStep)
    }
  }

  const handleBack = () => {
    if (currentStep === 1) {
      resetCheckout()
      updateUrlForStep(0)
    } else if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      updateUrlForStep(newStep)
    }
  }

  const handlePayment = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (paymentMethod === "pix") {
        setCurrentStep(2.5)
        updateUrlForStep(2.5)
      } else if (paymentMethod === "crypto") {
        setCurrentStep(2.7)
        updateUrlForStep(2.7)
      }
    }, 2000)
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
      amount: "",
      password: "",
      confirmPassword: "",
    })
    setSelectedCrypto("")
    setCryptoAddress("")
    setCryptoNetwork("")
    setCryptoNetworkName("")
    setIsPrefilledUser(false)
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
      default:
        setUserData({ ...userData, [field]: value })
    }
  }

  const getPackageIcon = (color: string) => {
    if (color === "blue") return <Sprout className="h-8 w-8" />
    if (color === "yellow") return <Crown className="h-8 w-8" />
    if (color === "purple") return <Star className="h-8 w-8" />
    if (color === "indigo") return <TrendingUp className="h-8 w-8" />
    return <Shield className="h-8 w-8" />
  }

  const getColorClass = (color: string) => {
    if (color === "blue") return "border-blue-200 bg-blue-50 text-[#202d3d]"
    if (color === "yellow") return "border-yellow-200 bg-yellow-50 text-yellow-600"
    if (color === "purple") return "border-purple-200 bg-purple-50 text-purple-600"
    if (color === "indigo") return "border-indigo-200 bg-indigo-50 text-indigo-600"
    return "border-gray-200 bg-gray-50 text-gray-600"
  }

  const getPopularCryptos = () => {
    return AVAILABLE_CRYPTOS.slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/agro-logo.png" alt="AgroDeri Logo" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-[#a1d5df] text-[#202d3d] border-[#a1d5df]">
              Pré-venda Ativa
            </Badge>
            <Button
              size="lg"
              className="bg-[#202d3d] hover:bg-[#1a2530] text-white px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setShowLoginModal(true)}
            >
              🔐 Acompanhar Investimento
            </Button>
          </div>
        </div>
      </header>

      {/* Checkout Section */}
      <section ref={checkoutRef} className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Investir em Tokens AGD</h1>
            <p className="text-xl text-gray-600">Escolha seu pacote e comece a investir no futuro do agronegócio</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep ? "bg-[#202d3d] text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${index <= currentStep ? "text-[#202d3d]" : "text-gray-500"}`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${index < currentStep ? "bg-[#202d3d]" : "bg-gray-200"}`} />
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
                  className={`relative ${pkg.popular ? "ring-2 ring-[#202d3d] scale-105" : ""} hover:shadow-lg transition-all`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#202d3d]">
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
                    <CardDescription className="text-[#202d3d] font-semibold">{pkg.bonus}</CardDescription>
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
                          <CheckCircle className="h-4 w-4 text-[#202d3d] mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full bg-[#202d3d] hover:bg-[#1a2530]" onClick={() => handlePackageSelect(pkg)}>
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

                {/* Só mostrar campos de senha se não for usuário pré-cadastrado */}
                {isPrefilledUser ? (
                  <div className="bg-[#a1d5df] border border-[#a1d5df] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-[#202d3d] rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs">ℹ️</span>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-[#202d3d] mb-1">Usuário já cadastrado</p>
                        <p className="text-[#202d3d]">
                          Seus dados foram pré-preenchidos. Verifique as informações e prossiga com seu investimento.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}

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
                  <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                    Voltar
                  </Button>
                  <Button onClick={handleNext} className="flex-1 bg-[#202d3d] hover:bg-[#1a2530]" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isPrefilledUser ? "Validando..." : "Criando conta..."}
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
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Escolha o método de pagamento:</Label>
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "pix"
                            ? "border-[#202d3d] bg-[#a1d5df]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setPaymentMethod("pix")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-[#202d3d] flex items-center justify-center">
                            {paymentMethod === "pix" && <div className="w-3 h-3 bg-[#202d3d] rounded-full" />}
                          </div>
                          <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "crypto"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setPaymentMethod("crypto")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                            {paymentMethod === "crypto" && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                          </div>
                          <div>
                            <p className="font-medium">Criptomoeda</p>
                            <p className="text-sm text-gray-600">Bitcoin, USDT, Ethereum e outras</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seleção de Crypto se método for crypto */}
                  {paymentMethod === "crypto" && (
                    <div>
                      <Label className="text-base font-medium">Escolha a criptomoeda:</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        {getPopularCryptos().map((crypto) => (
                          <div
                            key={crypto.coin}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedCrypto === crypto.coin
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedCrypto(crypto.coin)}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={crypto.icon || "/placeholder.svg"}
                                alt={crypto.coin}
                                className="w-6 h-6"
                                onError={(e: any) => {
                                  e.target.src = "/placeholder.svg?height=24&width=24"
                                }}
                              />
                              <div>
                                <p className="font-medium text-sm">{crypto.coin}</p>
                                <p className="text-xs text-gray-600">{crypto.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!showAllCryptos && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => setShowAllCryptos(true)}
                        >
                          Ver todas as criptomoedas
                        </Button>
                      )}

                      {showAllCryptos && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                          {AVAILABLE_CRYPTOS.filter(
                            (crypto) => !getPopularCryptos().some((popular) => popular.coin === crypto.coin),
                          ).map((crypto) => (
                            <div
                              key={crypto.coin}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedCrypto === crypto.coin
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setSelectedCrypto(crypto.coin)}
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={crypto.icon || "/placeholder.svg"}
                                  alt={crypto.coin}
                                  className="w-6 h-6"
                                  onError={(e: any) => {
                                    e.target.src = "/placeholder.svg?height=24&width=24"
                                  }}
                                />
                                <div>
                                  <p className="font-medium text-sm">{crypto.coin}</p>
                                  <p className="text-xs text-gray-600">{crypto.name}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Resumo do Investimento */}
                <div className="bg-[#a1d5df] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#202d3d] mb-2">Resumo do Investimento</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Valor investido:</span>
                      <span>R$ {amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Método:</span>
                      <span className="capitalize">
                        {paymentMethod === "pix" ? "PIX" : `${selectedCrypto || "Crypto"}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePayment}
                    className="flex-1 bg-[#202d3d] hover:bg-[#1a2530]"
                    disabled={loading || (paymentMethod === "crypto" && !selectedCrypto)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {paymentMethod === "pix" ? "Gerando PIX..." : "Gerando endereço..."}
                      </>
                    ) : paymentMethod === "pix" ? (
                      "Gerar PIX"
                    ) : (
                      "Gerar Endereço Crypto"
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
                          onError={(e: any) => {
                            console.error("❌ Erro ao carregar QR Code:", qrCodeUrl)
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=256&width=256&text=Erro+ao+carregar+QR+Code"
                            target.style.backgroundColor = "#f3f4f6"
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-500">Erro ao gerar QR Code</p>
                      </div>
                    )}
                  </div>

                  {/* Código PIX Copiar e Colar */}
                  <div className="space-y-2">
                    <Label htmlFor="pixCode">Código PIX:</Label>
                    <div className="relative">
                      <Input id="pixCode" type="text" value={paymentString} readOnly className="bg-gray-50 pr-12" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-1 top-1 h-8 rounded-md"
                        onClick={copyPixCode}
                        disabled={loading}
                      >
                        Copiar
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">Copie o código PIX e cole no aplicativo do seu banco.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePaymentConfirmation}
                    className="flex-1 bg-[#202d3d] hover:bg-[#1a2530]"
                    disabled={checkingPayment}
                  >
                    {checkingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando Pagamento...
                      </>
                    ) : (
                      "Já Paguei! Verificar"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2.7: Endereço Crypto */}
          {currentStep === 2.7 && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pague com Criptomoeda</CardTitle>
                <CardDescription>
                  Envie <span className="font-bold">exatamente</span> o valor solicitado para o endereço abaixo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center">
                  {/* Endereço Crypto */}
                  <div className="space-y-2">
                    <Label htmlFor="cryptoAddress">Endereço {selectedCrypto}:</Label>
                    {cryptoLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando endereço...
                      </>
                    ) : (
                      <>
                        {cryptoAddress ? (
                          <>
                            <div className="relative">
                              <Input
                                id="cryptoAddress"
                                type="text"
                                value={cryptoAddress}
                                readOnly
                                className="bg-gray-50 pr-12"
                              />
                              <Button
                                variant="secondary"
                                size="sm"
                                className="absolute right-1 top-1 h-8 rounded-md"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(cryptoAddress)
                                  alert("Endereço copiado!")
                                }}
                                disabled={loading}
                              >
                                Copiar
                              </Button>
                            </div>
                            <p className="text-sm text-gray-500">
                              Envie {amount} {selectedCrypto} para este endereço.
                            </p>
                            {cryptoNetworkName && (
                              <p className="text-sm text-gray-500">
                                Rede: <span className="font-semibold">{cryptoNetworkName}</span>
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Erro ao gerar endereço.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePaymentConfirmation}
                    className="flex-1 bg-[#202d3d] hover:bg-[#1a2530]"
                    disabled={checkingPayment}
                  >
                    {checkingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando Pagamento...
                      </>
                    ) : (
                      "Já Paguei! Verificar"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirmação e Contrato */}
          {currentStep === 3 && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Confirmação e Contrato</CardTitle>
                <CardDescription>Parabéns! Seu investimento foi realizado com sucesso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contractCreated ? (
                  <>
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-[#202d3d] mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-800">Contrato gerado com sucesso!</p>
                      <p className="text-gray-600">Aguarde a assinatura do contrato para liberar seus tokens.</p>
                    </div>

                    {contractData && contractData.status === "pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">⏳</span>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800 mb-1">Aguardando assinatura</p>
                            <p className="text-yellow-700">
                              Seu contrato está aguardando sua assinatura. Verifique seu e-mail para assinar o contrato.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {documentIdClicksign && (
                      <div className="space-y-2">
                        <Label>ID do Documento Clicksign:</Label>
                        <Input type="text" value={documentIdClicksign} readOnly className="bg-gray-50" />
                      </div>
                    )}

                    {contractDownloadUrl && (
                      <div className="space-y-2">
                        <Label>Link para Download do Contrato:</Label>
                        <a
                          href={contractDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#202d3d] hover:underline"
                        >
                          Baixar Contrato
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-semibold text-gray-800">Gerando contrato...</p>
                    <p className="text-gray-600">Aguarde enquanto geramos seu contrato de investimento.</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={resetCheckout} className="flex-1 bg-transparent">
                    Novo Investimento
                  </Button>
                  <Button
                    className="flex-1 bg-[#202d3d] hover:bg-[#1a2530]"
                    onClick={() => {
                      const investorUrl = `/investor-dashboard?token=none&user=${encodeURIComponent(
                        userData.email,
                      )}&cpf=${unmaskValue(userData.cpf)}`
                      window.open(investorUrl, "_blank")
                    }}
                  >
                    Acessar Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Acessar Área do Investidor</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Entre com seu e-mail e senha para acompanhar seus investimentos.
                </p>
              </div>
            </div>

            <div className="mt-4">
              {loginErrors.general && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <strong className="font-bold">Erro:</strong>
                  <span className="block sm:inline">{loginErrors.general}</span>
                </div>
              )}

              <div className="mb-4">
                <Label htmlFor="username">E-mail</Label>
                <Input
                  type="email"
                  id="username"
                  placeholder="seu@email.com"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className={loginErrors.username ? "border-red-500" : ""}
                />
                {loginErrors.username && <p className="text-red-500 text-xs italic mt-1">{loginErrors.username}</p>}
              </div>

              <div className="mb-4">
                <Label htmlFor="password">Senha</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="Sua senha"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className={loginErrors.password ? "border-red-500" : ""}
                />
                {loginErrors.password && <p className="text-red-500 text-xs italic mt-1">{loginErrors.password}</p>}
              </div>

              <div className="items-center px-4 py-3">
                <Button
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="w-full bg-[#202d3d] hover:bg-[#1a2530]"
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
            </div>

            <div className="bg-gray-50 px-4 py-3 text-right">
              <Button variant="ghost" onClick={() => setShowLoginModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
