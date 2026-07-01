// src/services/xendit.service.ts

interface CreateQrParams {
  orderId: string;
  amount: number;
  expiryMinutes?: number;
  recipientName: string;
  recipientPhone: string;
  customerEmail?: string;
}

export async function createXenditQRIS({
  orderId,
  amount,
  expiryMinutes = 60,
  recipientName,
  recipientPhone,
  customerEmail,
}: CreateQrParams) {
  // 1. Encode Secret Key Xendit ke Base64
  const encodedKey = Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString('base64');

  // 2. Hitung Waktu Kedaluwarsa QRIS
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

  // Sanitasi nomor telepon: Xendit memerlukan format string internasional (misal: +62...) atau format nomor bersih
  // Kita pastikan nomor telepon tidak kosong dan membuang karakter non-angka jika diperlukan
  const sanitizedPhone = recipientPhone.replace(/[^0-9+]/g, '');

  // 3. Request ke Endpoint Resmi QR Code Xendit v2022-07-31
  const response = await fetch('https://api.xendit.co/qr_codes', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
      'api-version': '2022-07-31'
    },
    body: JSON.stringify({
      reference_id: orderId,
      external_id: orderId,
      type: 'DYNAMIC', 
      currency: 'IDR',
      amount: amount,
      expires_at: expiryDate.toISOString(),
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/xendit`,
      metadata: {
        source: "GEOMINING"
      },
      customer: {
        given_names: recipientName.substring(0, 255),
        email: customerEmail,
        mobile_number: sanitizedPhone
      }
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal membuat QRIS Xendit melalui Server Gateway");
  }

  return {
    xenditId: data.id,        
    qrString: data.qr_string,  
    expiresAt: data.expires_at,
    status: data.status
  };
}