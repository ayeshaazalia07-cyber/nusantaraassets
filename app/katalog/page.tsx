"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { createSupabaseBrowser } from "@/app/lib/supabase/client";

export default function Katalog() {
  const [user, setUser] = useState<{ name: string; pic: string } | null>(null);
  const [kategori, setKategori] = useState("semua");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ STATE BARU: Untuk mendeteksi tombol mana yang sedang di-hover
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const daftarAsetManual = [
    {
      id: 1,
      nama: "Mega Mendung Sky Set",
      provinsi: "JAWA BARAT",
      kategori: "jawa-barat",
      deskripsi:
        "Background & tile awan Cirebon gradasi biru untuk level atmosferik.",
      harga: "70k",
    },
    {
      id: 8,
      nama: "Gapura Candi Bentar",
      provinsi: "BALI",
      kategori: "bali",
      deskripsi:
        "Struktur gerbang khas Bali untuk checkpoint atau pintu masuk area.",
      harga: "70k",
    },
    {
      id: 10,
      nama: "Pura Meru Bali",
      provinsi: "BALI",
      kategori: "bali",
      deskripsi:
        "Aset bangunan 2D bertema arsitektur tradisional Bali yang ikonik.",
      harga: "70k",
    },
  ];

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (loggedIn) {
      setUser({
        name: localStorage.getItem("userName") || "",
        pic: localStorage.getItem("userPic") || "",
      });
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const supabase = createSupabaseBrowser();
        const { data, error } = await supabase.from("product").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(daftarAsetManual);
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);
        setProducts(daftarAsetManual);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const asetFiltered =
    kategori === "semua"
      ? products
      : products.filter((item) => {
          const itemCat = (item.kategori || item.cat || "")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .trim();
          return itemCat === kategori.toLowerCase().trim();
        });

  return (
    <main
      style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white" }}
    >
      <Navbar />

      <div style={{ textAlign: "center", padding: "120px 20px 20px" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.5rem)",
            color: "#ffd700",
            fontWeight: "800",
          }}
        >
          Eksplorasi Aset Nusantara
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "10px" }}>
          Cari aset game bertema kebudayaan Indonesia dari{" "}
          {kategori === "semua"
            ? "seluruh wilayah"
            : kategori.replace("-", " ")}
        </p>
      </div>

      <div
        className="filter-provinsi"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        {/* ✅ FIX: Urutan diubah, Semua duluan baru Special Pack */}
        {[
          "semua",
          "special-pack",
          "jawa-tengah",
          "jawa-barat",
          "jawa-timur",
          "bali",
        ].map((cat) => {
          const isSpecialPack = cat === "special-pack";
          const isActive = kategori === cat;
          const isHovered = hoveredCat === cat;

          return (
            <button
              key={cat}
              onClick={() => setKategori(cat)}
              onMouseEnter={() => setHoveredCat(cat)}
              onMouseLeave={() => setHoveredCat(null)}
              className={`btn-filter ${isActive ? "active" : ""}`}
              style={{
                padding: "10px 25px",
                borderRadius: "50px",
                border: isActive
                  ? "none"
                  : isHovered // Efek border saat hover
                    ? "1px solid rgba(255, 215, 0, 0.6)"
                    : isSpecialPack
                      ? "1px solid #fbbf24"
                      : "1px solid rgba(255,255,255,0.1)",
                background: isActive
                  ? isSpecialPack
                    ? "linear-gradient(135deg, #fbbf24, #ea580c)"
                    : "#ffd700"
                  : "rgba(255,255,255,0.05)",
                color: isActive
                  ? "#0f172a"
                  : isHovered // Teks jadi emas saat hover
                    ? "#ffd700"
                    : "white",
                cursor: "pointer",
                fontWeight: "bold",
                textTransform: "capitalize",
                transition: "all 0.3s ease",
                boxShadow:
                  isActive && isSpecialPack
                    ? "0 4px 15px rgba(245, 158, 11, 0.5)"
                    : isActive
                      ? "0 4px 15px rgba(255, 215, 0, 0.3)"
                      : isHovered // ✅ Efek bayangan emas (glow) saat kursor mendekat
                        ? "0 0 15px rgba(255, 215, 0, 0.35)"
                        : isSpecialPack
                          ? "0 0 10px rgba(245, 158, 11, 0.15)"
                          : "none",
              }}
            >
              {cat.replace("-", " ")}
            </button>
          );
        })}
      </div>

      <section
        className="featured-products"
        style={{ padding: "0 5%", paddingBottom: "80px" }}
      >
        <div
          className="grid-aset"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {asetFiltered.map((item) => {
            const isFree = item.is_free_trial || !item.harga;

            const isSpecialItem =
              (item.kategori || "").toLowerCase().replace(/\s+/g, "-") ===
              "special-pack";

            return (
              <div
                key={item.id}
                className="card-aset"
                style={{
                  background: "#1e293b",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: isSpecialItem
                    ? "1.5px solid #f59e0b"
                    : "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  position: "relative",
                  boxShadow: isSpecialItem
                    ? "0 8px 25px rgba(245, 158, 11, 0.15)"
                    : "none",
                }}
              >
                <div
                  className="preview-container"
                  style={{ position: "relative", width: "100%" }}
                >
                  <span
                    className="badge"
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: isSpecialItem
                        ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                        : "#ffd700",
                      color: "#0f172a",
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontWeight: "900",
                      zIndex: "10",
                      boxShadow: isSpecialItem
                        ? "0 2px 10px rgba(245, 158, 11, 0.5)"
                        : "0 2px 8px rgba(0,0,0,0.4)",
                      width: "fit-content",
                      display: "inline-block",
                      textTransform: isSpecialItem ? "uppercase" : "none",
                      letterSpacing: isSpecialItem ? "0.5px" : "normal",
                    }}
                  >
                    {isSpecialItem
                      ? "⭐ SPECIAL PACK"
                      : item.provinsi || item.prov}
                  </span>
                  <img
                    src={
                      item.gambar_url ||
                      item.image_preview ||
                      "/img/logo-preview.jpg"
                    }
                    className="img-produk"
                    alt={item.nama}
                    style={{
                      width: "100%",
                      aspectRatio: "16/9",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>

                <div
                  className="card-content"
                  style={{
                    padding: "20px 20px 0",
                    flex: "1 0 auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      marginBottom: "10px",
                      color: "#fff",
                      fontWeight: "700",
                    }}
                  >
                    {item.nama}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#94a3b8",
                      lineHeight: "1.5",
                      marginBottom: "20px",
                    }}
                  >
                    {item.deskripsi || item.desc}
                  </p>
                </div>

                <div
                  className="harga-kontainer"
                  style={{
                    padding: "0 20px 40px",
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    className="harga"
                    style={{
                      fontWeight: "800",
                      fontSize: "1.3rem",
                      color: isFree
                        ? "#4ade80"
                        : isSpecialItem
                          ? "#f59e0b"
                          : "#ffd700",
                    }}
                  >
                    {isFree
                      ? "GRATIS"
                      : `Rp ${
                          typeof item.harga === "number"
                            ? item.harga.toLocaleString("id-ID")
                            : item.harga || "70.000"
                        }`}
                  </div>

                  <button
                    className="btn-detail"
                    style={{
                      padding: "10px 22px",
                      fontSize: "0.85rem",
                      background: "transparent",
                      border: isSpecialItem
                        ? "1.5px solid #f59e0b"
                        : "1.5px solid #ffd700",
                      color: isSpecialItem ? "#f59e0b" : "#ffd700",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (isSpecialItem) {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #fbbf24, #f59e0b)";
                        e.currentTarget.style.color = "#0f172a";
                        e.currentTarget.style.border =
                          "1.5px solid transparent";
                      } else {
                        e.currentTarget.style.background = "#ffd700";
                        e.currentTarget.style.color = "#000";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      if (isSpecialItem) {
                        e.currentTarget.style.color = "#f59e0b";
                        e.currentTarget.style.border = "1.5px solid #f59e0b";
                      } else {
                        e.currentTarget.style.color = "#ffd700";
                        e.currentTarget.style.border = "1.5px solid #ffd700";
                      }
                    }}
                    onClick={() => {
                      const imgUrl =
                        item.gambar_url ||
                        item.image_preview ||
                        "/img/logo-preview.jpg";

                      const hargaFinal = isFree
                        ? "Gratis"
                        : item.harga || "70k";

                      const url = `/detail-produk?id=${encodeURIComponent(
                        item.id,
                      )}&nama=${encodeURIComponent(
                        item.nama,
                      )}&harga=${encodeURIComponent(
                        hargaFinal,
                      )}&desc=${encodeURIComponent(
                        item.deskripsi || item.desc || "",
                      )}&img=${encodeURIComponent(imgUrl)}`;
                      window.location.href = url;
                    }}
                  >
                    Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "rgba(0,0,0,0.2)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ marginBottom: "35px" }}>
          <a
            href="https://instagram.com/nusantaraassets5"
            target="_blank"
            rel="noopener noreferrer"
            className="highlight-follow"
          >
            Follow us on Instagram
          </a>
        </div>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          &copy; NusantaraAssets - Oleh FantasticFive
        </p>
        <p style={{ fontSize: "11px", marginTop: "8px", color: "#475569" }}>
          Cultural Heritage in Every Pixel — © 2026. All Rights Reserved.
        </p>
      </footer>

      <style jsx>{`
        .highlight-follow {
          display: inline-block !important;
          background: #ffd700 !important;
          color: #020617 !important;
          padding: 10px 24px !important;
          border-radius: 12px !important;
          font-weight: 800 !important;
          text-decoration: none !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 2px solid #eab308 !important;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
        }
        .highlight-follow:hover {
          transform: translateY(-3px) !important;
          background: #ffe44d !important;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4) !important;
          border-color: #ffd700 !important;
        }
      `}</style>
    </main>
  );
}
