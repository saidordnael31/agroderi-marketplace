export async function POST(request: Request) {
  const body = await request.json()

  try {
    if (body.type === "payment") {
      const paymentId = body.data.id

      // Consultar detalhes do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      })

      const paymentData = await paymentResponse.json()

      if (paymentData.status === "approved") {
        // Pagamento aprovado - gerar contrato
        const externalReference = paymentData.external_reference

        // Buscar dados do usuário pelo external_reference
        // (você salvaria isso no banco de dados durante o checkout)

        await fetch("/api/gerar-contrato-clicksign", {
          method: "POST",
          headers: { "Content-Type": "application/json",
          'Accept': 'application/json' },
          body: JSON.stringify({
            userData: {
              /* dados do usuário */
            },
            package: {
              /* dados do pacote */
            },
            paymentConfirmed: true,
          }),
        })
      }
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return Response.json({ error: "Erro interno" }, { status: 500 })
  }
}
