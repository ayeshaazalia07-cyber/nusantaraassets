"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createSupabaseBrowser } from "@/app/lib/supabase/client"; // ✅ WAJIB IMPORT SUPABASE

function DetailContent() {
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // State untuk loading tombol Unduh Gratis

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const id = searchParams.get("id") || "";
  const nama = searchParams.get("nama") || "Aset Nusantara";
  const rawHarga = searchParams.get("harga") || "Rp 70k";
  const desc =
    searchParams.get("desc") ||
    "Aset berkualitas tinggi dari kebudayaan Nusantara.";
  const previewImg = searchParams.get("img") || "/img/logo-preview.jpg";

  const isTrial = searchParams.get("isTrial") === "true";
  const fileUrl = searchParams.get("fileUrl") || "";

  // ✅ LOGIKA CEK GRATIS: Kalau string-nya "null", "gratis", atau "0"
  const isFree =
    rawHarga.toLowerCase() === "gratis" ||
    rawHarga === "null" ||
    rawHarga === "0";

  // ✅ Format harga yang rapi (biar nggak muncul "null" atau angka doang tanpa Rp)
  const displayHarga = isFree
    ? "GRATIS"
    : rawHarga.toLowerCase().includes("rp") ||
        rawHarga.toLowerCase().includes("k")
      ? rawHarga
      : `Rp ${parseInt(rawHarga).toLocaleString("id-ID")}`;

  // ✅ FUNGSI UNDUH GRATIS (Langsung masuk database dengan status approved)
  const handleUnduhGratis = async () => {
    if (!isLoggedIn) {
      alert("Ups! Kamu harus login dulu untuk mengklaim aset gratis ini.");
      window.location.href = "/login";
      return;
    }

    setIsProcessing(true);
    try {
      const supabase = createSupabaseBrowser();
      const customerId = localStorage.getItem("userId");

      // Insert ke tabel orders dengan metode 'gratis' dan langsung 'approved'
      const { error } = await supabase.from("orders").insert([
        {
          customer_id: customerId,
          product_id: parseInt(id),
          metode_pembayaran: "gratis",
          status: "approved",
          is_approved: true,
        },
      ]);

      if (error) throw error;

      alert(
        "Hore! Aset gratis berhasil ditambahkan. Kamu akan diarahkan ke Pesanan Saya untuk mengunduh file-nya.",
      );
      window.location.href = "/pesanan";
    } catch (error) {
      console.error("Gagal klaim aset gratis:", error);
      alert("Terjadi kesalahan. Silakan coba lagi nanti.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main
      style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white" }}
    >
      <div
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
      >
        <nav id="navbar" className="navbar">
          <div
            className="logo-wrapper"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img
              src="/img/logo.png"
              alt="Logo N"
              style={{ height: "40px", width: "auto", objectFit: "contain" }}
            />
            <div
              className="logo"
              style={{ fontSize: "1.5rem", fontWeight: "bold" }}
            >
              Nusantara<span style={{ color: "#ffd700" }}>Assets</span>
            </div>
          </div>

          <div className="nav-menu desktop-menu">
            <ul>
              <li style={{ listStyle: "none" }}>
                <a
                  href="/katalog"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Kembali ke Katalog
                </a>
              </li>
            </ul>
          </div>

          <div
            className="hamburger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className={`bar ${isMobileMenuOpen ? "open" : ""}`}></span>
            <span className={`bar ${isMobileMenuOpen ? "open" : ""}`}></span>
            <span className={`bar ${isMobileMenuOpen ? "open" : ""}`}></span>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <ul>
              <li style={{ listStyle: "none" }}>
                <a
                  href="/katalog"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Kembali ke Katalog
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div
        className="detail-wrapper"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "120px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            aspectRatio: "16/9",
            background: "#1e293b",
            borderRadius: "25px",
            border: isFree ? "2px solid #4ade80" : "2px solid #ffd700", // Border Hijau kalau gratis
            margin: "0 auto 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={previewImg}
            alt="Preview Aset"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "23px",
            }}
          />
        </div>

        <h1
          style={{
            fontSize: "2.5rem",
            color: "#fff",
            marginBottom: "10px",
          }}
        >
          {nama}
        </h1>

        {/* ✅ HARGA TAMPIL DISINI */}
        <p
          style={{
            fontSize: "1.8rem",
            fontWeight: "900",
            marginBottom: "20px",
            color: isFree ? "#4ade80" : "#ffd700", // Hijau terang kalau gratis
            letterSpacing: "1px",
          }}
        >
          {displayHarga}
        </p>

        <p
          style={{
            color: "#94a3b8",
            lineHeight: "1.6",
            marginBottom: "40px",
            maxWidth: "700px",
            margin: "0 auto 40px",
          }}
        >
          {desc}
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {isTrial && (
            <button
              className="btn-trial"
              style={{
                padding: "15px 40px",
                background: "#10b981",
                color: "white",
                borderRadius: "15px",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                if (!isLoggedIn) {
                  alert(
                    "Ups! Kamu harus login dulu untuk klaim free trial 2D pixel art ini.",
                  );
                  window.location.href = "/login";
                  return;
                }
                if (fileUrl) {
                  alert("Yay! File 2D pixel art sedang diunduh! 🎁");
                  window.open(fileUrl, "_blank");
                } else {
                  alert("Maaf, file trial untuk aset ini belum tersedia.");
                }
              }}
            >
              🎁 Try for Free
            </button>
          )}

          {/* ✅ JIKA GRATIS, TAMPILKAN TOMBOL UNDUH GRATIS SAJA */}
          {isFree ? (
            <button
              className="btn-free"
              disabled={isProcessing}
              style={{
                padding: "15px 40px",
                background: "#4ade80",
                color: "#0f172a",
                borderRadius: "15px",
                fontWeight: "900",
                border: "none",
                cursor: isProcessing ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)",
                opacity: isProcessing ? 0.7 : 1,
              }}
              onClick={handleUnduhGratis}
            >
              {isProcessing ? "Memproses..." : "⬇ Unduh Gratis"}
            </button>
          ) : (
            // ✅ JIKA BERBAYAR, TAMPILKAN KERANJANG DAN BELI SEKARANG
            <>
              <button
                className="btn-cart"
                style={{
                  padding: "15px 40px",
                  background: "transparent",
                  border: "2px solid #ffd700",
                  color: "#ffd700",
                  borderRadius: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => {
                  const keranjang = JSON.parse(
                    localStorage.getItem("nusantaraCart") || "[]",
                  );

                  keranjang.push({
                    id,
                    nama,
                    harga: rawHarga,
                    image_preview: previewImg,
                  });

                  localStorage.setItem(
                    "nusantaraCart",
                    JSON.stringify(keranjang),
                  );
                  window.dispatchEvent(new Event("storage"));
                  alert("Berhasil masuk keranjang! 🛒");
                  window.location.href = "/keranjang";
                }}
              >
                🛒 + Keranjang
              </button>

              <button
                className="btn-buy"
                style={{
                  padding: "15px 40px",
                  background: "#ffd700",
                  color: "#0f172a",
                  borderRadius: "15px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => {
                  if (!isLoggedIn) {
                    alert("Ups! Kamu harus login dulu sebelum membeli.");
                    window.location.href = "/login";
                    return;
                  }
                  window.location.href = `/pembayaran?id=${encodeURIComponent(id)}&nama=${encodeURIComponent(nama)}&harga=${encodeURIComponent(rawHarga)}`;
                }}
              >
                Beli Sekarang
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 5%;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 215, 0, 0.15);
        }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          z-index: 50;
        }
        .hamburger .bar {
          width: 25px;
          height: 3px;
          background-color: white;
          transition: all 0.3s ease;
          border-radius: 5px;
        }
        .hamburger .bar.open:nth-child(1) {
          transform: translateY(8px) rotate(45deg);
        }
        .hamburger .bar.open:nth-child(2) {
          opacity: 0;
        }
        .hamburger .bar.open:nth-child(3) {
          transform: translateY(-8px) rotate(-45deg);
        }
        .mobile-menu {
          background: #1e293b;
          padding: 15px 5%;
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .btn-trial:hover {
          box-shadow:
            0 0 15px #10b981,
            0 0 30px #10b981 !important;
          transform: translateY(-3px);
        }
        .btn-free:hover {
          background: #22c55e !important;
          box-shadow:
            0 0 15px #4ade80,
            0 0 30px #4ade80 !important;
          transform: translateY(-3px);
        }
        .btn-cart:hover {
          background: #ffd700 !important;
          color: #0f172a !important;
          box-shadow:
            0 0 15px #ffd700,
            0 0 30px #ffd700 !important;
          transform: translateY(-3px);
        }
        .btn-buy:hover {
          box-shadow:
            0 0 15px #ffd700,
            0 0 30px #ffd700 !important;
          transform: translateY(-3px);
        }
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }
          .hamburger {
            display: flex;
          }
        }
      `}</style>
    </main>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailContent />
    </Suspense>
  );
}
