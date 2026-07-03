import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason } = await request.json();

    if (!orderId || !reason) {
      return NextResponse.json(
        { error: "Missing orderId or reason" },
        { status: 400 }
      );
    }

    // Ambil data order + customer + product
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        created_at,
        metode_pembayaran,
        customer_id,
        product_id,
        customers ( full_name, email ),
        product ( nama, harga )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("❌ Order tidak ditemukan:", orderError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const rawCustomers = order.customers as any;
    const rawProducts = order.product as any;
    const customer = Array.isArray(rawCustomers) ? rawCustomers[0] : rawCustomers;
    const product = Array.isArray(rawProducts) ? rawProducts[0] : rawProducts;

    if (!customer?.email) {
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 404 }
      );
    }

    const customerName = customer.full_name ?? "Pelanggan";
    const productName = product?.nama ?? `Produk #${order.product_id}`;
    const productPrice = product?.harga
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(product.harga)
      : "—";
    const orderDate = new Date(order.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const shortId = order.id.slice(0, 8).toUpperCase();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "NusantaraAssets <noreply@nusantaraassets.com>",
      to: [customer.email],
      subject: `Pesanan #${shortId} Ditolak`,
      html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark">
  <title>Pesanan Ditolak</title>
  <style>
    :root {
      color-scheme: dark;
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0b1120;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;background:rgba(255,215,0,0.1);border-radius:16px;padding:14px 24px;">
                <span style="font-size:22px;font-weight:800;color:#ffd700;letter-spacing:-0.5px;">Nusantara<span style="color:#fff;">Assets</span></span>
              </div>
            </td>
          </tr>

          <!-- Card utama -->
          <tr>
            <td style="background:#1e293b;border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

              <!-- Icon + Heading -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:36px 32px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px auto;">
                      <tr>
                        <td align="center" valign="middle" style="width:64px; height:64px; background:rgba(239,68,68,0.12); border-radius:50%; font-size:28px; color:#ef4444; line-height:1;">
                          ✕
                        </td>
                      </tr>
                    </table>
                    <h1 style="color:#fff;font-size:24px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">
                      Pesanan Ditolak
                    </h1>
                    <p style="color:#94a3b8;font-size:15px;margin:0;line-height:1.5;">
                      Hei <strong style="color:#e2e8f0;">${customerName}</strong>, kami menyesal memberitahukan bahwa pesananmu <strong style="color:#f87171;">tidak dapat disetujui</strong>.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 32px;">
                    <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
                  </td>
                </tr>

                <!-- Detail order -->
                <tr>
                  <td style="padding:24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1.5px;">Kode Transaksi</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#ffd700;font-family:monospace;">#${shortId}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1.5px;">Produk</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#e2e8f0;">${productName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1.5px;">Harga</p>
                                <p style="margin:0;font-size:14px;font-weight:700;color:#4ade80;">${productPrice}</p>
                              </td>
                              <td width="50%">
                                <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1.5px;">Metode Bayar</p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:#e2e8f0;">${order.metode_pembayaran?.toUpperCase() ?? "—"}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1.5px;">Tanggal Order</p>
                          <p style="margin:0;font-size:14px;color:#94a3b8;">${orderDate}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Alasan Penolakan -->
                <tr>
                  <td style="padding:0 32px 24px;">
                    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:16px 18px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:1px;">Alasan Penolakan</p>
                      <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.6;">
                        ${reason.replace(/\n/g, "<br/>")}
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 32px 28px;">
                    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
                      Silakan periksa kembali bukti transfer atau hubungi <a href="mailto:support@nusantaraassets.com" style="color:#ffd700;text-decoration:none;">support@nusantaraassets.com</a> untuk informasi lebih lanjut.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:0 32px 36px;">
                    <a href="${siteUrl}/pesanan" style="display:inline-block;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.2);color:#ffd700;font-size:15px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:30px;letter-spacing:-0.2px;">
                      Lihat Detail Pesanan
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="color:#334155;font-size:12px;margin:0;line-height:1.6;">
                Email ini dikirim otomatis oleh sistem NusantaraAssets.<br/>
                Jika kamu merasa ini keliru, silakan hubungi tim support kami.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (emailError) {
      console.error("❌ Resend error (reject):", emailError);
      return NextResponse.json(
        { error: "Gagal kirim email penolakan", detail: emailError },
        { status: 500 }
      );
    }

    console.log("✅ Email penolakan terkirim:", emailData?.id);
    return NextResponse.json({ success: true, emailId: emailData?.id });
  } catch (err) {
    console.error("❌ Server error (reject):", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}