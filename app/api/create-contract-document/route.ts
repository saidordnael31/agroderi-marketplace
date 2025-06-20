import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userData, amount } = body

    console.log("📄 Criando contrato completo para:", userData.name)

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

    // URL da nova API
    const externalApiUrl = "https://api.agroderivative.tech/api/contracts/documents/create_full_contract/"

    console.log("🔗 Fazendo requisição para:", externalApiUrl)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "55211ed1-2782-4ae9-b0d1-7569adccd86d",
    }

    // Gerar filename único
    const timestamp = Date.now()
    const cleanName = userData.name.replace(/\s+/g, "_").toLowerCase()
    const filename = `contrato_${cleanName}_${timestamp}.docx`

    // Preparar dados para a nova API
    const contractData = {
      template_data: {
        name: userData.name,
        cpf: userData.cpf, 
        rg: userData.rg,
        valor: `R$ ${amount.toLocaleString("pt-BR")}`,
        dia: day.toString(),
        mes: month,
      },
      document_filename: filename,
      signer_name: userData.name,
      signer_email: userData.email,
      signer_documentation: userData.cpf,
      utm_source:"agroderi_landing_page",
      valor_investido:`R$ ${amount.toLocaleString("pt-BR")}`,
      signer_phone:userData.phone.trim(),
      envelope_name: `Contrato de Investimento AGD - ${userData.name}`,
      notification_message:
        "Seu contrato de investimento AGD está pronto para assinatura. Clique no link para assinar!",
    }

    console.log("📋 Dados do contrato completo:", JSON.stringify(contractData, null, 2))

    // Fazer a requisição para o servidor externo
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(contractData),
    })

    console.log("📊 Status da resposta externa:", response.status)

    const responseData = await response.json()
    console.log("📦 Dados da resposta externa:", JSON.stringify(responseData, null, 2))

    if (response.ok) {
      console.log("✅ Contrato completo criado com sucesso!")

      // Extrair URL de download do arquivo original
      let downloadUrl = null
      if (
        responseData.clicksign_full_response &&
        responseData.clicksign_full_response.document &&
        responseData.clicksign_full_response.document.data &&
        responseData.clicksign_full_response.document.data.links &&
        responseData.clicksign_full_response.document.data.links.files &&
        responseData.clicksign_full_response.document.data.links.files.original
      ) {
        downloadUrl = responseData.clicksign_full_response.document.data.links.files.original
        console.log("📥 URL de download extraída:", downloadUrl)
      }

      return NextResponse.json(
        {
          success: true,
          message: "Contrato completo criado e enviado para assinatura com sucesso!",
          contract: {
            envelope_id: responseData.envelope_id,
            document_id: responseData.document_id,
            signer_id: responseData.signer_id,
            requirement_id: responseData.requirement_id,
            local_document_id: responseData.local_document_id,
            filename: filename,
            downloadUrl: downloadUrl,
            createdAt: now.toISOString(),
          },
          fullResponse: responseData, // Incluir resposta completa para debug
        },
        { status: 200 },
      )
    } else {
      console.error("❌ Erro ao criar contrato completo:", responseData)
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar contrato completo",
          details: responseData,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.error("❌ Erro no proxy de criação de contrato completo:", error)

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
