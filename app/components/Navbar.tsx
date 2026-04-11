"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await setDoc(
            doc(db, "user_logs", currentUser.uid),
            {
              email: currentUser.email,
              nama: currentUser.displayName || "User Nusantara",
              last_login: serverTimestamp(),
              status: "Online",
            },
            { merge: true },
          );
        } catch (err) {
          console.error("Gagal catat absen login:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user) {
      try {
        await setDoc(
          doc(db, "user_logs", user.uid),
          { last_logout: serverTimestamp(), status: "Offline" },
          { merge: true },
        );
      } catch (err) {
        console.error("Gagal catat absen logout:", err);
      }
    }
    await signOut(auth);
    alert("Berhasil keluar!");
    window.location.href = "/";
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 5%",
        background: "#0d111a",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        position: "fixed", // Agar navbar tetap di atas saat scroll
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {/* KIRI: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/img/logo.png" alt="Logo" width="40" />
        <span style={{ fontSize: "20px", fontWeight: "bold", color: "white" }}>
          Nusantara<span style={{ color: "#ffd700" }}>Assets</span>
        </span>
      </div>

      {/* WRAPPER MENU & ACTIONS */}
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        {/* Nav Links (Desktop) */}
        <div
          className={`nav-links ${isOpen ? "open" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: "30px" }}
        >
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            style={{ color: "#94a3b8", textDecoration: "none" }}
          >
            Beranda
          </Link>
          <Link
            href="/katalog"
            onClick={() => setIsOpen(false)}
            style={{ color: "#94a3b8", textDecoration: "none" }}
          >
            Katalog Aset
          </Link>

          {/* Link ke Anchor Section Kotak Saran */}
          <Link
            href="/#kotak-saran"
            onClick={() => setIsOpen(false)}
            style={{ color: "#94a3b8", textDecoration: "none" }}
          >
            Saran
          </Link>

          {/* Auth Section (Halo User / Tombol Masuk) */}
          <div className="auth-section">
            {user ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <span style={{ color: "#94a3b8", fontSize: "14px" }}>
                  Halo, {user.displayName || user.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                style={{
                  border: "1px solid #ffd700",
                  color: "#ffd700",
                  padding: "8px 25px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Masuk
              </Link>
            )}
          </div>
        </div>

        {/* ICON KERANJANG & HAMBURGER (Tetap terlihat di HP) */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            href="/keranjang"
            style={{ color: "#ffd700", display: "flex", alignItems: "center" }}
          >
            <ShoppingCart size={24} />
          </Link>

          <div
            className="hamburger"
            style={{ display: "none", cursor: "pointer", color: "white" }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hamburger {
            display: block !important;
          }
          .nav-links {
            display: none !important;
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            width: 100%;
            background: #0d111a;
            padding: 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            gap: 25px !important;
            text-align: center;
          }
          .nav-links.open {
            display: flex !important;
          }
          .auth-section {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
            width: 100%;
          }
          .auth-section > div {
            flex-direction: column;
            gap: 15px !important;
          }
        }
      `}</style>
    </nav>
  );
}
