"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";
import { createSupabaseBrowser } from "@/app/lib/supabase/client";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    pesan: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // LOGIKA: Ambil Aset Populer berdasarkan data di tabel 'orders' Supabase
  useEffect(() => {
    const fetchPopularAssets = async () => {
      try {
        setIsLoading(true);
        const supabase = createSupabaseBrowser();

        // 1. Ambil data dari tabel orders
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("*");

        if (orderError) throw orderError;

        if (orders && orders.length > 0) {
          const counts: { [key: string]: number } = {};

          orders.forEach((o) => {
            // Mengambil key dari product_id (ID) atau produk (Nama Teks)
            const key = o.product_id || o.produk || o.nama_produk;
            if (key) counts[key] = (counts[key] || 0) + 1;
          });

          const sortedKeys = Object.keys(counts)
            .sort((a, b) => counts[b] - counts[a])
            .slice(0, 3);

          // Cek apakah data yang didapat berupa angka atau teks nama
          const firstKey = sortedKeys[0];
          const isNumeric = firstKey && !isNaN(Number(firstKey));

          let query = supabase.from("product").select("*");

          if (isNumeric) {
            // Konversi ke Number agar cocok dengan tipe data ID di Supabase
            query = query.in(
              "id",
              sortedKeys.map((k) => Number(k)),
            );
          } else {
            // Cari berdasarkan nama jika data di orders berupa string nama produk
            query = query.in("nama", sortedKeys);
          }

          const { data: products, error: productError } = await query;

          if (productError) throw productError;

          // Urutkan kembali sesuai ranking popularitas
          const finalData = sortedKeys
            .map((key) =>
              products?.find(
                (p) => String(p.id) === String(key) || p.nama === key,
              ),
            )
            .filter(Boolean);

          setTopProducts(finalData);
        }
      } catch (err) {
        console.error("Gagal memuat produk populer:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularAssets();
  }, []);

  // ✅ LOGIKA BARU: Kirim Saran Pakai Supabase
  const kirimSaran = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createSupabaseBrowser();

      // Insert data ke tabel 'saran' di Supabase
      const { error } = await supabase.from("saran").insert([
        {
          nama: formData.nama,
          email: formData.email,
          pesan: formData.pesan,
        },
      ]);

      if (error) throw error; // Lempar error kalau gagal

      Swal.fire({
        title: "Terkirim!",
        text: "Saran kamu sudah masuk, terimakasih!",
        icon: "success",
        confirmButtonColor: "#ffd700",
        background: "#1e293b",
        color: "#fff",
      });

      // Kosongkan form setelah sukses
      setFormData({ nama: "", email: "", pesan: "" });
    } catch (error) {
      console.error("Error kirim saran: ", error);
      Swal.fire("Gagal!", "Ada masalah pas kirim data, coba lagi ya.", "error");
    }
  };

  return (
    <main>
      <Navbar />

      <header className="hero">
        <h1>Bawa Budaya Lokal ke Game Global</h1>
        <p>
          E-commerce aset game 2D bertema Nusantara yang teroptimasi untuk
          performa game multi-platform.
        </p>
        <div className="hero-buttons">
          <a href="/katalog" className="btn-jelajahi">
            Jelajahi Aset
          </a>
        </div>
      </header>

      <h2 className="katalog-judul">Aset Terpopuler</h2>
      <section className="featured-products">
        <div className="grid-aset">
          {isLoading ? (
            <p
              style={{
                textAlign: "center",
                width: "100%",
                color: "#94a3b8",
                gridColumn: "1 / -1",
              }}
            >
              ⏳ Menganalisis tren pasar Nusantara...
            </p>
          ) : topProducts.length > 0 ? (
            topProducts.map((produk) => {
              // ✅ LOGIKA CEK GRATIS: Jika is_free_trial true ATAU harga null/0
              const isFree = produk.is_free_trial || !produk.harga;

              return (
                <div className="card-aset" key={produk.id}>
                  <div className="preview-container">
                    <span className="badge">
                      {produk.kategori || "ASET 2D"}
                    </span>
                    <img
                      src={
                        produk.gambar_url ||
                        produk.image_preview ||
                        "/img/logo-preview.jpg"
                      }
                      className="img-produk"
                      alt={produk.nama}
                    />
                  </div>
                  <div className="card-content">
                    <h3>{produk.nama}</h3>
                    <p>{produk.deskripsi}</p>
                  </div>
                  <div className="harga-kontainer">
                    {/* ✅ MENAMPILKAN HARGA YANG BENAR */}
                    <div
                      className="harga"
                      style={{
                        color: isFree ? "#4ade80" : "#ffd700",
                        fontWeight: "800",
                      }}
                    >
                      {isFree
                        ? "GRATIS"
                        : `Rp ${typeof produk.harga === "number" ? produk.harga.toLocaleString("id-ID") : produk.harga || "70.000"}`}
                    </div>
                    <button
                      className="btn-detail"
                      onClick={() => {
                        const finalImg =
                          produk.gambar_url ||
                          produk.image_preview ||
                          "/img/logo-preview.jpg";

                        // ✅ KIRIM HARGA YANG BENAR KE HALAMAN DETAIL (Bukan 'null' lagi)
                        const hargaFinal = isFree
                          ? "Gratis"
                          : produk.harga || "70k";

                        const url = `/detail-produk?id=${produk.id}&nama=${encodeURIComponent(
                          produk.nama,
                        )}&harga=${encodeURIComponent(
                          hargaFinal,
                        )}&desc=${encodeURIComponent(
                          produk.deskripsi || "",
                        )}&img=${encodeURIComponent(finalImg)}`;

                        window.location.href = url;
                      }}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p
              style={{
                textAlign: "center",
                width: "100%",
                color: "#94a3b8",
                gridColumn: "1 / -1",
              }}
            >
              Belum ada data penjualan tersedia saat ini.
            </p>
          )}
        </div>
      </section>

      <section id="kotak-saran" className="saran-section">
        <div className="saran-container">
          <h2>Punya Ide Aset Baru?</h2>
          <p>Kasih tahu kami apa yang kamu butuhkan!</p>
          <form className="saran-form" onSubmit={kirimSaran}>
            <input
              type="text"
              placeholder="Nama kamu"
              required
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email kamu"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <textarea
              placeholder="Contoh: Buatkan aset Candi Prambanan..."
              rows={5}
              required
              value={formData.pesan}
              onChange={(e) =>
                setFormData({ ...formData, pesan: e.target.value })
              }
              style={{ resize: "none" }}
            ></textarea>
            <button type="submit" className="btn-utama">
              Kirimin Saran
            </button>
          </form>
        </div>
      </section>

      <footer>
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
        <p>&copy; NusantaraAssets - Oleh FantasticFive</p>
        <p style={{ fontSize: "12px", margin: "10px 0" }}>
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
        footer {
          padding: 60px 20px;
          text-align: center;
          background: #020617;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </main>
  );
}
