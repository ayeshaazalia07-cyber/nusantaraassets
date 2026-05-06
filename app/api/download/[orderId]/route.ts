import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  // 1️⃣ Parse params (Next.js 15 wajib await)
  const { orderId } = await params;
  const userId = request.nextUrl.searchParams.get("userId");

  console.log("\n🔍 DEBUG DOWNLOAD API");
  console.log("  ➤ orderId :", orderId);
  console.log("  ➤ userId  :", userId);

  if (!orderId || orderId === "undefined") {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 401 });
  }

  // 2️⃣ Cari order — customer_id di DB bertipe TEXT
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("customer_id, product_id, is_approved, status")
    .eq("id", orderId) // orderId = uuid ✅
    .eq("customer_id", userId) // langsung filter sekalian, lebih efisien
    .single();

  if (orderError || !order) {
    console.error(
      "❌ Order tidak ditemukan atau bukan milik user ini:",
      orderError,
    );
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  console.log("✅ Order ditemukan:", order);

  // 3️⃣ Cek status
  if (order.status !== "approved" || !order.is_approved) {
    console.warn("⏳ Order belum approved:", order.status, order.is_approved);
    return NextResponse.json(
      { error: "Order not approved yet" },
      { status: 403 },
    );
  }

  // 4️⃣ Ambil file_path dari tabel "product" (sesuai schema)
  const { data: product, error: productError } = await supabaseAdmin
    .from("product") // ✅ nama tabel dari schema
    .select("file_path")
    .eq("id", order.product_id) // product_id bertipe bigint ✅
    .single();

  if (productError || !product?.file_path) {
    console.error("❌ Produk/file tidak ditemukan:", productError);
    return NextResponse.json(
      { error: "File produk tidak tersedia" },
      { status: 404 },
    );
  }

  console.log("📁 file_path:", product.file_path);

  // 5️⃣ Buat signed URL (private bucket)
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from("game-assets")
    .createSignedUrl(product.file_path, 60); // expires in 60 detik

  if (signedError || !signedData?.signedUrl) {
    console.error("❌ Gagal buat signed URL:", signedError);
    return NextResponse.json(
      { error: "Gagal membuat link download" },
      { status: 500 },
    );
  }

  console.log("✅ Redirect ke signed URL...");
  return NextResponse.redirect(signedData.signedUrl);
}
