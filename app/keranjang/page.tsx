"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Helper: Format Rupiah Otomatis untuk UI ---
function formatRupiahUI(harga: number | string): string {
  const str = String(harga || "0");
  const angkaSaja = parseInt(str.replace(/[^0-9]/g, "")) || 0;
  const hargaFinal = str.toLowerCase().includes("k")
    ? angkaSaja * 1000
    : angkaSaja;
  return "Rp " + hargaFinal.toLocaleString("id-ID");
}

export default function KeranjangPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(
        localStorage.getItem("nusantaraCart") || "[]",
      );

      console.log("Cek Data Keranjang:", savedCart);

      setItems(savedCart);
      setSelectedItems(savedCart.map((_: any, index: number) => index));
    };

    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  const toggleSelect = (index: number) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter((i) => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length && items.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((_, index) => index));
    }
  };

  const hapusBarang = (index: number) => {
    const newCart = [...items];
    newCart.splice(index, 1);
    setItems(newCart);
    setSelectedItems([]);
    localStorage.setItem("nusantaraCart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const totalHarga = items.reduce((acc, item: any, index) => {
    if (!selectedItems.includes(index)) return acc;
    const hargaStr = String(item.harga || "0");
    const angkaSaja = parseInt(hargaStr.replace(/[^0-9]/g, "")) || 0;
    const hargaFinal = hargaStr.toLowerCase().includes("k")
      ? angkaSaja * 1000
      : angkaSaja;
    return acc + hargaFinal;
  }, 0);

  const handleCheckout = () => {
    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true" ||
      localStorage.getItem("user");
    if (!isLoggedIn) {
      alert("Ups! Kamu harus login dulu sebelum melakukan pembayaran.");
      router.push("/login");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Pilih minimal satu produk untuk di-checkout!");
      return;
    }
    const barangDipilih = items.filter((_, index) =>
      selectedItems.includes(index),
    );
    localStorage.setItem("checkoutType", "cart");
    localStorage.setItem("checkoutTotal", totalHarga.toString());
    localStorage.setItem("selectedProducts", JSON.stringify(barangDipilih));
    router.push("/pembayaran");
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
            <div className="emoji-cry" style={{ fontSize: "60px" }}>
              😭
            </div>
            <h3>Wah, keranjangmu masih kosong nih...</h3>
            <button
              onClick={() => router.push("/katalog")}
              className="btn-browse"
            >
              Lihat Katalog Aset
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* ── KOLOM KIRI: DAFTAR PRODUK ── */}
            <div className="cart-items-column">
              <div className="select-all-area">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === items.length && items.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="custom-checkbox"
                  />
                  Pilih Semua ({items.length} Aset)
                </label>
              </div>

              <div className="items-list">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`cart-card ${
                      selectedItems.includes(index) ? "selected-border" : ""
                    }`}
                  >
                    <div className="item-info">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(index)}
                        onChange={() => toggleSelect(index)}
                        className="custom-checkbox item-checkbox"
                      />

                      <img
                        src={
                          item.image_preview ||
                          item.img ||
                          item.gambar_url ||
                          "/img/logo-preview.jpg"
                        }
                        alt={item.nama}
                        className="item-img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/img/logo-preview.jpg";
                        }}
                      />
                      <div className="item-text">
                        <h3 className="item-name">{item.nama}</h3>
                        <p className="item-sub">Aset Digital Premium 2D</p>
                      </div>
                    </div>

                    <div className="item-action-price">
                      <button
                        onClick={() => hapusBarang(index)}
                        className="btn-delete"
                      >
                        ✕ Hapus
                      </button>
                      <p className="item-price">{formatRupiahUI(item.harga)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── KOLOM KANAN: RINGKASAN BELANJA ── */}
            <div className="cart-summary-column">
              <div className="checkout-box">
                <h2 className="summary-title">Ringkasan Belanja</h2>

                <div className="summary-row">
                  <span>Aset Terpilih</span>
                  <span>{selectedItems.length} Aset</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total Harga</span>
                  <span className="total-price">
                    Rp {totalHarga.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-checkout"
                  disabled={selectedItems.length === 0}
                >
                  BAYAR SEKARANG ({selectedItems.length}) ➔
                </button>

                {/* INI YANG KITA UBAH JADI BUTTON BIAR NURUT */}
                <button
                  onClick={() => router.push("/katalog")}
                  className="btn-back"
                >
                  ← Tambah Aset Lainnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .cart-page {
          background-color: #0f172a;
          min-height: 100vh;
          color: white;
        }
        .cart-container {
          padding: 120px 5% 60px;
          max-width: 1100px;
          margin: 0 auto;
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

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
          align-items: start;
        }
        @media (min-width: 992px) {
          .cart-layout {
            grid-template-columns: 6.5fr 3.5fr;
            gap: 40px;
          }
        }

        .select-all-area {
          margin-bottom: 16px;
          padding-left: 5px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
        }
        .custom-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #ffd700;
          cursor: pointer;
        }

        .cart-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          transition: all 0.3s ease;
        }
        .cart-card:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .selected-border {
          border: 1px solid #ffd700 !important;
          background: rgba(255, 215, 0, 0.05);
        }

        .item-info {
          display: flex;
          gap: 18px;
          align-items: center;
        }
        .item-img {
          width: 75px;
          height: 75px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(255, 215, 0, 0.4);
        }
        .item-name {
          color: #ffd700;
          font-size: 18px;
          margin: 0 0 4px;
          font-weight: 700;
        }
        .item-sub {
          color: #64748b;
          font-size: 13px;
          margin: 0;
        }

        .item-action-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }
        .btn-delete {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid rgba(255, 68, 68, 0.3);
          color: #ff4444;
          cursor: pointer;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: bold;
          transition: 0.2s;
        }
        .btn-delete:hover {
          background: #ff4444;
          color: white;
        }
        .item-price {
          font-size: 18px;
          font-weight: 800;
          color: white;
          margin: 0;
        }

        @media (max-width: 640px) {
          .cart-card {
            flex-direction: column;
            align-items: stretch;
          }
          .item-action-price {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px dashed rgba(255, 255, 255, 0.1);
          }
        }

        .cart-summary-column {
          position: sticky;
          top: 100px;
        }
        .checkout-box {
          background: rgba(255, 215, 0, 0.04);
          padding: 30px;
          border-radius: 24px;
          border: 1px dashed rgba(255, 215, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .summary-title {
          color: #ffd700;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 14px;
        }
        .summary-divider {
          height: 1px;
          background: rgba(255, 215, 0, 0.2);
        }
        .total-row {
          color: white;
          font-size: 16px;
          font-weight: bold;
          align-items: center;
        }
        .total-price {
          color: #ffd700;
          font-size: 24px;
          font-weight: 800;
        }

        /* TOMBOL BAYAR SEKARANG */
        .btn-checkout {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          background: linear-gradient(135deg, #ffd700, #f59e0b);
          color: #000;
          border: none;
          padding: 16px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition:
            transform 0.2s,
            opacity 0.2s;
        }
        .btn-checkout:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.95;
        }
        .btn-checkout:disabled {
          background: #475569;
          color: #94a3b8;
          cursor: not-allowed;
        }

        /* TOMBOL TAMBAH ASET (UDAH JADI BUTTON BIAR TEMBUS CSS-NYA) */
        .btn-back {
          display: block;
          width: 100%;
          text-align: center;
          padding: 16px;
          border-radius: 50px;
          border: 1.5px solid rgba(255, 215, 0, 0.5);
          color: #ffd700;
          background: transparent;
          font-size: 15px;
          font-weight: 800;
          transition: all 0.2s;
          margin-top: -5px;
          cursor: pointer;
        }
        .btn-back:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: #ffd700;
          color: white;
        }

        .empty-cart {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          border: 1px dashed rgba(255, 255, 255, 0.15);
          max-width: 600px;
          margin: 0 auto;
        }
        .empty-cart h3 {
          margin: 20px 0 30px;
          color: #94a3b8;
          font-weight: normal;
        }
        .btn-browse {
          background: #ffd700;
          color: #000;
          padding: 12px 30px;
          border-radius: 50px;
          border: none;
          font-size: 15px;
          cursor: pointer;
          font-weight: 800;
          transition: opacity 0.2s;
        }
        .btn-browse:hover {
          opacity: 0.9;
        }
      `}</style>
    </main>
  );
}
