// app/api/download/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// 🔧 SAMA DENGAN frontend – testing 1 menit, produksi ganti ke 3 jam (10_800_000)
const DOWNLOAD_DURATION_MS = 10_800_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const userId = request.nextUrl.searchParams.get("userId");

  console.log("\n🔍 DOWNLOAD API");
  console.log("  orderId:", orderId);
  console.log("  userId :", userId);

  if (!orderId || orderId === "undefined") {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 401 });
  }

  // 1️⃣ Ambil order + kolom first_downloaded_at
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("customer_id, product_id, is_approved, status, first_downloaded_at")
    .eq("id", orderId)
    .eq("customer_id", userId)
    .single();

  if (orderError || !order) {
    console.error("❌ Order tidak ditemukan:", orderError);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  console.log("✅ Order ditemukan:", order);

  // 2️⃣ Cek status approval
  if (order.status !== "approved" || !order.is_approved) {
    return NextResponse.json(
      { error: "Order not approved yet" },
      { status: 403 }
    );
  }

  // 3️⃣ Cek batas waktu download (pakai server time)
  const now = new Date();
  if (order.first_downloaded_at) {
    const firstDownloadTime = new Date(order.first_downloaded_at);
    const elapsed = now.getTime() - firstDownloadTime.getTime();
    if (elapsed >= DOWNLOAD_DURATION_MS) {
      return NextResponse.json(
        { error: "Download link expired" },
        { status: 410 } // Gone
      );
    }
    // Kalau masih berlaku, lanjutkan (tidak perlu update first_downloaded_at)
  } else {
    // 🆕 Pertama kali download → catat timestamp di database
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ first_downloaded_at: now.toISOString() })
      .eq("id", orderId);

    if (updateError) {
      console.error("❌ Gagal update first_downloaded_at:", updateError);
      return NextResponse.json(
        { error: "Gagal memproses download" },
        { status: 500 }
      );
    }
    // Setelah update, kita anggap first_downloaded_at sudah terisi
    order.first_downloaded_at = now.toISOString();
  }

  // 4️⃣ Ambil file_path dari tabel product
  const { data: product, error: productError } = await supabaseAdmin
    .from("product")
    .select("file_path")
    .eq("id", order.product_id)
    .single();

  if (productError || !product?.file_path) {
    return NextResponse.json(
      { error: "File produk tidak tersedia" },
      { status: 404 }
    );
  }

  // 5️⃣ Buat signed URL (private bucket)
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from("game-assets")
    .createSignedUrl(product.file_path, 120); // 2 menit agar cukup

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json(
      { error: "Gagal membuat link download" },
      { status: 500 }
    );
  }

  // 6️⃣ AMBIL file dari signed URL & teruskan ke client
  try {
    const fileResponse = await fetch(signedData.signedUrl);
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil file dari storage" },
        { status: 502 }
      );
    }

    // Siapkan header untuk diteruskan, plus custom header timestamp
    const responseHeaders = new Headers(fileResponse.headers);
    // ⚡ Header ini akan dibaca oleh frontend
    responseHeaders.set(
      "X-First-Downloaded-At",
      order.first_downloaded_at!
    );

    // Kirim file dengan status 200 dan header yang telah dimodifikasi
    return new NextResponse(fileResponse.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("❌ Gagal fetch file dari signed URL:", error);
    return NextResponse.json(
      { error: "Gagal mengunduh file" },
      { status: 500 }
    );
  }
}