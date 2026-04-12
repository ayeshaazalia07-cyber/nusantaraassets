"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebase"; // Pastikan path ini benar
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup, // Pakai ini untuk login Google yang lebih simpel
} from "firebase/auth";
import { useRouter } from "next/navigation";
import "./../auth.css";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Provider untuk Google
  const googleProvider = new GoogleAuthProvider();

  // FUNGSI DAFTAR & LOGIN FIREBASE (Email/Password)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login Berhasil! Selamat datang kembali.");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Akun NusantaraAssets berhasil dibuat! Silakan masuk.");
        setIsLogin(true);
        return;
      }
      router.push("/");
    } catch (error: any) {
      alert("Waduh, ada masalah: " + error.message);
    }
  };

  // FUNGSI LOGIN GOOGLE (Murni Firebase SDK)
  const handleGoogleLogin = async () => {
    try {
      // Ini akan membuka popup Google tanpa perlu script eksternal di useEffect
      const result = await signInWithPopup(auth, googleProvider);

      // Info user untuk Navbar atau kebutuhan lainnya
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", result.user.displayName || "User");
      localStorage.setItem("userPic", result.user.photoURL || "");

      localStorage.setItem("userEmail", result.user.email || "");

      localStorage.setItem("userPic", result.user.photoURL || "");

      alert(`Login Google Berhasil! Halo, ${result.user.displayName}`);
      router.push("/"); // Gunakan router.push agar lebih smooth
    } catch (error: any) {
      // Error origin_mismatch biasanya tidak muncul lagi di sini kalau localhost sudah di-whitelist di Firebase
      alert("Google Login Gagal: " + error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 style={{ color: "#ffd700", marginBottom: "10px" }}>
          {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
          {isLogin
            ? "Silakan login untuk akses aset eksklusif"
            : "Gabung dengan komunitas NusantaraAssets"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="contoh@unsoed.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-utama"
            style={{
              width: "100%",
              marginBottom: "15px",
              borderRadius: "50px",
              padding: "15px",
              fontWeight: "bold",
            }}
          >
            {isLogin ? "Masuk" : "Daftar Sekarang"}
          </button>
        </form>

        <div
          style={{
            margin: "25px 0",
            position: "relative",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#1e293b",
              padding: "0 10px",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            atau
          </span>
        </div>

        {/* Tombol Google Custom yang simpel */}
        <button
          onClick={handleGoogleLogin}
          className="btn-google"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            backgroundColor: "white",
            color: "#333",
            border: "none",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: "18px" }}
          />
          Masuk dengan Google
        </button>

        <div style={{ marginTop: "25px", fontSize: "14px", color: "#94a3b8" }}>
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: "#ffd700", cursor: "pointer", fontWeight: "bold" }}
          >
            {isLogin ? "Daftar Sekarang" : "Login di Sini"}
          </span>
        </div>

        <button
          onClick={() => router.push("/")}
          style={{
            display: "block",
            width: "100%",
            marginTop: "30px",
            color: "#64748b",
            background: "none",
            border: "none",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
