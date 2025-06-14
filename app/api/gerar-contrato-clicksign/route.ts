export async function POST(request: Request) {
  const { userData, package: selectedPackage, paymentConfirmed } = await request.json()

  if (!paymentConfirmed) {
    return Response.json({ error: "Pagamento não confirmado" }, { status: 400 })
  }

  try {
    // Template do contrato de mútuo
    const contractTemplate = `
    CONTRATO DE MÚTUO PARA AQUISIÇÃO DE TOKENS AGD
    
    MUTUANTE: AgroDeri Tecnologia Ltda.
    MUTUÁRIO: ${userData.name}, CPF: ${userData.cpf}
    
    VALOR: R$ ${userData.amount.toLocaleString()}
    PACOTE: ${selectedPackage.name}
    BÔNUS: ${selectedPackage.bonus}
    CLIFF: ${selectedPackage.cliff} meses
    VESTING: ${selectedPackage.vesting} meses
    
    Data: ${new Date().toLocaleDateString("pt-BR")}
    
    [Restante do contrato com termos legais...]
    `

    // Enviar para Clicksign
    const clicksignResponse = await fetch("https://api.clicksign.com/v1/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLICKSIGN_API_TOKEN}`,
      },
      body: JSON.stringify({
        document: {
          path: `/contratos/agd_${userData.cpf}_${Date.now()}.pdf`,
          content_base64: Buffer.from(contractTemplate).toString("base64"),
          deadline_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          auto_close: true,
          locale: "pt-BR",
        },
        signers: [
          {
            email: userData.email,
            auths: ["email"],
            name: userData.name,
          },
        ],
        message: "Contrato de mútuo para aquisição de tokens AGD - AgroDeri",
      }),
    })

    const clicksignData = await clicksignResponse.json()

    // Enviar e-mail de confirmação
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: userData.email,
        subject: "Investimento AGD Confirmado - Contrato Disponível",
        template: "investment-confirmation",
        data: {
          name: userData.name,
          amount: userData.amount,
          package: selectedPackage.name,
          contractUrl: clicksignData.document.download_url,
        },
      }),
    })

    return Response.json({
      contractUrl: clicksignData.document.download_url,
      contractId: clicksignData.document.key,
    })
  } catch (error) {
    console.error("Erro ao gerar contrato:", error)
    return Response.json({ error: "Erro ao gerar contrato" }, { status: 500 })
  }
}
