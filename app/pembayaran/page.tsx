"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Swal from "sweetalert2";

export default function PembayaranPage() {
  const [metode, setMetode] = useState("qris");
  const [totalTagihan, setTotalTagihan] = useState(0);

  // Ambil total harga dari keranjang
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("nusantaraCart") || "[]");
    const hitungTotal = savedCart.reduce((acc: number, item: any) => {
      const angkaSaja = parseInt(item.harga.replace(/[^0-9]/g, "")) || 0;
      const hargaFinal = item.harga.toLowerCase().includes("k")
        ? angkaSaja * 1000
        : angkaSaja;
      return acc + hargaFinal;
    }, 0);
    setTotalTagihan(hitungTotal);
  }, []);

  // Data nomor pembayaran untuk modal
  const dataNomor: any = {
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
        html: `
          <div style="text-align: center; padding: 10px;">
            <p style="color: #94a3b8; font-size: 14px;">Silakan transfer ke nomor berikut:</p>
            <h2 style="color: #ffd700; margin: 15px 0;">${dataNomor[m]}</h2>
            <p style="font-size: 12px; color: #fff;">Nominal: <b>Rp ${totalTagihan.toLocaleString("id-ID")}</b></p>
          </div>
        `,
        icon: "info",
        confirmButtonColor: "#ffd700",
        confirmButtonText: "Salin & Lanjut",
        background: "#1e293b",
        color: "#fff",
      });
    }
  };

  const handleKonfirmasi = () => {
    Swal.fire({
      title: "Berhasil!",
      text: "Pembayaran kamu sedang di konfirmasi, tunggu 1x24 jam",
      icon: "success",
      confirmButtonColor: "#ffd700",
      confirmButtonText: "Oke, Siap!",
      background: "#1e293b",
      color: "#fff",
    });
  };

  // Daftar logo sesuai nama file di folder img
  const listMetode = [
    { id: "qris", logo: "/img/logo-qris.png" },
    { id: "dana", logo: "/img/logo-dana.png" },
    { id: "shopeepay", logo: "/img/logo-spay.png" },
    { id: "gopay", logo: "/img/logo-gopay.png" },
    { id: "ovo", logo: "/img/logo-ovo.png" },
  ];

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

          {/* --- PILIHAN METODE (HAMBURGER STYLE) --- */}
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

          {/* AREA QRIS */}
          {metode === "qris" && (
            <div className="qr-area">
              <p>Silakan Scan QRIS:</p>
              <div className="qr-wrapper">
                <img
                  src="/img/logo-qris.png"
                  alt="QR Code"
                  className="qr-img"
                />
              </div>
            </div>
          )}

          {metode !== "qris" && (
            <div className="info-bayar-area">
              <p>
                Metode: <b>{metode.toUpperCase()}</b>
              </p>
              <p style={{ fontSize: "11px", color: "#94a3b8" }}>
                Klik konfirmasi jika sudah transfer ke nomor di pop-up.
              </p>
            </div>
          )}

          <button onClick={handleKonfirmasi} className="btn-confirm">
            KONFIRMASI PEMBAYARAN
          </button>
        </div>
      </div>

      <style jsx>{`
        .payment-page {
          background-color: #0f172a;
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
        .payment-sub {
          color: #94a3b8;
          font-size: 14px;
          margin-top: 10px;
        }
        .payment-amount {
          color: #ffd700;
          font-size: 38px;
          margin: 10px 0 30px;
          font-weight: 800;
        }

        /* STYLE TUMPUKAN VERTIKAL */
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
          border-color: #ffd700;
        }

        .method-logo-img {
          height: 22px;
          width: auto;
          object-fit: contain;
        }
        .method-name {
          font-size: 13px;
          font-weight: 800;
        }
        .method-arrow {
          font-size: 20px;
          opacity: 0.5;
        }

        .qr-area {
          background: white;
          padding: 20px;
          border-radius: 20px;
          color: black;
          margin-bottom: 30px;
        }
        .qr-area p {
          font-weight: 700;
          margin-bottom: 15px;
          font-size: 14px;
        }
        .qr-img {
          width: 180px;
          height: 180px;
          object-fit: contain;
        }

        .info-bayar-area {
          background: rgba(255, 255, 255, 0.03);
          padding: 15px;
          border-radius: 15px;
          margin-bottom: 25px;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          box-shadow: 0 10px 20px rgba(255, 215, 0, 0.2);
        }

        @media (max-width: 768px) {
          .payment-container {
            padding: 100px 5% 30px;
          }
          .payment-amount {
            font-size: 30px;
          }
          .payment-box {
            padding: 30px 20px;
          }
        }
      `}</style>
    </main>
  );
}
