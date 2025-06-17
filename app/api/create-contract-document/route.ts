import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userData, amount } = body

    console.log("📄 Criando documento de contrato para:", userData.name)

    // Obter data atual para o contrato
    const now = new Date()
    const day = now.getDate()
    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ]
    const month = months[now.getMonth()]

    console.log("📅 Data do contrato:", `${day} de ${month}`)

    // URL da API externa
    const externalApiUrl =
      "https://api.agroderivative.tech/api/contracts/documents/d32a0375-2fce-4608-87c6-c521bd4ab591/create_document_from_template_on_clicksign/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    // Preparar dados do template
    const templateData = {
      name: userData.name,
      cpf: userData.cpf, // CPF com máscara
      rg: userData.rg, // RG com máscara
      valor: `R$ ${amount.toLocaleString("pt-BR")}`,
      dia: day.toString(),
      mes: month,
    }

    // Gerar filename único
    const timestamp = Date.now()
    const filename = `contrato_${userData.name.replace(/\s+/g, "_").toLowerCase()}_${timestamp}.docx`

    const data = {
      document_title: `Contrato de Investimento - ${userData.name}`,
      filename: filename,
      template_id: "8be7a9a4-9461-41e4-884b-550021451867",
      template_data: templateData,
      metadata: {
        investor_email: userData.email,
        investment_amount: amount,
        created_at: now.toISOString(),
        cpf: userData.cpf,
        phone: userData.phone,
      },
    }

    console.log("📋 Dados do contrato:", JSON.stringify(data, null, 2))

    // Fazer a requisição para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })

    console.log("📊 Status da resposta externa:", response.status)

    const responseData = await response.json()
    console.log("📦 Dados da resposta externa:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log("✅ Documento de contrato criado com sucesso!")

      return NextResponse.json(
        {
          success: true,
          message: "Documento de contrato criado com sucesso",
          document: responseData, // Incluir toda a resposta da API
          contractData: {
            filename: filename,
            templateData: templateData,
            createdAt: now.toISOString(),
            documentIdClicksign: responseData.document_id_clicksign,
            downloadUrl: responseData.clicksign_response?.data?.links?.files?.original,
          },
        },
        { status: 200 },
      )
    } else {
      console.error("❌ Erro ao criar documento:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar documento de contrato",
          details: responseData,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("❌ Erro no proxy de criação de contrato:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
        type: "contract_creation_error",
      },
      { status: 500 },
    )
  }
}
