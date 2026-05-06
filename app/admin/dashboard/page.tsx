"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { createSupabaseBrowser } from "@/app/lib/supabase/client";

/* ---- Estetik Icons ---- */
const IcoPackage = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);
const IcoUsers = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IcoTarget = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const IcoBag = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IcoArrowUp = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);
const IcoArrowDn = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="7" x2="17" y2="17" />
    <polyline points="17 7 17 17 7 17" />
  </svg>
);

/* ---- Ranking Icons ---- */
const IcoStar = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IcoSparkle = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
const IcoCrown = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "24px",
};

export default function OverviewPage() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart | null>(null);
  const [filter, setFilter] = useState("Bulan");
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    avgOrder: 0,
    conversion: 0,
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  const SALES_TARGET = 500;

  const fetchRealData = async () => {
    const supabase = createSupabaseBrowser();
    const { data: allOrders } = await supabase
      .from("orders")
      .select(`*, customers ( full_name, email ), product ( nama, harga )`);
    const { count: customerCount } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (allOrders) {
      const totalSales = allOrders.reduce(
        (acc, curr) => acc + (Number(curr.product?.harga) || 0),
        0,
      );
      setSummary({
        totalOrders: allOrders.length,
        totalCustomers: customerCount || 1,
        avgOrder: totalSales / allOrders.length,
        conversion: (allOrders.length / (customerCount || 1)) * 100,
      });

      setTransactions(
        allOrders
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .slice(0, 5),
      );

      const counts: any = {};
      allOrders.forEach((o) => {
        if (o.product?.nama)
          counts[o.product.nama] = (counts[o.product.nama] || 0) + 1;
      });
      setTopProducts(
        Object.keys(counts)
          .sort((a, b) => counts[b] - counts[a])
          .slice(0, 3)
          .map((name, index) => {
            const prodInfo = allOrders.find(
              (o) => o.product?.nama === name,
            )?.product;
            return {
              name,
              sales: counts[name],
              price: prodInfo?.harga
                ? `Rp ${(prodInfo.harga / 1000).toFixed(0)}k`
                : "Rp 0",
              Icon: index === 0 ? IcoStar : index === 1 ? IcoSparkle : IcoCrown,
            };
          }),
      );

      // --- LOGIKA GRAFIK REAL ---
      if (filter === "Minggu") {
        const dayTotals = new Array(7).fill(0);
        allOrders.forEach((o) => {
          const d = new Date(o.created_at);
          const dayIndex = (d.getDay() + 6) % 7;
          dayTotals[dayIndex] += Number(o.product?.harga || 0);
        });
        setChartLabels(["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]);
        setChartData(dayTotals);
      } else if (filter === "Bulan") {
        const monthTotals = new Array(12).fill(0);
        allOrders.forEach((o) => {
          monthTotals[new Date(o.created_at).getMonth()] += Number(
            o.product?.harga || 0,
          );
        });
        setChartLabels([
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agt",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ]);
        setChartData(monthTotals);
      } else {
        // TAHUN: Rentang 2026 - 2030 sesuai permintaan
        const yearLabels = [2026, 2027, 2028, 2029, 2030];
        const yearTotals = new Array(5).fill(0);
        allOrders.forEach((o) => {
          const y = new Date(o.created_at).getFullYear();
          const idx = yearLabels.indexOf(y);
          if (idx !== -1) yearTotals[idx] += Number(o.product?.harga || 0);
        });
        setChartLabels(yearLabels.map(String));
        setChartData(yearTotals);
      }
    }
  };

  useEffect(() => {
    fetchRealData();
  }, [filter]);

  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;
    chartInst.current?.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Pendapatan",
            data: chartData,
            backgroundColor: "rgba(255,215,0,0.2)",
            hoverBackgroundColor: "#ffd700",
            borderRadius: 8,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) =>
                ` Rp ${ctx.parsed.y.toLocaleString("id-ID")}`,
            },
          },
        },
        scales: {
          y: {
            max: 1000000,
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.03)" },
            ticks: {
              color: "#64748b",
              callback: (v: any) =>
                v >= 1000000 ? "1jt" : v.toLocaleString("id-ID"),
            },
          },
          x: { ticks: { color: "#64748b" } },
        },
      },
    });
  }, [chartData, chartLabels]);

  const statsList = [
    {
      label: "Total Pesanan",
      value: summary.totalOrders,
      color: "#60a5fa",
      Icon: <IcoPackage />,
      trend: "+12%",
    },
    {
      label: "Pengunjung Unik",
      value: summary.totalCustomers,
      color: "#c084fc",
      Icon: <IcoUsers />,
      trend: "+18%",
    },
    {
      label: "Tingkat Konversi",
      value: summary.conversion.toFixed(1) + "%",
      color: "#ffd700",
      Icon: <IcoTarget />,
      trend: "-2%",
      neg: true,
    },
    {
      label: "Rata-rata Order",
      value: `Rp ${(summary.avgOrder / 1000).toFixed(0)}k`,
      color: "#4ade80",
      Icon: <IcoBag />,
      trend: "+5%",
    },
  ];

  return (
    <div className="page-wrapper">
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .page-wrapper { display: flex; flex-direction: column; gap: 28px; animation: fadeSlideUp 0.5s ease both; font-family: 'Plus Jakarta Sans', sans-serif; color: white; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .chart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
        .filter-btn { cursor: pointer; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #64748b; padding: 6px 14px; border-radius: 10px; font-size: 12px; transition: 0.2s; }
        .filter-btn.active { background: #ffd700; color: #0f172a; border: none; font-weight: bold; }
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .chart-layout { grid-template-columns: 1fr; } }
      `}</style>

      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800 }}>
          Ringkasan Performa
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px" }}>
          Pantau perkembangan NusaAssets hari ini.
        </p>
      </div>

      <div className="stats-grid">
        {statsList.map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  color: s.color,
                  background: `${s.color}15`,
                  padding: "10px",
                  borderRadius: "12px",
                  display: "flex",
                }}
              >
                {s.Icon}
              </div>
              <span
                style={{
                  color: s.neg ? "#f87171" : "#4ade80",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {s.trend}
              </span>
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "#475569",
                marginTop: "20px",
                fontWeight: 700,
              }}
            >
              {s.label.toUpperCase()}
            </p>
            <h3
              style={{ fontSize: "26px", fontWeight: 800, margin: "4px 0 0" }}
            >
              {s.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="chart-layout">
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3>Grafik Pendapatan</h3>
            <div style={{ display: "flex", gap: "6px" }}>
              {["Minggu", "Bulan", "Tahun"].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: "280px" }}>
            <canvas ref={chartRef} />
          </div>
        </div>

        <div style={cardStyle}>
          <h3
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IcoCrown /> Produk Terlaris
          </h3>
          {topProducts.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(255,215,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffd700",
                  }}
                >
                  <p.Icon />
                </div>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: "14px" }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: "11px", color: "#475569" }}>
                    {p.sales} terjual
                  </p>
                </div>
              </div>
              <p style={{ color: "#ffd700", fontWeight: "bold" }}>{p.price}</p>
            </div>
          ))}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#475569",
                textAlign: "center",
              }}
            >
              {summary.totalOrders} unit terjual
            </p>
            <div
              style={{
                height: "6px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "99px",
                overflow: "hidden",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((summary.totalOrders / SALES_TARGET) * 100, 100)}%`,
                  background: "#ffd700",
                }}
              />
            </div>
            <p
              style={{ fontSize: "10px", color: "#334155", textAlign: "right" }}
            >
              {((summary.totalOrders / SALES_TARGET) * 100).toFixed(1)}% dari
              target
            </p>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h3>Transaksi Terbaru</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                color: "#475569",
                fontSize: "10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <th style={{ padding: "14px 28px" }}>ID</th>
              <th style={{ padding: "14px 28px" }}>PELANGGAN</th>
              <th style={{ padding: "14px 28px" }}>PRODUK</th>
              <th style={{ padding: "14px 28px" }}>TOTAL</th>
              <th style={{ padding: "14px 28px" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <td
                  style={{
                    padding: "16px 28px",
                    color: "#475569",
                    fontSize: "12px",
                  }}
                >
                  #TRX-{t.id.toString().slice(0, 8)}
                </td>
                <td style={{ padding: "16px 28px", fontWeight: 600 }}>
                  {t.customers?.full_name || t.customers?.email || "User"}
                </td>
                <td style={{ padding: "16px 28px", color: "#64748b" }}>
                  {t.product?.nama || "Aset Digital"}
                </td>
                <td
                  style={{
                    padding: "16px 28px",
                    color: "#ffd700",
                    fontWeight: 700,
                  }}
                >
                  {t.product?.harga
                    ? `Rp ${t.product.harga.toLocaleString("id-ID")}`
                    : "Rp 0"}
                </td>
                <td style={{ padding: "16px 28px" }}>
                  <span
                    style={{
                      background:
                        t.status === "approved"
                          ? "rgba(74,222,128,0.1)"
                          : "rgba(255,215,0,0.1)",
                      color: t.status === "approved" ? "#4ade80" : "#ffd700",
                      padding: "5px 12px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
