"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

export default function MitraPage() {
  // State untuk mengontrol tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState<"project" | "institusi">(
    "project",
  );

  const waNumber = "6281215024409";

  const handleWA = (message: string) => {
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <main
      style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "white" }}
    >
      <Navbar />

      {/* HEADER SECTION */}
      <div style={{ textAlign: "center", padding: "120px 20px 40px" }}>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
            color: "#ffd700",
            fontWeight: "900",
            marginBottom: "15px",
            textShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
          }}
        >
          Kemitraan
        </h1>
        <p
          style={{
            color: "#94a3b8",
            maxWidth: "650px",
            margin: "0 auto",
            fontSize: "1.1rem",
            lineHeight: "1.7",
          }}
        >
          Wujudkan visi game tingkat tinggi dengan aset Nusantara yang dirancang
          eksklusif untukmu, atau bekali institusimu dengan akses aset tanpa
          batas. Pilih jalur kemitraan yang paling tepat untuk kebutuhanmu.
        </p>
      </div>

      {/* SAKLAR / TAB TOGGLE */}
      <div className="toggle-container">
        <div className="toggle-bg">
          <button
            className={`toggle-btn ${activeTab === "project" ? "active" : ""}`}
            onClick={() => setActiveTab("project")}
          >
            Kemitraan Project
          </button>
          <button
            className={`toggle-btn ${activeTab === "institusi" ? "active" : ""}`}
            onClick={() => setActiveTab("institusi")}
          >
            Institusi Pendidikan
          </button>
        </div>
      </div>

      {/* KONTEN PAKET KEMITRAAN */}
      <div
        style={{ padding: "0 5% 100px", maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* === TAB 1: KEMITRAAN PROJECT === */}
        {activeTab === "project" && (
          <div className="tab-content fade-in">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem" }}>
                Kustomisasi aset game khusus untuk kebutuhan project kamu.{" "}
                <br />
                <span style={{ color: "#38bdf8", fontWeight: "bold" }}>
                  Aset tidak dipublikasikan ke web (Eksklusif).
                </span>
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "40px",
                justifyContent: "center",
              }}
            >
              {/* PAKET SILVER */}
              <div className="card-paket silver-card">
                <div className="card-header silver-header">
                  <h3>Paket Silver</h3>
                  <div className="harga">Rp 1.200.000</div>
                </div>
                <div className="card-body">
                  <ul className="benefit-list">
                    <li>Custom 2 Karakter (Hero / Enemy)</li>
                    <li>5 Small Props</li>
                    <li>1 Aset Bangunan</li>
                    <li>Free Special Assets</li>
                  </ul>
                  <div className="exclusive-note">
                    <span className="icon-lock">🔒</span> Aset custom bersifat{" "}
                    <b>EKSKLUSIF</b> untuk project kamu dan tidak akan
                    dipublikasikan ke web NusantaraAssets.
                  </div>
                  <button
                    className="btn-wa"
                    onClick={() =>
                      handleWA(
                        "Halo Admin NusantaraAssets, saya tertarik berdiskusi mengenai Kemitraan Project - Paket Silver.",
                      )
                    }
                  >
                    <WaIcon /> Diskusikan via WhatsApp
                  </button>
                </div>
              </div>

              {/* PAKET GOLD */}
              <div className="card-paket gold-card">
                <div className="card-header gold-header">
                  <h3 style={{ color: "#0f172a" }}>Paket Gold</h3>
                  <div className="harga" style={{ color: "#0f172a" }}>
                    Rp 1.500.000
                  </div>
                </div>
                <div className="card-body">
                  <ul className="benefit-list">
                    <li>Custom 4 Karakter (Hero / Enemy)</li>
                    <li>8 Small Props</li>
                    <li>2 Aset Bangunan</li>
                    <li>1 Tileset</li>
                    <li>Free Special Assets</li>
                  </ul>
                  <div className="exclusive-note">
                    <span className="icon-lock">🔒</span> Aset custom bersifat{" "}
                    <b>EKSKLUSIF</b> untuk project kamu dan tidak akan
                    dipublikasikan ke web NusantaraAssets.
                  </div>
                  <button
                    className="btn-wa"
                    onClick={() =>
                      handleWA(
                        "Halo Admin NusantaraAssets, saya tertarik berdiskusi mengenai Kemitraan Project - Paket Gold.",
                      )
                    }
                  >
                    <WaIcon /> Diskusikan via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 2: INSTITUSI PENDIDIKAN === */}
        {activeTab === "institusi" && (
          <div className="tab-content fade-in">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem" }}>
                Solusi cerdas untuk sekolah, kampus, atau lembaga pelatihan yang
                membutuhkan akses aset massal.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              {/* PAKET BRONZE */}
              <div
                className="card-paket bronze-card"
                style={{ maxWidth: "550px", width: "100%" }}
              >
                <div className="card-header bronze-header">
                  <h3 style={{ color: "#fff" }}>Paket Bronze</h3>
                  <div className="harga" style={{ color: "#fff" }}>
                    Rp 1.000.000
                  </div>
                </div>
                <div className="card-body">
                  <ul className="benefit-list">
                    <li>
                      Akses Download <b>GRATIS SEMUA ASET</b> di Web
                    </li>
                    <li>
                      Berlaku untuk <b>10 Akun</b> (Email siswa/guru)
                    </li>
                    <li>
                      Durasi masa aktif selama <b>30 Hari</b>
                    </li>
                    <li>Mendukung kegiatan belajar mengajar & kompetisi</li>
                  </ul>
                  <div className="exclusive-note bronze-note">
                    <span className="icon-lock">🎓</span> Akun akan diaktifkan
                    secara khusus oleh tim Admin setelah proses pendaftaran
                    selesai.
                  </div>
                  <button
                    className="btn-wa"
                    onClick={() =>
                      handleWA(
                        "Halo Admin NusantaraAssets, saya mewakili instansi pendidikan dan tertarik dengan Kemitraan - Paket Bronze.",
                      )
                    }
                  >
                    <WaIcon /> Diskusikan via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER SESUAI DENGAN REFERENSI HALAMAN HOME */}
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

      {/* STYLING CSS GLOBAL UNTUK HALAMAN INI */}
      <style jsx>{`
        /* --- SAKLAR / TOGGLE STYLES --- */
        .toggle-container {
          display: flex;
          justify-content: center;
          margin-bottom: 50px;
        }
        .toggle-bg {
          background: #1e293b;
          padding: 8px;
          border-radius: 50px;
          display: flex;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        .toggle-btn {
          background: transparent;
          color: #94a3b8;
          border: none;
          padding: 12px 30px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toggle-btn.active {
          background: linear-gradient(135deg, #ffd700, #f59e0b);
          color: #0f172a;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        }
        .toggle-btn:not(.active):hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        /* --- ANIMASI FADE IN --- */
        .fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* --- CARD STYLES --- */
        .card-paket {
          background: #1e293b;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition:
            transform 0.4s ease,
            box-shadow 0.4s ease;
          position: relative;
        }

        /* Silver */
        .silver-card {
          border: 1.5px solid #94a3b8;
        }
        .silver-header {
          background: linear-gradient(135deg, #94a3b8, #f8fafc);
        }
        .silver-card:hover {
          box-shadow: 0 0 30px rgba(148, 163, 184, 0.25);
          transform: translateY(-8px);
        }

        /* Gold */
        .gold-card {
          border: 1.5px solid #ffd700;
        }
        .gold-header {
          background: linear-gradient(135deg, #f59e0b, #ffe44d);
        }
        .gold-card:hover {
          box-shadow: 0 0 40px rgba(255, 215, 0, 0.35);
          transform: translateY(-8px);
        }

        /* Bronze */
        .bronze-card {
          border: 1.5px solid #d97706;
        }
        .bronze-header {
          background: linear-gradient(135deg, #92400e, #f59e0b);
        }
        .bronze-card:hover {
          box-shadow: 0 0 30px rgba(217, 119, 6, 0.3);
          transform: translateY(-8px);
        }

        .card-header {
          padding: 35px 20px;
          text-align: center;
        }
        .card-header h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .harga {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -1px;
        }

        .card-body {
          padding: 35px;
          display: flex;
          flex-direction: column;
          flex: 1;
          background: linear-gradient(to bottom, #1e293b, #0f172a);
        }

        .benefit-list {
          list-style: none;
          padding: 0;
          margin: 0 0 30px 0;
          color: #e2e8f0;
          flex: 1;
        }
        .benefit-list li {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          line-height: 1.5;
          font-size: 1.05rem;
        }
        .benefit-list li::before {
          content: "✓";
          color: #4ade80;
          font-weight: 900;
          font-size: 1.2rem;
        }

        /* Note Eksklusif */
        .exclusive-note {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 15px;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .bronze-note {
          background: rgba(74, 222, 128, 0.08);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: #4ade80;
        }
        .icon-lock {
          margin-right: 6px;
        }

        /* Tombol WA */
        .btn-wa {
          width: 100%;
          background: #25d366;
          color: white;
          border: none;
          padding: 18px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
        }
        .btn-wa:hover {
          background: #1ebd5a;
          box-shadow: 0 8px 25px rgba(37, 211, 102, 0.5);
          transform: translateY(-3px);
        }

        /* --- FOOTER STYLES (Sesuai Referensi) --- */
        footer {
          padding: 60px 20px;
          text-align: center;
          background: #020617;
          color: #94a3b8;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
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

        @media (max-width: 768px) {
          .toggle-bg {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
          }
          .toggle-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

// Komponen SVG untuk Logo WhatsApp
function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
