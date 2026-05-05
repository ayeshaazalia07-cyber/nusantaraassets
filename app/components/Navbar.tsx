"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  PackageCheck,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeHash, setActiveHash] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
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
          console.error("Log error:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      await signOut(auth);
      setIsOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isLinkActive = (path: string) => {
    if (path === "/#kotak-saran") return activeHash === "#kotak-saran";
    return pathname === path && activeHash === "";
  };

  const Avatar = () => {
    const photo = user?.photoURL;
    const initial =
      (user?.displayName?.[0] || user?.email?.[0])?.toUpperCase() || "?";
    return photo ? (
      <img
        src={photo}
        alt="avatar"
        width={28}
        height={28}
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
    ) : (
      <div className="avatar-placeholder">{initial}</div>
    );
  };

  return (
    <nav className="navbar-main">
      <div className="nav-left-section">
        <img src="/img/logo.png" alt="Logo" className="logo-img" />
        <span className="brand-text">
          Nusantara<span style={{ color: "#ffd700" }}>Assets</span>
        </span>
      </div>

      <div className={`nav-center-section ${isOpen ? "mobile-open" : ""}`}>
        {isOpen && user && (
          <div className="mobile-profile-card">
            <Avatar />
            <span className="mobile-user-name">
              Halo, {user.displayName?.split(" ")[0]}
            </span>
          </div>
        )}

        <Link
          href="/"
          onClick={(e) => {
            setIsOpen(false);
            setActiveHash("");
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`nav-item ${isLinkActive("/") ? "active" : ""}`}
        >
          Beranda
        </Link>

        <Link
          href="/katalog"
          onClick={() => {
            setIsOpen(false);
            setActiveHash("");
          }}
          className={`nav-item ${isLinkActive("/katalog") ? "active" : ""}`}
        >
          Katalog Aset
        </Link>

        <Link
          href="/#kotak-saran"
          onClick={(e) => {
            setIsOpen(false);
            setActiveHash("#kotak-saran");
            if (pathname === "/") {
              e.preventDefault();
              const element = document.getElementById("kotak-saran");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }
          }}
          className={`nav-item ${isLinkActive("/#kotak-saran") ? "active" : ""}`}
        >
          Saran
        </Link>

        {isOpen && (
          <div className="mobile-only-actions">
            <div className="divider" />
            {user ? (
              <>
                <Link
                  href="/pesanan"
                  onClick={() => setIsOpen(false)}
                  className="mob-link"
                >
                  <PackageCheck size={18} /> Pesanan Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="mob-link logout-btn-mob"
                >
                  <LogOut size={18} /> Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="mob-login-btn"
              >
                Masuk
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="nav-right-section">
        <Link href="/keranjang" className="cart-link">
          <ShoppingCart size={24} color="#ffd700" />
        </Link>

        {!loading && (
          <div className="auth-desktop-wrapper" ref={dropdownRef}>
            {user ? (
              <div className="user-pop-container">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="user-btn"
                >
                  <Avatar />
                  <span className="name-trunc">
                    Halo, {user.displayName?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`chevron-icon ${dropdownOpen ? "rotated" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="drop-box">
                    <Link
                      href="/pesanan"
                      onClick={() => setDropdownOpen(false)}
                      className="drop-item"
                    >
                      <PackageCheck size={18} className="item-icon" />
                      <span>Pesanan Saya</span>
                    </Link>
                    <button onClick={handleLogout} className="drop-item red">
                      <LogOut size={18} className="item-icon" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="login-btn">
                Masuk
              </Link>
            )}
          </div>
        )}

        <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .navbar-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 5%;
          height: 80px;
          background: rgba(10, 15, 30, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          font-family: "Plus Jakarta Sans", sans-serif;
        }

        .nav-left-section {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .nav-center-section {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex: 2;
        }
        .nav-right-section {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: flex-end;
          flex: 1;
        }

        .brand-text {
          font-size: 18px;
          font-weight: 800;
          color: white;
          white-space: nowrap;
        }
        .logo-img {
          width: 32px;
          height: auto;
          margin-right: 10px;
        }

        .nav-item {
          color: #94a3b8;
          font-weight: 500;
          font-size: 14px;
          text-decoration: none !important;
          transition: all 0.3s ease;
          padding: 8px 0;
          border-bottom: 2px solid transparent;
        }
        .nav-item.active {
          color: #ffd700 !important;
          border-bottom: 2px solid #ffd700 !important;
          font-weight: 700;
        }
        .nav-item:hover {
          color: #ffd700;
        }

        .login-btn {
          background: transparent !important;
          color: #ffd700 !important;
          border: 1.5px solid #ffd700 !important;
          padding: 8px 24px !important;
          border-radius: 10px !important;
          text-decoration: none !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          transition: 0.3s ease !important;
        }
        .login-btn:hover {
          background: rgba(255, 215, 0, 0.1) !important;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 30px;
          padding: 6px 14px;
          cursor: pointer;
          color: white;
          transition: 0.3s ease;
        }

        .chevron-icon {
          transition: transform 0.4s ease;
          color: #94a3b8;
        }
        .chevron-icon.rotated {
          transform: rotate(180deg);
          color: #ffd700;
        }

        .drop-box {
          position: absolute;
          right: 0;
          top: 55px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          min-width: 180px;
          padding: 8px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
          z-index: 1001;
          animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .drop-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          color: #cbd5e1;
          text-decoration: none !important;
          font-size: 14px;
          border-radius: 10px;
          transition: 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
        }
        .drop-item:hover {
          background: rgba(255, 215, 0, 0.15);
          color: #ffd700;
        }
        .drop-item.red {
          color: #f87171 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 5px;
        }
        .drop-item.red:hover {
          background: rgba(248, 113, 113, 0.1);
        }

        .avatar-placeholder {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 215, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffd700;
          font-weight: 800;
          font-size: 12px;
        }

        .hamburger {
          display: none;
          cursor: pointer;
          color: white;
        }

        @media (max-width: 768px) {
          .auth-desktop-wrapper {
            display: none !important;
          }
          .nav-center-section {
            display: none;
            position: absolute;
            top: 80px;
            left: 0;
            width: 100%;
            flex-direction: column;
            background: #0a0f1e;
            padding: 30px;
            gap: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            align-items: center;
          }
          .nav-center-section.mobile-open {
            display: flex;
          }
          .hamburger {
            display: block;
          }

          .mobile-profile-card {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: #ffd700;
            color: #020617;
            padding: 12px 20px;
            border-radius: 12px;
            width: 100%;
          }
          .mob-link {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #cbd5e1;
            text-decoration: none !important;
            font-size: 15px;
            padding: 12px 0;
            width: 100%;
            transition: 0.3s ease;
          }

          /* FIX: Tombol Masuk Mobile Melebar (Menyesuaikan Desktop) */
          .mob-login-btn {
            background: transparent !important;
            color: #ffd700 !important;
            border: 1.5px solid #ffd700 !important;
            padding: 10px 40px !important; /* Padding horizontal ditambah biar lebar */
            border-radius: 10px !important;
            display: inline-block !important; /* Biar ukurannya pas dengan padding */
            text-align: center !important;
            font-weight: 800 !important;
            text-decoration: none !important;
            margin-top: 10px !important;
            transition: 0.3s ease !important;
          }
          .mob-login-btn:active {
            background: rgba(255, 215, 0, 0.1) !important;
          }

          .logout-btn-mob {
            margin-top: 10px;
            background: rgba(248, 113, 113, 0.1) !important;
            border: 1px solid #f87171 !important;
            color: #f87171 !important;
            font-weight: 600;
            border-radius: 10px;
          }
        }
      `}</style>
    </nav>
  );
}
