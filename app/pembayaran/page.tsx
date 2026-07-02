"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import emailjs from "@emailjs/browser";
// --- FIREBASE IMPORT (dipertahankan untuk real-time status cek) ---
import { db } from "@/app/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
// --- SUPABASE IMPORT ---
import { createSupabaseBrowser } from "@/app/lib/supabase/client";

// ✅ Generate Transaction ID format: TRNSKSI-xxxxxxxx
function generateTransactionId(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 8; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TRNSKSI-${random}`;
}

// ─── Daftar metode pembayaran ─────────────────────────────────────────────────
const listMetode = [
  { id: "qris", label: "QRIS", logo: "/img/logo-qris.png" },
  { id: "dana", label: "DANA", logo: "/img/logo-dana.png" },
  { id: "shopeepay", label: "ShopeePay", logo: "/img/logo-spay.png" },
  { id: "gopay", label: "GoPay", logo: "/img/logo-gopay.png" },
  { id: "ovo", label: "OVO", logo: "/img/logo-ovo.png" },
];

// ─── Data instruksi per metode ────────────────────────────────────────────────
const dataMetode: Record<
  string,
  { tipe: "qris" | "ewallet"; nomor?: string; nama?: string }
> = {
  qris: { tipe: "qris" },
  dana: {
    tipe: "ewallet",
    nomor: "+62 821-3753-4026",
    nama: "Nova Chauliyatul Faizah",
  },
  shopeepay: {
    tipe: "ewallet",
    nomor: "+62 821-3753-4026",
    nama: "NOVA CHAULIYATUL FAIZAH",
  },
  gopay: {
    tipe: "ewallet",
    nomor: "+62 821-3753-4026",
    nama: "NOVA CHAULIYATUL FAIZAH",
  },
  ovo: {
    tipe: "ewallet",
    nomor: "+62 821-3753-4026",
    nama: "Nova Chauliyatul Faizah",
  },
};

// ─── Helper: format Rupiah ────────────────────────────────────────────────────
function formatRupiah(nilai: number): string {
  return "Rp " + nilai.toLocaleString("id-ID");
}

// ─── Komponen: Instruksi Pembayaran Dinamis ───────────────────────────────────
function InstruksiPembayaran({
  metode,
  totalTagihan,
}: {
  metode: string;
  totalTagihan: number;
}) {
  const info = dataMetode[metode];
  if (!info) return null;

  if (info.tipe === "qris") {
    return (
      <div className="instruksi-box">
        <p className="instruksi-judul">Scan QRIS untuk membayar</p>
        <p className="instruksi-nominal">
          Nominal: <strong>{formatRupiah(totalTagihan)}</strong>
        </p>
        <div className="qr-wrapper">
          <img
            src="/img/qriss-na.png"
            alt="QRIS NusantaraAssets"
            className="qr-img"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
            }}
          />
        </div>
        <p className="instruksi-note">
          Buka aplikasi e-wallet apapun, pilih Scan QR, lalu arahkan ke kode di
          atas.
        </p>
      </div>
    );
  }

  return (
    <div className="instruksi-box">
      <p className="instruksi-judul">
        Transfer ke {metode.charAt(0).toUpperCase() + metode.slice(1)}
      </p>
      <div className="instruksi-detail">
        <div className="instruksi-row">
          <span className="instruksi-label">Nomor</span>
          <span className="instruksi-value instruksi-highlight">
            {info.nomor}
          </span>
        </div>
        <div className="instruksi-row">
          <span className="instruksi-label">Atas Nama</span>
          <span className="instruksi-value">{info.nama}</span>
        </div>
        <div className="instruksi-row">
          <span className="instruksi-label">Nominal</span>
          <span className="instruksi-value instruksi-highlight">
            {formatRupiah(totalTagihan)}
          </span>
        </div>
      </div>
      <p className="instruksi-note">
        Transfer tepat sesuai nominal agar verifikasi lebih cepat.
      </p>
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
function PaymentContent() {
  const searchParams = useSearchParams();
  const [metode, setMetode] = useState("qris");
  const [totalTagihan, setTotalTagihan] = useState(0);

  // ✅ Status dipisah jadi isApproved & isRejected
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  // State untuk menyimpan URL file asli dari database
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  const [buktiPembayaran, setBuktiPembayaran] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // 1. Logika Hitung Harga (dipertahankan 100%)
    const hargaParams = searchParams.get("harga") || "";
    if (hargaParams) {
      const angkaSaja = parseInt(hargaParams.replace(/[^0-9]/g, "")) || 0;
      const totalDirect = hargaParams.toLowerCase().includes("k")
        ? angkaSaja * 1000
        : angkaSaja;
      setTotalTagihan(totalDirect);
    } else {
      const savedCart = JSON.parse(
        localStorage.getItem("nusantaraCart") || "[]",
      );
      const totalKeranjang = savedCart.reduce((acc: number, item: any) => {
        const hargaStr = String(item.harga || "0");
        const angkaSaja = parseInt(hargaStr.replace(/[^0-9]/g, "")) || 0;
        const hargaFinal = hargaStr.toLowerCase().includes("k")
          ? angkaSaja * 1000
          : angkaSaja;
        return acc + hargaFinal;
      }, 0);
      setTotalTagihan(totalKeranjang);
    }

    // 2. RADAR REAL-TIME — cek status approved & rejected (dipertahankan 100%)
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      // --- Listener: APPROVED ---
      const qApproved = query(
        collection(db, "transactions"),
        where("email_pembeli", "==", userEmail),
        where("status", "==", "approved"),
      );

      const unsubscribeApproved = onSnapshot(qApproved, (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          if (docData.download_link) {
            setDownloadUrl(docData.download_link);
          }
          const timeConfirmed =
            docData.verifiedAt?.toDate() || docData.createdAt?.toDate();
          if (timeConfirmed) {
            const sekarang = new Date();
            const selisihJam =
              (sekarang.getTime() - timeConfirmed.getTime()) / (1000 * 60 * 60);
            if (selisihJam < 3) {
              setIsApproved(true);
              setIsRejected(false);
            } else {
              setIsApproved(false);
            }
          }
        } else {
          setIsApproved(false);
        }
      });

      // --- Listener: REJECTED ---
      const qRejected = query(
        collection(db, "transactions"),
        where("email_pembeli", "==", userEmail),
        where("status", "==", "rejected"),
      );

      const unsubscribeRejected = onSnapshot(qRejected, (snapshot) => {
        if (!snapshot.empty) {
          setIsRejected(true);
          setIsApproved(false);
        } else {
          setIsRejected(false);
        }
      });

      return () => {
        unsubscribeApproved();
        unsubscribeRejected();
      };
    }
  }, [searchParams]);

  // ── Handle file upload (dipertahankan + validasi 700KB) ──────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 700 * 1024;
      if (file.size > maxSize) {
        Swal.fire({
          title: "File Terlalu Besar!",
          text: "Maksimal ukuran file adalah 700KB agar transaksi lancar.",
          icon: "warning",
          confirmButtonColor: "#ffd700",
          background: "#1e293b",
          color: "#fff",
        });
        e.target.value = "";
        setBuktiPembayaran(null);
        setPreviewUrl(null);
        return;
      }
      setBuktiPembayaran(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ── Handle konfirmasi pembayaran (DIUBAH AGAR SUPPORT KERANJANG & REDIRECT KE /pesanan) ─────────
  const handleKonfirmasi = async () => {
    const productIdParam = searchParams.get("id");
    const savedCart = JSON.parse(localStorage.getItem("nusantaraCart") || "[]");

    if (!productIdParam && savedCart.length === 0) {
      Swal.fire({
        title: "Produk Tidak Ditemukan!",
        text: "Keranjang kosong atau produk tidak valid. Kembali ke katalog dan coba lagi.",
        icon: "error",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }

    if (!buktiPembayaran) {
      Swal.fire({
        title: "Bukti Pembayaran Belum Dipilih!",
        text: "Silakan upload bukti pembayaran terlebih dahulu.",
        icon: "warning",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(buktiPembayaran.type)) {
      Swal.fire({
        title: "Format File Tidak Didukung!",
        text: "Hanya file PNG dan JPG/JPEG yang diperbolehkan.",
        icon: "error",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }

    setIsUploading(true);
    Swal.fire({
      title: "Mengirim...",
      text: "Sedang memproses bukti pembayaran dan notifikasi admin",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const supabase = createSupabaseBrowser();
      const transactionId = generateTransactionId();

      const extMap: Record<string, string> = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
      };
      const ext = extMap[buktiPembayaran.type];
      const filePath = `bukti-bayar/${transactionId}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("pembayaran")
        .upload(filePath, buktiPembayaran, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const customerId =
        localStorage.getItem("userId") || localStorage.getItem("userUid") || "";

      let ordersToInsert = [];

      if (productIdParam) {
        ordersToInsert.push({
          customer_id: customerId,
          product_id: parseInt(productIdParam),
          metode_pembayaran: metode,
          bukti_transfer_url: filePath,
          status: "pending",
        });
      } else {
        ordersToInsert = savedCart.map((item: any) => ({
          customer_id: customerId,
          product_id: parseInt(item.id || item.product_id),
          metode_pembayaran: metode,
          bukti_transfer_url: filePath,
          status: "pending",
        }));
      }

      const { error: dbError } = await supabase
        .from("orders")
        .insert(ordersToInsert);

      if (dbError) throw dbError;

      const emailParams = {
        from_name: localStorage.getItem("userName") || "Pembeli",
        user_email: localStorage.getItem("userEmail") || "Tidak ada email",
        product_name: productIdParam
          ? searchParams.get("nama") || "Aset Nusantara"
          : "Checkout Keranjang",
        total_price: totalTagihan.toLocaleString("id-ID"),
        payment_method: metode.toUpperCase(),
        order_id: transactionId,
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        emailParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );

      // Hapus keranjang jika dari cart
      if (!productIdParam) {
        localStorage.removeItem("nusantaraCart");
        window.dispatchEvent(new Event("storage"));
      }

      // ✅ MODIFIKASI: Arahkan ke /pesanan setelah sukses
      Swal.fire({
        title: "Berhasil!",
        text: "Silakan tunggu, tampilan akan berubah otomatis jika sudah dikonfirmasi admin.",
        icon: "success",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      }).then(() => {
        window.location.href = "/pesanan";
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: error?.message || "Gagal mengirim data, coba lagi.",
        icon: "error",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ UI: Pembayaran APPROVED
  // ─────────────────────────────────────────────────────────────────────────
  if (isApproved) {
    return (
      <main className="payment-page">
        <Navbar />
        <div className="payment-container">
          <div className="payment-box">
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>✅</div>
            <h2 className="payment-title">
              Pembayaran <span>Berhasil!</span>
            </h2>
            <p className="payment-sub">Aset kamu sudah siap diunduh.</p>
            <div
              style={{
                background: "rgba(255, 215, 0, 0.1)",
                padding: "15px",
                borderRadius: "15px",
                marginTop: "20px",
                border: "1px dashed #ffd700",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#ffd700",
                  lineHeight: "1.6",
                }}
              >
                "Halaman ini akan hilang setelah 3 jam, pastikan kamu sudah
                mengunduh assets mu ya! Terimakasih"
              </p>
            </div>
            <button
              className="btn-confirm"
              style={{ marginTop: "30px" }}
              onClick={() => {
                if (downloadUrl) {
                  window.open(downloadUrl);
                } else {
                  Swal.fire(
                    "Sabar ya!",
                    "Admin sedang menyiapkan link download untukmu.",
                    "info",
                  );
                }
              }}
            >
              DOWNLOAD ASSET SEKARANG
            </button>
          </div>
        </div>
        <PayStyles />
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ UI: Pembayaran REJECTED
  // ─────────────────────────────────────────────────────────────────────────
  if (isRejected) {
    return (
      <main className="payment-page">
        <Navbar />
        <div className="payment-container">
          <div className="payment-box">
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>❌</div>
            <h2 className="payment-title">
              Pembayaran <span style={{ color: "#f87171" }}>Ditolak</span>
            </h2>
            <p className="payment-sub">
              Maaf, bukti pembayaran kamu tidak dapat diverifikasi oleh admin.
            </p>
            <div
              style={{
                background: "rgba(248, 113, 113, 0.1)",
                padding: "15px",
                borderRadius: "15px",
                marginTop: "20px",
                border: "1px dashed #f87171",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#f87171",
                  lineHeight: "1.6",
                }}
              >
                Kemungkinan bukti tidak valid atau nominal tidak sesuai. Silakan
                hubungi admin atau coba lagi dengan bukti yang benar.
              </p>
            </div>
            <button
              className="btn-confirm"
              style={{
                marginTop: "30px",
                background: "#f87171",
                color: "#fff",
              }}
              onClick={() => window.location.reload()}
            >
              COBA LAGI
            </button>
            <button
              style={{
                marginTop: "12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#94a3b8",
                width: "100%",
                padding: "14px",
                borderRadius: "50px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "13px",
              }}
              onClick={() =>
                window.open("https://wa.me/6282137534026", "_blank")
              }
            >
              HUBUNGI ADMIN
            </button>
          </div>
        </div>
        <PayStyles />
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ✅ UI: Form Pembayaran (default)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="payment-page">
      <Navbar />
      <div className="payment-container">
        <div className="payment-box">
          {/* ── Header ── */}
          <h2 className="payment-title">
            Checkout <span>Aset</span>
          </h2>
          <p className="payment-sub">Total Tagihan Kamu:</p>
          <h1 className="payment-amount">{formatRupiah(totalTagihan)}</h1>

          {/* ── Pilih Metode Pembayaran (Card/Tab) ── */}
          <p className="section-label">Pilih Metode Pembayaran:</p>
          <div className="method-grid">
            {listMetode.map((m) => (
              <button
                key={m.id}
                className={`method-btn ${metode === m.id ? "active" : ""}`}
                onClick={() => setMetode(m.id)}
              >
                <div className="method-left">
                  <img
                    src={m.logo}
                    alt={m.label}
                    className="method-logo-img"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span className="method-name">{m.label}</span>
                </div>
                {metode === m.id && <span className="method-check">✓</span>}
              </button>
            ))}
          </div>

          {/* ── Instruksi Pembayaran Dinamis — menyesuaikan metode & total ── */}
          <InstruksiPembayaran metode={metode} totalTagihan={totalTagihan} />

          {/* ── Upload Bukti Pembayaran ── */}
          <div className="upload-section">
            <p className="upload-label">Wajib Upload Bukti Pembayaran:</p>
            <input
              type="file"
              accept="image/*"
              id="file-upload"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="file-upload" className="custom-upload-btn">
              {buktiPembayaran ? "Ganti Gambar" : "Pilih File Bukti"}
            </label>
            <p
              style={{
                fontSize: "10px",
                color: "#f87171",
                fontStyle: "italic",
                marginTop: "10px",
              }}
            >
              *Maksimal ukuran file adalah 700KB!
            </p>
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="img-preview" />
            )}
          </div>

          {/* ── Tombol Konfirmasi ── */}
          <button
            onClick={handleKonfirmasi}
            className={`btn-confirm ${!buktiPembayaran || isUploading ? "disabled" : ""}`}
            disabled={!buktiPembayaran || isUploading}
          >
            {isUploading ? "MENGIRIM..." : "KONFIRMASI PEMBAYARAN"}
          </button>
        </div>
      </div>
      <PayStyles />
    </main>
  );
}

// ─── Styles terpusat ──────────────────────────────────────────────────────────
function PayStyles() {
  return (
    <style jsx global>{`
      .payment-page {
        background: #0f172a;
        min-height: 100vh;
        color: white;
      }
      .payment-container {
        padding: 120px 5% 60px;
        display: flex;
        justify-content: center;
      }
      .payment-box {
        background: #1e293b;
        padding: 40px;
        border-radius: 30px;
        max-width: 480px;
        width: 100%;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      /* ── Header ── */
      .payment-title {
        font-size: 24px;
        font-weight: 800;
        margin: 0 0 6px;
      }
      .payment-title span {
        color: #ffd700;
      }
      .payment-sub {
        color: #94a3b8;
        font-size: 14px;
        margin: 8px 0 4px;
      }
      .payment-amount {
        color: #ffd700;
        font-size: 38px;
        margin: 6px 0 28px;
        font-weight: 800;
      }

      /* ── Metode Pembayaran ── */
      .section-label {
        font-size: 13px;
        color: #94a3b8;
        text-align: left;
        margin-bottom: 12px;
        font-weight: 600;
      }
      .method-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 24px;
      }
      .method-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1.5px solid rgba(255, 255, 255, 0.08);
        color: white;
        padding: 14px 18px;
        border-radius: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition:
          border-color 0.2s,
          background 0.2s,
          transform 0.1s;
        text-align: left;
      }
      .method-btn:hover {
        border-color: rgba(255, 215, 0, 0.35);
        background: rgba(255, 215, 0, 0.04);
        transform: translateX(2px);
      }
      .method-btn.active {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.08);
      }
      .method-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .method-logo-img {
        height: 24px;
        width: auto;
        object-fit: contain;
      }
      .method-name {
        font-size: 14px;
        font-weight: 700;
        color: white;
      }
      .method-check {
        color: #ffd700;
        font-size: 14px;
        font-weight: 800;
        width: 24px;
        height: 24px;
        background: rgba(255, 215, 0, 0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* ── Instruksi Pembayaran Dinamis ── */
      .instruksi-box {
        background: rgba(255, 215, 0, 0.04);
        border: 1px dashed rgba(255, 215, 0, 0.35);
        border-radius: 18px;
        padding: 22px 20px;
        margin-bottom: 24px;
        text-align: left;
        animation: fadeSlideIn 0.22s ease;
      }
      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .instruksi-judul {
        font-size: 14px;
        font-weight: 700;
        color: #ffd700;
        margin: 0 0 14px;
      }
      .instruksi-nominal {
        font-size: 13px;
        color: #94a3b8;
        margin: 0 0 16px;
      }
      .instruksi-nominal strong {
        color: #ffd700;
        font-size: 15px;
      }
      .instruksi-detail {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 14px;
      }
      .instruksi-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      }
      .instruksi-label {
        color: #64748b;
      }
      .instruksi-value {
        color: white;
        font-weight: 600;
        text-align: right;
      }
      .instruksi-highlight {
        color: #ffd700;
        font-size: 15px;
        font-weight: 800;
      }
      .instruksi-note {
        font-size: 11px;
        color: #f59e0b;
        margin: 0;
        line-height: 1.6;
      }

      /* ── QRIS area ── */
      .qr-wrapper {
        display: flex;
        justify-content: center;
        margin: 4px 0 16px;
      }
      .qr-img {
        width: 180px;
        height: 180px;
        object-fit: contain;
        border-radius: 12px;
        background: white;
        padding: 10px;
      }

      /* ── Upload Section ── */
      .upload-section {
        margin-bottom: 25px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 20px;
        border: 1px dashed rgba(255, 215, 0, 0.3);
      }
      .upload-label {
        font-size: 13px;
        color: #94a3b8;
        margin-bottom: 12px;
      }
      .custom-upload-btn {
        display: inline-block;
        padding: 10px 20px;
        background: #334155;
        color: #fff;
        border-radius: 10px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      .custom-upload-btn:hover {
        background: #475569;
      }
      .img-preview {
        max-width: 100%;
        margin-top: 15px;
        border-radius: 10px;
        border: 2px solid #ffd700;
      }

      /* ── Tombol Konfirmasi ── */
      .btn-confirm {
        background: #ffd700;
        color: #000;
        border: none;
        width: 100%;
        padding: 18px;
        border-radius: 50px;
        font-weight: 800;
        cursor: pointer;
        font-size: 15px;
        letter-spacing: 0.4px;
        transition:
          opacity 0.2s,
          transform 0.1s;
      }
      .btn-confirm:hover:not(.disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .btn-confirm.disabled {
        background: #475569;
        color: #94a3b8;
        cursor: not-allowed;
        transform: none;
      }
    `}</style>
  );
}

// ─── Export dengan Suspense wrapper (wajib karena useSearchParams) ────────────
export default function PembayaranPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{ color: "white", textAlign: "center", marginTop: "100px" }}
        >
          Memuat...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}