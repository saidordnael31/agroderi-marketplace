import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cpf } = body

    console.log("🔍 Verificando status do pagamento para CPF:", cpf)

    // URL da API externa - verificar se está correta
    const externalApiUrl = `https://api.agroderivative.tech/api/users/profile-by-cpf/?cpf=${cpf}`

    console.log("🔗 URL completa da requisição:", externalApiUrl)

    const headers = {
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
      "User-Agent": "AgroDeri-Frontend/1.0",
    }

    console.log("📋 Headers enviados:", headers)

    // Fazer a requisição GET para o servidor externo com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

    let response
    try {
      response = await fetch(externalApiUrl, {
        method: "GET",
        headers: headers,
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error("❌ Erro na requisição fetch:", fetchError)

      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            confirmed: false,
            error: "Timeout na requisição - API externa demorou para responder",
            details: "Timeout após 10 segundos",
          },
          { status: 200 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          confirmed: false,
          error: "Erro de conexão com a API externa",
          details: fetchError.message,
        },
        { status: 200 },
      )
    }

    clearTimeout(timeoutId)

    console.log("📊 Status da resposta externa:", response.status)
    console.log("📊 Headers da resposta:", Object.fromEntries(response.headers.entries()))

    // Verificar se a resposta é válida
    if (!response.ok) {
      console.error("❌ Resposta não OK:", response.status, response.statusText)

      // Tentar ler o corpo da resposta mesmo com erro
      let errorText = ""
      try {
        errorText = await response.text()
        console.log("📄 Corpo da resposta de erro:", errorText)
      } catch (e) {
        console.log("❌ Não foi possível ler o corpo da resposta de erro")
      }

      if (response.status === 404) {
        console.log("🔍 Usuário não encontrado (CPF não cadastrado)")
        return NextResponse.json(
          {
            success: true,
            confirmed: false,
            message: "Usuário não encontrado. Verifique se o CPF está correto ou se o cadastro foi realizado.",
            data: null,
            debug: {
              url: externalApiUrl,
              status: response.status,
              errorBody: errorText,
            },
          },
          { status: 200 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          confirmed: false,
          error: `Erro na API externa: ${response.status} - ${response.statusText}`,
          details: errorText,
          debug: {
            url: externalApiUrl,
            status: response.status,
          },
        },
        { status: 200 },
      )
    }

    let responseData
    try {
      responseData = await response.json()
      console.log("📦 Dados da resposta externa:", JSON.stringify(responseData, null, 2))
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse da resposta:", parseError)
      const textResponse = await response.text()
      console.log("📄 Resposta como texto:", textResponse)

      return NextResponse.json(
        {
          success: false,
          confirmed: false,
          error: "Erro ao processar resposta da API",
          details: textResponse,
        },
        { status: 200 },
      )
    }

    // Verificar se encontrou o usuário
    if (response.status === 200 && responseData) {
      console.log("✅ Perfil do usuário encontrado!")

      // Verificar campos de depósito PIX
      const depositValue = responseData.deposit_value
      console.log("💰 Valor do depósito PIX encontrado:", depositValue)

      // Verificar campos de depósito CRYPTO (novos campos)
      const depositCryptoValue = responseData.deposit_crypto_value
      const depositCryptoName = responseData.deposit_crypto_name
      console.log("🪙 Valor do depósito crypto encontrado:", depositCryptoValue)
      console.log("🪙 Nome da crypto encontrada:", depositCryptoName)

      // Verificar se há algum tipo de depósito confirmado
      const hasPixDeposit = depositValue && Number.parseFloat(depositValue) > 0
      const hasCryptoDeposit =
        depositCryptoValue &&
        depositCryptoName &&
        depositCryptoValue !== "0.0" &&
        depositCryptoValue !== null &&
        depositCryptoName !== "0.0" &&
        depositCryptoName !== null &&
        Number.parseFloat(depositCryptoValue) > 0

      console.log("💰 Tem depósito PIX:", hasPixDeposit)
      console.log("🪙 Tem depósito Crypto:", hasCryptoDeposit)

      if (hasPixDeposit || hasCryptoDeposit) {
        const paymentType = hasPixDeposit ? "PIX" : "Crypto"
        const paymentValue = hasPixDeposit ? depositValue : depositCryptoValue
        const cryptoInfo = hasCryptoDeposit ? ` (${depositCryptoName})` : ""

        console.log(`✅ Pagamento ${paymentType} confirmado! Valor: ${paymentValue}${cryptoInfo}`)

        return NextResponse.json(
          {
            success: true,
            confirmed: true,
            message: `Pagamento ${paymentType} confirmado`,
            paymentType: paymentType.toLowerCase(),
            data: {
              user_id: responseData.id,
              username: responseData.username,
              email: responseData.email,
              first_name: responseData.first_name,
              last_name: responseData.last_name,
              cpf: responseData.cpf,
              whatsapp: responseData.whatsapp,
              rg: responseData.rg,
              deposit_value: responseData.deposit_value,
              deposit_crypto_value: responseData.deposit_crypto_value,
              deposit_crypto_name: responseData.deposit_crypto_name,
              contract_generated_successfully: responseData.contract_generated_successfully,
            },
          },
          { status: 200 },
        )
      } else {
        console.log("⏳ Usuário encontrado, mas sem depósito confirmado ainda")
        return NextResponse.json(
          {
            success: true,
            confirmed: false,
            message: "Usuário encontrado, mas nenhum pagamento foi processado ainda",
            data: {
              user_id: responseData.id,
              email: responseData.email,
              deposit_value: responseData.deposit_value,
              deposit_crypto_value: responseData.deposit_crypto_value,
              deposit_crypto_name: responseData.deposit_crypto_name,
            },
          },
          { status: 200 },
        )
      }
    } else {
      console.log("❌ Resposta inesperada da API:", response.status, responseData)
      return NextResponse.json(
        {
          success: false,
          confirmed: false,
          error: `Resposta inesperada da API: ${response.status}`,
          data: responseData,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("❌ Erro ao verificar status do pagamento:", error)

    // Retornar erro mas com status 200 para não quebrar o fluxo
    return NextResponse.json(
      {
        success: false,
        confirmed: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "payment_status_error",
      },
      { status: 200 },
    )
  }
}
