// Paymob Payment Integration for Egypt
// See: https://paymob.com/

export interface PaymobConfig {
  apiKey: string;
  integrationId: number;
  iframeId: number;
  orderId: string;
  amount: number; // in EGP piasters (100 piasters = 1 EGP)
  currency: string;
  billingData: {
    apartment: string;
    email: string;
    floor: string;
    first_name: string;
    street: string;
    building: string;
    phone_number: string;
    shipping_method: string;
    postal_code: string;
    city: string;
    country: string;
    last_name: string;
    state: string;
  };
}

export async function createPaymobOrder(config: PaymobConfig) {
  try {
    // Step 1: Get auth token
    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.apiKey,
      }),
    });
    
    const { token } = await authResponse.json();
    
    // Step 2: Create order
    const orderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: false,
        amount_cents: config.amount * 100, // Convert EGP to piasters
        currency: "EGP",
        merchant_order_id: config.orderId,
        items: [],
      }),
    });
    
    const orderData = await orderResponse.json();
    
    // Step 3: Get payment key
    const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: config.amount * 100,
        expiration: 3600,
        order_id: orderData.id,
        billing_data: config.billingData,
        currency: "EGP",
        integration_id: config.integrationId,
      }),
    });
    
    const { token: paymentKey } = await paymentKeyResponse.json();
    
    return {
      paymentKey,
      orderId: orderData.id,
      iframeId: config.iframeId,
    };
  } catch (error) {
    console.error("Paymob error:", error);
    throw error;
  }
}

export function getPaymobIframeUrl(iframeId: number, paymentKey: string) {
  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
}

