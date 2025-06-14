export async function POST(request: Request) {
  const { userData, paymentData, package: selectedPackage } = await request.json()

  try {
    if (paymentData.method === "pix" || paymentData.method === "card") {
      // Integração Mercado Pago
      const mercadoPagoResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [
            {
              title: `AgroDeri - ${selectedPackage.name}`,
              quantity: 1,
              unit_price: userData.amount,
              currency_id: "BRL",
            },
          ],
          payer: {
            name: userData.name,
            email: userData.email,
            phone: {
              number: userData.phone,
            },
            identification: {
              type: "CPF",
              number: userData.cpf,
            },
          },
          payment_methods: {
            excluded_payment_types: paymentData.method === "pix" ? [{ id: "credit_card" }] : [{ id: "pix" }],
          },
          notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/mercadopago`,
          external_reference: `agd_${Date.now()}`,
        }),
      })

      const mercadoPagoData = await mercadoPagoResponse.json()
      return Response.json({ paymentUrl: mercadoPagoData.init_point })
    } else if (paymentData.method === "crypto") {
      // Integração Brasil Bitcoin (B8 CaaS)
      const cryptoResponse = await fetch(`${process.env.B8_API_URL}/generateNewCryptoAddress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.B8_API_TOKEN}`,
        },
        body: JSON.stringify({
          coin: paymentData.cryptoCoin,
          network: paymentData.network,
          userId: userData.email,
          amount: userData.amount,
        }),
      })

      const cryptoData = await cryptoResponse.json()
      return Response.json({ paymentUrl: cryptoData.address, qrCode: cryptoData.qrCode })
    }
  } catch (error) {
    console.error("Erro ao criar checkout:", error)
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
