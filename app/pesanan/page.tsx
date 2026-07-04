"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/app/components/Navbar";
import { createSupabaseBrowser } from "@/app/lib/supabase/client";
import {
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Calendar,
  CreditCard,
  CircleDollarSign,
  Loader2,
  X,
} from "lucide-react";

/* ─── Types ─── */
interface Produk {
  id: number;
  name: string;
  harga?: number;
  file_path?: string;
  gambar_url?: string;
}

interface Pesanan {
  id: string;
  created_at: string;
  product_id: number;
  metode_pembayaran: string;
  status: string;
  is_approved: boolean;
  first_downloaded_at: string | null; // dari server
  produk?: Produk | null;
}

/* ─── Helpers ─── */
const formatRupiah = (amount?: number) => {
  if (!amount) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getDisplayStatus = (
  pesanan: Pesanan,
): "approved" | "declined" | "pending" => {
  if (pesanan.is_approved === true || pesanan.status === "approved")
    return "approved";
  if (pesanan.status === "rejected") return "declined";
  return "pending";
};

/* ─── Konstanta durasi unduh (server harus pakai nilai yang sama) ─── */
const DOWNLOAD_DURATION_MS = 10_800_000; // testing 1 menit, produksi 3 jam: 10_800_000

export default function PesananPage() {
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // UI
  const [confirmModal, setConfirmModal] = useState<Pesanan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Update current time setiap 1 detik untuk countdown realtime
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Ambil data pesanan (termasuk first_downloaded_at)
  useEffect(() => {
    const fetchPesanan = async () => {
      try {
        const customerId = localStorage.getItem("userId");
        if (!customerId) {
          setError("Anda belum login. Silakan login terlebih dahulu.");
          setLoading(false);
          return;
        }

        const supabase = createSupabaseBrowser();
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        if (!orders || orders.length === 0) {
          setPesananList([]);
          setLoading(false);
          return;
        }

        const productIds = orders.map((order) => order.product_id);
        const { data: products, error: productsError } = await supabase
          .from("product")
          .select("id, nama, harga, file_path, gambar_url")
          .in("id", productIds);

        const produkMap: Record<number, Produk> = {};
        if (!productsError && products) {
          products.forEach((p) => {
            produkMap[p.id] = {
              id: p.id,
              name: p.nama,
              harga: p.harga,
              file_path: p.file_path,
              gambar_url: p.gambar_url,
            };
          });
        }

        const merged: Pesanan[] = orders.map((order) => ({
          id: order.id,
          created_at: order.created_at,
          product_id: order.product_id,
          metode_pembayaran: order.metode_pembayaran,
          status: order.status || "pending",
          is_approved: order.is_approved || false,
          first_downloaded_at: order.first_downloaded_at || null,
          produk: produkMap[order.product_id] || null,
        }));

        setPesananList(merged);
      } catch (err: unknown) {
        console.error("Gagal mengambil pesanan:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat pesanan.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPesanan();
  }, []);

  const updatePesanan = useCallback(
    (orderId: string, updates: Partial<Pesanan>) => {
      setPesananList((prev) =>
        prev.map((p) => (p.id === orderId ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  // Eksekusi download (memanggil API, server yang mencatat first_downloaded_at)
  const executeDownload = async (pesanan: Pesanan) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setToastMessage("Anda harus login terlebih dahulu.");
      return;
    }

    const orderId = pesanan.id;
    setDownloadingId(orderId);

    try {
      const response = await fetch(
        `/api/download/${orderId}?userId=${encodeURIComponent(userId)}`,
      );

      if (!response.ok) {
        if (response.status === 410 || response.status === 403) {
          // Server mengatakan sudah kadaluarsa
          updatePesanan(orderId, { first_downloaded_at: "expired" });
          throw new Error("Link download sudah kadaluarsa.");
        }
        let errorMessage = `Gagal mengunduh (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      // BACA BLOB DULU (body hanya bisa dibaca sekali)
      const blob = await response.blob();

      // Ambil timestamp dari header (tanpa membaca body lagi)
      const serverTimestamp = response.headers.get("X-First-Downloaded-At");
      if (serverTimestamp) {
        updatePesanan(orderId, { first_downloaded_at: serverTimestamp });
      } else {
        // fallback jika header tidak ada (tetap bisa digunakan)
        updatePesanan(orderId, {
          first_downloaded_at: new Date().toISOString(),
        });
      }

      // Buat link unduhan
      const downloadUrl = URL.createObjectURL(blob);
      let filename = "";
      const disposition = response.headers.get("Content-Disposition");
      if (disposition) {
        const utf8Match = disposition.match(
          /filename\*=(?:UTF-8'')([^;]+)/i,
        );
        if (utf8Match) {
          filename = decodeURIComponent(utf8Match[1]);
        } else {
          const asciiMatch = disposition.match(/filename="([^"]+)"/i);
          if (asciiMatch) filename = asciiMatch[1];
        }
      }
      if (!filename) {
        const ext = blob.type.split("/")[1] || "zip";
        filename = pesanan.produk?.name
          ? `${pesanan.produk.name.replace(/[^a-zA-Z0-9_\-. ]/g, "_")}.${ext}`
          : `aset-${orderId.slice(0, 8)}.${ext}`;
      }

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 10_000);
    } catch (err: unknown) {
      console.error("Download error:", err);
      setToastMessage(
        err instanceof Error
          ? err.message
          : "Gagal mengunduh, coba lagi nanti.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // Handler klik tombol download
  const handleDownload = (pesanan: Pesanan) => {
    const statusDisplay = getDisplayStatus(pesanan);
    if (statusDisplay !== "approved") return;

    // Jika belum pernah download (first_downloaded_at null) → tampilkan modal
    if (!pesanan.first_downloaded_at) {
      setConfirmModal(pesanan);
      return;
    }

    // Sudah pernah download: cek masa berlaku
    const firstTime = new Date(pesanan.first_downloaded_at).getTime();
    const elapsed = currentTime - firstTime;
    if (elapsed >= DOWNLOAD_DURATION_MS) {
      setToastMessage("Link download sudah kadaluarsa.");
      return;
    }

    // Masih berlaku → langsung download
    executeDownload(pesanan);
  };

  const confirmDownload = () => {
    if (confirmModal) {
      executeDownload(confirmModal);
      setConfirmModal(null);
    }
  };

  /* ─── Render ─── */
  return (
    <main className="pesanan-page">
      <Navbar />

      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Konfirmasi Download</h3>
            <p>
              File aset hanya dapat diunduh dalam waktu{" "}
              <strong>3 jam</strong>. Setelah itu, File tidak dapat diunduh kembali.
              silakan lakukan reorder. Terima kasih.
            </p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setConfirmModal(null)}
              >
                Batal
              </button>
              <button className="btn-primary" onClick={confirmDownload}>
                <Download size={16} /> Unduh
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pesanan-container">
        <div className="pesanan-header">
          <div className="header-icon">
            <ShoppingBag size={36} />
          </div>
          <h2>
            Pesanan <span>Saya</span>
          </h2>
          <p>Pantau semua transaksi aset digital Nusantara kamu</p>
        </div>

        {loading && (
          <div className="loading-skeleton">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <AlertCircle size={48} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && pesananList.length === 0 && (
          <div className="empty-state">
            <ShoppingBag size={48} />
            <h3>Belum ada pesanan</h3>
            <p>Yuk, mulai jelajahi katalog aset menarik kami!</p>
          </div>
        )}

        {!loading && !error && pesananList.length > 0 && (
          <div className="pesanan-list">
            {pesananList.map((pesanan) => {
              const transactionCode = pesanan.id.slice(0, 8).toUpperCase();
              const statusDisplay = getDisplayStatus(pesanan);
              const isApproved = statusDisplay === "approved";
              const isDownloading = downloadingId === pesanan.id;

              // Hitung sisa waktu berdasarkan first_downloaded_at
              let remainingText: string | null = null;
              let downloadExpired = false;
              if (isApproved && pesanan.first_downloaded_at) {
                if (pesanan.first_downloaded_at === "expired") {
                  downloadExpired = true;
                  remainingText = "Link kadaluarsa";
                } else {
                  const firstTime = new Date(
                    pesanan.first_downloaded_at,
                  ).getTime();
                  const elapsed = currentTime - firstTime;
                  const left = DOWNLOAD_DURATION_MS - elapsed;
                  if (left <= 0) {
                    downloadExpired = true;
                    remainingText = "Link kadaluarsa";
                  } else {
                    const totalSeconds = Math.floor(left / 1000);

                      const hours = Math.floor(totalSeconds / 3600);
                      const mins = Math.floor((totalSeconds % 3600) / 60);
                      const secs = totalSeconds % 60;

                      remainingText = `Sisa waktu: ${hours}:${mins
                        .toString()
                        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                    }
                }
              }

              const downloadDisabled =
                !isApproved || isDownloading || downloadExpired;

              return (
                <div key={pesanan.id} className="pesanan-card">
                  <div className="card-left">
                    {pesanan.produk?.gambar_url ? (
                      <img
                        src={pesanan.produk.gambar_url}
                        alt={pesanan.produk.name || "Produk"}
                        className="product-avatar-img"
                      />
                    ) : (
                      <div className="product-avatar">
                        {pesanan.produk?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="card-info">
                      <div className="product-name">
                        {pesanan.produk?.name ||
                          `Produk #${pesanan.product_id}`}
                      </div>
                      <div className="transaction-code">
                        Kode Transaksi: <span>{transactionCode}</span>
                      </div>
                      <div className="order-meta">
                        <span className="meta-item">
                          <Calendar size={13} />
                          {new Date(pesanan.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        {pesanan.metode_pembayaran && (
                          <span className="meta-item">
                            <CreditCard size={13} />
                            {pesanan.metode_pembayaran.toUpperCase()}
                          </span>
                        )}
                        <span className="meta-item">
                          <CircleDollarSign size={13} />
                          {formatRupiah(pesanan.produk?.harga)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card-right">
                    <div className="status-section">
                      <span
                        className={`badge ${
                          statusDisplay === "approved"
                            ? "badge-approved"
                            : statusDisplay === "declined"
                              ? "badge-declined"
                              : "badge-pending"
                        }`}
                      >
                        {statusDisplay === "approved" ? (
                          <CheckCircle size={14} />
                        ) : statusDisplay === "declined" ? (
                          <AlertCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {statusDisplay === "approved"
                          ? "Disetujui"
                          : statusDisplay === "declined"
                            ? "Ditolak"
                            : "Menunggu"}
                      </span>

                      {remainingText && (
                        <div
                          className={`countdown ${downloadExpired ? "expired" : ""}`}
                        >
                          {remainingText}
                        </div>
                      )}
                    </div>

                    <button
                      className={`btn-download ${downloadDisabled ? "disabled" : ""}`}
                      disabled={downloadDisabled}
                      onClick={() => handleDownload(pesanan)}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={16} className="spinner" /> Mengunduh...
                        </>
                      ) : (
                        <>
                          <Download size={16} /> Unduh Aset
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .pesanan-page {
          background: linear-gradient(135deg, #0b1120 0%, #0f172a 100%);
          min-height: 100vh;
          color: #e2e8f0;
          font-family: "Plus Jakarta Sans", "Inter", sans-serif;
          position: relative;
        }

        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          padding: 16px 20px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 20px 35px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          min-width: 280px;
          max-width: 400px;
          font-size: 0.9rem;
          color: #f1f5f9;
          animation: slideIn 0.3s ease;
        }
        .toast-notification button {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .toast-notification button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.08);
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 24px;
          padding: 32px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 30px 50px rgba(0, 0, 0, 0.7);
        }
        .modal-content h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 16px;
          color: #ffd700;
        }
        .modal-content p {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 24px;
          font-size: 0.95rem;
        }
        .modal-content strong {
          color: #ffd700;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .btn-primary {
          background: linear-gradient(135deg, #ffd700, #fbbf24);
          border: none;
          color: #0f172a;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 6px 18px rgba(255, 215, 0, 0.25);
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(255, 215, 0, 0.35);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pesanan-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 130px 24px 60px;
        }
        .pesanan-header {
          text-align: center;
          margin-bottom: 44px;
        }
        .header-icon {
          display: inline-flex;
          background: rgba(255, 215, 0, 0.08);
          padding: 16px;
          border-radius: 20px;
          color: #ffd700;
          margin-bottom: 20px;
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.1);
        }
        .pesanan-header h2 {
          font-size: 2.4rem;
          font-weight: 800;
          color: white;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .pesanan-header h2 span {
          color: #ffd700;
        }
        .pesanan-header p {
          color: #94a3b8;
          font-size: 1rem;
        }

        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .skeleton-card {
          background: #1e293b;
          border-radius: 18px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          animation: pulse 1.6s infinite;
        }
        .skeleton-line {
          height: 12px;
          background: #334155;
          border-radius: 8px;
          margin-bottom: 12px;
          width: 100%;
        }
        .skeleton-line.wide {
          width: 50%;
          height: 16px;
        }
        .skeleton-line.short {
          width: 30%;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        .error-state,
        .empty-state {
          text-align: center;
          padding: 64px 24px;
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
        }
        .error-state svg,
        .empty-state svg {
          color: #ffd700;
          margin-bottom: 16px;
        }
        .empty-state h3 {
          font-size: 1.4rem;
          color: white;
          margin: 12px 0 6px;
        }

        .pesanan-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .pesanan-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 22px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 24px;
          transition: all 0.25s ease;
          box-shadow: 0 10px 25px -8px rgba(0, 0, 0, 0.4);
        }
        .pesanan-card:hover {
          border-color: rgba(255, 215, 0, 0.25);
          box-shadow: 0 15px 35px -8px rgba(255, 215, 0, 0.08);
          transform: translateY(-2px);
        }

        .card-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 240px;
        }
        .product-avatar-img {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          object-fit: cover;
          border: 1px solid rgba(255, 215, 0, 0.2);
          flex-shrink: 0;
        }
        .product-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          color: #ffd700;
          flex-shrink: 0;
        }
        .product-name {
          font-weight: 700;
          color: #f1f5f9;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        .transaction-code {
          font-size: 0.75rem;
          color: #a0aec0;
          margin-bottom: 4px;
        }
        .transaction-code span {
          font-family: monospace;
          font-weight: 600;
          color: #ffd700;
          background: rgba(255, 215, 0, 0.1);
          padding: 2px 6px;
          border-radius: 12px;
        }
        .order-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          color: #94a3b8;
          font-size: 0.8rem;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #94a3b8;
        }

        .card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-start;
          gap: 12px;
          flex-shrink: 0;
          min-width: 200px;
        }

        .status-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          width: 100%;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .badge-approved {
          background: #10b98120;
          color: #10b981;
          border: 1px solid #10b98140;
        }
        .badge-pending {
          background: #f59e0b20;
          color: #f59e0b;
          border: 1px solid #f59e0b40;
        }
        .badge-declined {
          background: #ef444420;
          color: #ef4444;
          border: 1px solid #ef444440;
        }

        .countdown {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(255, 215, 0, 0.1);
          color: #ffd700;
          border: 1px solid rgba(255, 215, 0, 0.25);
          white-space: nowrap;
          margin-top: 1px;
        }
        .countdown.expired {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }

        .btn-download {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #ffd700, #fbbf24);
          color: #0f172a;
          padding: 12px 28px;
          border-radius: 30px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          letter-spacing: -0.2px;
          transition: all 0.2s ease;
          box-shadow: 0 6px 18px rgba(255, 215, 0, 0.25);
          white-space: nowrap;
          min-width: 160px;
        }
        .btn-download:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(255, 215, 0, 0.35);
        }
        .btn-download:active:not(.disabled) {
          transform: translateY(0);
        }
        .btn-download.disabled {
          background: #334155;
          color: #64748b;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
          opacity: 0.6;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Tablet/Medium (600px - 1026px) */
        @media (max-width: 2000px) {
          .pesanan-card {
            flex-wrap: wrap;
            gap: 16px;
          }
          .card-right {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            min-width: auto;
            gap: 16px;
          }
          .status-section {
            align-items: flex-start;
            gap: 4px;
            flex: 1;
            order: 1;
          }
          .btn-download {
            order: 2;
            flex-shrink: 0;
            min-width: 150px;
          }
        }

        /* Mobile (< 600px) */
        @media (max-width: 600px) {
          .pesanan-container {
            padding: 100px 16px 40px;
          }

          .pesanan-header {
            margin-bottom: 32px;
          }
          .pesanan-header h2 {
            font-size: 1.8rem;
          }
          .pesanan-header p {
            font-size: 0.9rem;
          }

          .pesanan-card {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
            gap: 12px;
          }

          .card-left {
            gap: 12px;
          }

          .product-avatar-img,
          .product-avatar {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .product-name {
            font-size: 0.95rem;
          }

          .order-meta {
            font-size: 0.75rem;
            gap: 8px;
          }

          .card-right {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .status-section {
            align-items: stretch;
            min-width: auto;
          }

          .badge {
            padding: 8px 12px;
            font-size: 0.75rem;
            justify-content: center;
          }

          .countdown {
            padding: 6px 10px;
            font-size: 0.7rem;
            text-align: center;
          }

          .btn-download {
            width: 100%;
            padding: 12px 16px;
            font-size: 0.85rem;
            gap: 6px;
          }
          .btn-download svg {
            width: 14px;
            height: 14px;
          }

          .toast-notification {
            left: 12px;
            right: 12px;
            top: 16px;
            min-width: unset;
            max-width: unset;
            padding: 12px 16px;
            font-size: 0.85rem;
            gap: 12px;
          }

          .modal-content {
            padding: 24px;
            border-radius: 20px;
          }
          .modal-content h3 {
            font-size: 1.2rem;
            margin-bottom: 12px;
          }
          .modal-content p {
            font-size: 0.9rem;
            margin-bottom: 20px;
          }
          .modal-actions {
            gap: 10px;
          }
          .btn-primary,
          .btn-secondary {
            flex: 1;
            padding: 10px 16px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </main>
  );
}