"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar"; //
import Link from "next/link";

export default function KeranjangPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("nusantaraCart") || "[]");
    setItems(savedCart);
  }, []);

  const hapusBarang = (index: number) => {
    const newCart = [...items];
    newCart.splice(index, 1);
    setItems(newCart);
    localStorage.setItem("nusantaraCart", JSON.stringify(newCart));
  };

  const totalHarga = items.reduce((acc, item: any) => {
    const angkaSaja = parseInt(item.harga.replace(/[^0-9]/g, "")) || 0;
    const hargaFinal = item.harga.toLowerCase().includes("k")
      ? angkaSaja * 1000
      : angkaSaja;
    return acc + hargaFinal;
  }, 0);

  const handleCheckout = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      window.location.href = "/pembayaran";
    } else {
      alert("Ups! Kamu harus login dulu sebelum melakukan pembayaran.");
      window.location.href = "/login";
    }
  };

  return (
    <main className="cart-page">
      <Navbar />

      <div className="cart-container">
        <h1 className="cart-title">
          Isi <span>Keranjang</span>
        </h1>

        {items.length === 0 ? (
          <div className="empty-cart">
            <h3>Wah, keranjangmu masih kosong nih...</h3>
            <Link href="/katalog" className="btn-browse">
              Lihat Katalog Aset
            </Link>
          </div>
        ) : (
          <>
            {items.map((item, index) => (
              <div key={index} className="cart-card">
                <div className="item-info">
                  <img
                    src="/img/logo-preview.jpg"
                    alt="Asset"
                    className="item-img"
                  />
                  <div className="item-text">
                    <h3 className="item-name">{item.nama}</h3>
                    <p className="item-sub">Aset Digital Premium</p>
                  </div>
                </div>
                <div className="item-price-section">
                  <p className="item-price">{item.harga}</p>
                  <button
                    onClick={() => hapusBarang(index)}
                    className="btn-delete"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}

            <div className="checkout-box">
              <Link href="/katalog" className="btn-back">
                ← Tambah Aset Lagi
              </Link>

              <div className="total-group">
                <div className="total-text">
                  <p>Total:</p>
                  <h2 className="total-price">
                    Rp {totalHarga.toLocaleString("id-ID")}
                  </h2>
                </div>
                <button onClick={handleCheckout} className="btn-checkout">
                  BAYAR SEKARANG ➔
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .cart-page {
          background-color: #0f172a;
          min-height: 100vh;
          color: white;
        }
        .cart-container {
          padding: 120px 5% 40px;
          max-width: 900px;
          margin: 0 auto;
        }

        /* STYLE LOGO BARU */
        .cart-header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .nav-logo-img {
          height: 40px;
          width: auto;
        }
        .logo-text {
          font-size: 22px;
          font-weight: 800;
          color: white;
        }
        .logo-text span {
          color: #ffd700;
        }

        .cart-title {
          color: #ffd700;
          margin-bottom: 30px;
          font-size: 28px;
          font-weight: 800;
        }
        .cart-title span {
          color: white;
        }

        .empty-cart {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .btn-browse {
          background: #ffd700;
          color: black;
          padding: 12px 35px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          display: inline-block;
          margin-top: 20px;
        }

        .cart-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .item-info {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .item-img {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid #ffd700;
        }
        .item-name {
          color: #ffd700;
          font-size: 18px;
          margin: 0;
          font-weight: 700;
        }
        .item-sub {
          color: #94a3b8;
          font-size: 12px;
        }
        .item-price-section {
          text-align: right;
        }
        .item-price {
          font-weight: 800;
          font-size: 1.2rem;
          margin: 0;
        }
        .btn-delete {
          background: none;
          border: none;
          color: #ff4444;
          cursor: pointer;
          font-size: 13px;
          text-decoration: underline;
        }

        .checkout-box {
          background: rgba(255, 215, 0, 0.05);
          padding: 30px;
          border-radius: 24px;
          border: 1px dashed #ffd700;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
        }
        /* GANTI BAGIAN .btn-back KAMU JADI INI: */
        .btn-back,
        .btn-back:link,
        .btn-back:visited {
          color: #ffd700 !important; /* Paksa kuning biarpun sudah pernah diklik */
          text-decoration: none !important;
          font-weight: bold;
          border: 1px solid #ffd700;
          padding: 10px 25px;
          border-radius: 50px;
          transition: 0.3s ease;
          display: inline-block;
        }

        .btn-back:hover {
          background: rgba(255, 215, 0, 0.1);
          transform: translateX(-5px);
          color: #ffd700 !important;
        }
        .total-group {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        .total-text p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }
        .total-price {
          color: white;
          font-size: 24px;
          margin: 0;
          font-weight: 800;
        }
        .btn-checkout {
          background: #ffd700;
          color: #000;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 10px 20px rgba(255, 215, 0, 0.2);
        }

        /* RESPONSIVE HP */
        @media (max-width: 768px) {
          .cart-container {
            padding: 100px 4% 30px !important;
          }
          .cart-header-logo {
            justify-content: center;
          }
          .cart-title {
            font-size: 20px !important;
            text-align: center;
          }
          .cart-card {
            flex-direction: column !important;
            text-align: center;
            padding: 15px !important;
          }
          .item-info {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .item-img {
            width: 60px !important;
            height: 60px !important;
          }
          .item-price-section {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 15px;
            width: 100%;
            text-align: center !important;
          }
          .checkout-box {
            flex-direction: column !important;
            gap: 20px !important;
            padding: 20px !important;
          }
          .total-group {
            flex-direction: column !important;
            width: 100%;
            gap: 15px !important;
          }
          .btn-checkout {
            width: 100% !important;
            padding: 12px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </main>
  );
}
