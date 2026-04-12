"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
// --- FIREBASE IMPORT ---
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

function PaymentContent() {
  const searchParams = useSearchParams();
  const [metode, setMetode] = useState("qris");
  const [totalTagihan, setTotalTagihan] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const [buktiPembayaran, setBuktiPembayaran] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // 1. Logika Hitung Harga
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
        const angkaSaja = parseInt(item.harga.replace(/[^0-9]/g, "")) || 0;
        const hargaFinal = item.harga.toLowerCase().includes("k")
          ? angkaSaja * 1000
          : angkaSaja;
        return acc + hargaFinal;
      }, 0);
      setTotalTagihan(totalKeranjang);
    }

    // 2. RADAR REAL-TIME (Cek Status Success)
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      const q = query(
        collection(db, "transactions"),
        where("email_pembeli", "==", userEmail),
        where("status", "==", "success"),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setIsSuccess(true);
        }
      });
      return () => unsubscribe();
    }
  }, [searchParams]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBuktiPembayaran(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const dataNomor: any = {
    qris: "Scan QR Code di bawah",
    dana: "0812-3456-7890 (Ayesha Putri)",
    shopeepay: "0812-3456-7890 (Echa)",
    gopay: "0812-3456-7890 (NusantaraAssets)",
    ovo: "0812-3456-7890 (Ayesha Putri Azalia)",
  };

  const selectMetode = (m: string) => {
    setMetode(m);
    if (m !== "qris") {
      Swal.fire({
        title: `Metode ${m.toUpperCase()}`,
        html: `<div style="text-align: center; padding: 10px;"><p style="color: #94a3b8;">Transfer ke:</p><h2 style="color: #ffd700;">${dataNomor[m]}</h2></div>`,
        icon: "info",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  const handleKonfirmasi = async () => {
    if (!buktiPembayaran) return;
    setIsUploading(true);
    Swal.fire({
      title: "Mengirim...",
      text: "Sedang memproses bukti pembayaran",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const base64Image = await convertToBase64(buktiPembayaran);
      await addDoc(collection(db, "transactions"), {
        nama_pembeli: localStorage.getItem("userName") || "Pembeli",
        email_pembeli: localStorage.getItem("userEmail") || "pembeli@gmail.com",
        nama_produk: searchParams.get("nama") || "Aset Nusantara",
        total_harga: totalTagihan,
        metode_bayar: metode,
        bukti_transfer: base64Image,
        status: "pending",
        createdAt: serverTimestamp(),
        verifiedAt: null,
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Silakan tunggu, tampilan akan berubah otomatis jika sudah dikonfirmasi admin.",
        icon: "success",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      });
    } catch (error) {
      Swal.fire("Error", "Gagal mengirim data", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const listMetode = [
    { id: "qris", logo: "/img/logo-qris.png" },
    { id: "dana", logo: "/img/logo-dana.png" },
    { id: "shopeepay", logo: "/img/logo-spay.png" },
    { id: "gopay", logo: "/img/logo-gopay.png" },
    { id: "ovo", logo: "/img/logo-ovo.png" },
  ];

  // --- TAMPILAN JIKA PEMBAYARAN SUDAH SUKSES ---
  if (isSuccess) {
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
            <button
              className="btn-confirm"
              style={{ marginTop: "30px" }}
              onClick={() => window.open("/assets/dummy-file.zip")}
            >
              DOWNLOAD ASSET SEKARANG
            </button>
          </div>
        </div>
        <style jsx>{`
          .payment-page {
            background: #0f172a;
            min-height: 100vh;
            color: white;
          }
          .payment-container {
            padding: 120px 5% 40px;
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
          .payment-title span {
            color: #ffd700;
          }
          .btn-confirm {
            background: #ffd700;
            color: #000;
            border: none;
            width: 100%;
            padding: 18px;
            border-radius: 50px;
            font-weight: 800;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  // --- TAMPILAN FORM PEMBAYARAN ORIGINAL ---
  return (
    <main className="payment-page">
      <Navbar />
      <div className="payment-container">
        <div className="payment-box">
          <h2 className="payment-title">
            Checkout <span>Aset</span>
          </h2>
          <p className="payment-sub">Total Tagihan Kamu:</p>
          <h1 className="payment-amount">
            Rp {totalTagihan.toLocaleString("id-ID")}
          </h1>

          <div className="method-grid">
            {listMetode.map((m) => (
              <button
                key={m.id}
                className={`method-btn ${metode === m.id ? "active" : ""}`}
                onClick={() => selectMetode(m.id)}
              >
                <div className="method-left">
                  <img
                    src={m.logo}
                    alt={m.id}
                    className="method-logo-img"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span className="method-name">{m.id.toUpperCase()}</span>
                </div>
                <span className="method-arrow">›</span>
              </button>
            ))}
          </div>

          {metode === "qris" && (
            <div className="qr-area">
              <p>Silakan Scan QRIS:</p>
              <img src="/img/logo-qris.png" alt="QR" className="qr-img" />
            </div>
          )}

          {metode !== "qris" && (
            <div className="info-bayar-area">
              <p>
                Metode: <b>{metode.toUpperCase()}</b>
              </p>
            </div>
          )}

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
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="img-preview" />
            )}
          </div>

          <button
            onClick={handleKonfirmasi}
            className={`btn-confirm ${!buktiPembayaran || isUploading ? "disabled" : ""}`}
            disabled={!buktiPembayaran || isUploading}
          >
            {isUploading ? "MENGIRIM..." : "KONFIRMASI PEMBAYARAN"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .payment-page {
          background: #0f172a;
          min-height: 100vh;
          color: white;
        }
        .payment-container {
          padding: 120px 5% 40px;
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
        .payment-title {
          font-size: 24px;
          font-weight: 800;
        }
        .payment-title span {
          color: #ffd700;
        }
        .payment-amount {
          color: #ffd700;
          font-size: 38px;
          margin: 10px 0 30px;
          font-weight: 800;
        }
        .method-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 25px;
        }
        .method-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          padding: 15px 20px;
          border-radius: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: 0.3s;
        }
        .method-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .method-btn.active {
          background: #ffd700;
          color: #000;
        }
        .method-logo-img {
          height: 22px;
        }
        .qr-area {
          background: white;
          padding: 20px;
          border-radius: 20px;
          color: black;
          margin-bottom: 30px;
        }
        .qr-img {
          width: 180px;
        }
        .upload-section {
          margin-bottom: 25px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          border: 1px dashed rgba(255, 215, 0, 0.3);
        }
        .custom-upload-btn {
          display: inline-block;
          padding: 10px 20px;
          background: #334155;
          color: #fff;
          border-radius: 10px;
          cursor: pointer;
          font-size: 12px;
        }
        .img-preview {
          max-width: 100%;
          margin-top: 15px;
          border-radius: 10px;
          border: 2px solid #ffd700;
        }
        .btn-confirm {
          background: #ffd700;
          color: #000;
          border: none;
          width: 100%;
          padding: 18px;
          border-radius: 50px;
          font-weight: 800;
          cursor: pointer;
        }
        .btn-confirm.disabled {
          background: #475569;
          color: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

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
