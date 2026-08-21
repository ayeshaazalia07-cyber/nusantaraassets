"use client";

import { useEffect, useState, useMemo } from "react";
import { createSupabaseBrowser } from "@/app/lib/supabase/client";
import Swal from "sweetalert2";
import {
  Briefcase,
  Search,
  UserPlus,
  Trash2,
  CalendarClock,
  ShieldCheck,
  Edit,
  GraduationCap,
  FolderGit2,
} from "lucide-react";

export default function MitraPage() {
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // State untuk Tab: 'institusi' atau 'project'
  const [activeTab, setActiveTab] = useState<"institusi" | "project">(
    "institusi",
  );

  const fetchMitra = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or("is_institusi.eq.true,is_project.eq.true");

      if (error) throw error;
      setMitraList(data || []);
    } catch (err) {
      console.error("Gagal mengambil data mitra:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMitra();
  }, [supabase]);

  // ==========================================
  // 1. KELOLA MITRA INSTITUSI (PENDIDIKAN)
  // ==========================================
  const handleAddOrEditInstitusi = async (mitra?: any) => {
    const isEdit = !!mitra;
    const defaultDate = mitra?.institusi_expired_at
      ? new Date(mitra.institusi_expired_at).toISOString().split("T")[0]
      : "";
    const defaultInstitut = mitra?.nama_institut || "";

    const { value: formValues } = await Swal.fire({
      title: isEdit ? "Edit Akun Institusi" : "Tambah Akun Institusi",
      html: `
        <div style="text-align: left; margin-top: 10px;">
          <label style="color: #94a3b8; font-size: 13px;">Email Akun</label>
          <input id="swal-email" type="email" class="swal2-input" value="${mitra?.email || ""}" ${isEdit ? "disabled" : ""} placeholder="email@sekolah.ac.id" style="width: 85%; margin: 5px auto 15px; font-size: 14px;">
          
          <label style="color: #94a3b8; font-size: 13px;">Nama Institut / Sekolah</label>
          <input id="swal-institut" type="text" class="swal2-input" value="${defaultInstitut}" placeholder="Contoh: SMKN 1 Jakarta" style="width: 85%; margin: 5px auto 15px; font-size: 14px;">

          <label style="color: #94a3b8; font-size: 13px;">Tanggal Berakhir (Expired)</label>
          <input id="swal-date" type="date" class="swal2-input" value="${defaultDate}" style="width: 85%; margin: 5px auto; font-size: 14px;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ffd700",
      cancelButtonColor: "#334155",
      background: "#1e293b",
      color: "#fff",
      preConfirm: () => {
        return {
          email: (document.getElementById("swal-email") as HTMLInputElement)
            .value,
          institut: (
            document.getElementById("swal-institut") as HTMLInputElement
          ).value,
          date: (document.getElementById("swal-date") as HTMLInputElement)
            .value,
        };
      },
    });

    if (formValues && formValues.email && formValues.date) {
      Swal.showLoading();
      try {
        const { data: existingUser } = await supabase
          .from("customers")
          .select("id")
          .eq("email", formValues.email)
          .maybeSingle();

        if (existingUser) {
          await supabase
            .from("customers")
            .update({
              is_institusi: true,
              nama_institut: formValues.institut,
              institusi_expired_at: new Date(formValues.date).toISOString(),
            })
            .eq("id", existingUser.id);
        } else {
          await supabase.from("customers").insert([
            {
              email: formValues.email,
              is_institusi: true,
              nama_institut: formValues.institut,
              institusi_expired_at: new Date(formValues.date).toISOString(),
            },
          ]);
        }

        Swal.fire("Berhasil!", "Data Institusi berhasil disimpan.", "success");
        fetchMitra();
      } catch (err: any) {
        Swal.fire("Error!", err.message, "error");
      }
    }
  };

  // ==========================================
  // 2. KELOLA MITRA PROJECT
  // ==========================================
  const handleAddOrEditProject = async (mitra?: any) => {
    const isEdit = !!mitra;
    const defaultStart = mitra?.project_start ? mitra.project_start : "";
    const defaultEnd = mitra?.project_end ? mitra.project_end : "";
    const defaultClient = mitra?.nama_client || "";
    const defaultPaket = mitra?.nama_paket || "";

    const { value: formValues } = await Swal.fire({
      title: isEdit ? "Edit Kemitraan Project" : "Tambah Kemitraan Project",
      width: "500px",
      html: `
        <div style="text-align: left; margin-top: 10px;">
          <label style="color: #94a3b8; font-size: 13px;">Email Akun</label>
          <input id="swal-email-proj" type="email" class="swal2-input" value="${mitra?.email || ""}" ${isEdit ? "disabled" : ""} placeholder="email@client.com" style="width: 85%; margin: 5px auto 15px; font-size: 14px;">
          
          <label style="color: #94a3b8; font-size: 13px;">Nama Client / Perusahaan</label>
          <input id="swal-client" type="text" class="swal2-input" value="${defaultClient}" placeholder="Contoh: PT. Maju Jaya" style="width: 85%; margin: 5px auto 15px; font-size: 14px;">

          <label style="color: #94a3b8; font-size: 13px;">Nama Paket Project</label>
          <input id="swal-paket" type="text" class="swal2-input" value="${defaultPaket}" placeholder="Contoh: Paket Website Custom" style="width: 85%; margin: 5px auto 15px; font-size: 14px;">

          <div style="display: flex; gap: 10px; width: 85%; margin: 0 auto;">
            <div style="flex: 1;">
              <label style="color: #94a3b8; font-size: 13px;">Tanggal Mulai</label>
              <input id="swal-start" type="date" class="swal2-input" value="${defaultStart}" style="width: 100%; margin: 5px 0; font-size: 14px; padding: 0 10px;">
            </div>
            <div style="flex: 1;">
              <label style="color: #94a3b8; font-size: 13px;">Target Selesai</label>
              <input id="swal-end" type="date" class="swal2-input" value="${defaultEnd}" style="width: 100%; margin: 5px 0; font-size: 14px; padding: 0 10px;">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ffd700",
      cancelButtonColor: "#334155",
      background: "#1e293b",
      color: "#fff",
      preConfirm: () => {
        return {
          email: (
            document.getElementById("swal-email-proj") as HTMLInputElement
          ).value,
          client: (document.getElementById("swal-client") as HTMLInputElement)
            .value,
          paket: (document.getElementById("swal-paket") as HTMLInputElement)
            .value,
          start: (document.getElementById("swal-start") as HTMLInputElement)
            .value,
          end: (document.getElementById("swal-end") as HTMLInputElement).value,
        };
      },
    });

    if (formValues && formValues.email && formValues.start && formValues.end) {
      Swal.showLoading();
      try {
        const { data: existingUser } = await supabase
          .from("customers")
          .select("id")
          .eq("email", formValues.email)
          .maybeSingle();

        if (existingUser) {
          await supabase
            .from("customers")
            .update({
              is_project: true,
              nama_client: formValues.client,
              nama_paket: formValues.paket,
              project_start: formValues.start,
              project_end: formValues.end,
            })
            .eq("id", existingUser.id);
        } else {
          await supabase.from("customers").insert([
            {
              email: formValues.email,
              is_project: true,
              nama_client: formValues.client,
              nama_paket: formValues.paket,
              project_start: formValues.start,
              project_end: formValues.end,
            },
          ]);
        }

        Swal.fire("Berhasil!", "Data Project berhasil disimpan.", "success");
        fetchMitra();
      } catch (err: any) {
        Swal.fire("Error!", err.message, "error");
      }
    }
  };

  // ==========================================
  // HAPUS / CABUT AKSES
  // ==========================================
  const handleRevoke = async (
    id: string,
    email: string,
    type: "institusi" | "project",
  ) => {
    const result = await Swal.fire({
      title: "Cabut Akses?",
      text: `Apakah Anda yakin ingin menghapus data kemitraan untuk ${email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: "#1e293b",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        if (type === "institusi") {
          await supabase
            .from("customers")
            .update({
              is_institusi: false,
              institusi_expired_at: null,
              nama_institut: null,
            })
            .eq("id", id);
        } else {
          await supabase
            .from("customers")
            .update({
              is_project: false,
              project_start: null,
              project_end: null,
              nama_client: null,
              nama_paket: null,
            })
            .eq("id", id);
        }
        Swal.fire("Dihapus!", "Data kemitraan telah dicabut.", "success");
        fetchMitra();
      } catch (err) {
        console.error("Gagal mencabut akses:", err);
      }
    }
  };

  // Filter Data berdasarkan Tab Aktif
  const activeData = mitraList.filter((m) => {
    const matchSearch =
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.nama_institut?.toLowerCase().includes(search.toLowerCase()) ||
      m.nama_client?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "institusi") return m.is_institusi && matchSearch;
    return m.is_project && matchSearch;
  });

  return (
    <div className="admin-page-container">
      <div className="header-section">
        <div>
          <h1 className="page-title">My Mitra</h1>
          <p className="page-subtitle">
            Kelola kemitraan Institusi (B2B) dan Timeline Project Klien.
          </p>
        </div>
        <button
          className="btn-tambah"
          onClick={() =>
            activeTab === "institusi"
              ? handleAddOrEditInstitusi()
              : handleAddOrEditProject()
          }
        >
          <UserPlus size={18} /> Tambah{" "}
          {activeTab === "institusi" ? "Institusi" : "Project"}
        </button>
      </div>

      <div className="stats-card">
        <div className="stats-icon">
          <Briefcase size={28} />
        </div>
        <div className="stats-info">
          <p>
            Total{" "}
            {activeTab === "institusi"
              ? "Institusi Pendidikan"
              : "Kemitraan Project"}
          </p>
          <h3>
            {activeData.length} <span>Akun</span>
          </h3>
        </div>
      </div>

      <div className="content-box">
        {/* TABS SELECTOR */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "institusi" ? "active" : ""}`}
            onClick={() => setActiveTab("institusi")}
          >
            <GraduationCap size={18} /> Institusi Pendidikan (Free Access)
          </button>
          <button
            className={`tab-btn ${activeTab === "project" ? "active" : ""}`}
            onClick={() => setActiveTab("project")}
          >
            <FolderGit2 size={18} /> Kemitraan Project
          </button>
        </div>

        <div className="box-header">
          <div className="box-title">
            <ShieldCheck size={20} color="#ffd700" />
            <span>
              Daftar {activeTab === "institusi" ? "Institusi" : "Project"}
            </span>
          </div>
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cari email / nama mitra..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              {activeTab === "institusi" ? (
                <tr>
                  <th>EMAIL AKUN</th>
                  <th>NAMA INSTITUSI</th>
                  <th>TANGGAL BERAKHIR</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              ) : (
                <tr>
                  <th>NAMA CLIENT</th>
                  <th>EMAIL AKUN</th>
                  <th>PAKET PROJECT</th>
                  <th>TIMELINE</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : activeData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada data di kategori ini.
                  </td>
                </tr>
              ) : (
                activeData.map((mitra) => {
                  let isExpired = false;

                  if (activeTab === "institusi") {
                    isExpired = mitra.institusi_expired_at
                      ? new Date(mitra.institusi_expired_at) < new Date()
                      : false;
                    return (
                      <tr key={mitra.id}>
                        <td className="font-semibold text-white">
                          {mitra.email}
                        </td>
                        <td style={{ color: "#94a3b8" }}>
                          {mitra.nama_institut || "-"}
                        </td>
                        <td>
                          <div className="date-cell">
                            <CalendarClock size={16} />
                            {mitra.institusi_expired_at
                              ? new Date(
                                  mitra.institusi_expired_at,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </div>
                        </td>
                        <td>
                          {isExpired ? (
                            <span className="status-badge expired">
                              Kadaluarsa
                            </span>
                          ) : (
                            <span className="status-badge active">Aktif</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn-action edit"
                              title="Edit Data"
                              onClick={() => handleAddOrEditInstitusi(mitra)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-action delete"
                              title="Hapus"
                              onClick={() =>
                                handleRevoke(mitra.id, mitra.email, "institusi")
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    isExpired = mitra.project_end
                      ? new Date(mitra.project_end) < new Date()
                      : false;
                    return (
                      <tr key={mitra.id}>
                        <td className="font-semibold text-white">
                          {mitra.nama_client || "-"}
                        </td>
                        <td style={{ color: "#94a3b8" }}>{mitra.email}</td>
                        <td style={{ color: "#ffd700", fontWeight: "600" }}>
                          {mitra.nama_paket || "-"}
                        </td>
                        <td>
                          <div
                            className="date-cell"
                            style={{ fontSize: "12px" }}
                          >
                            <CalendarClock size={14} />
                            {mitra.project_start
                              ? new Date(
                                  mitra.project_start,
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "-"}
                            &nbsp;&rarr;&nbsp;
                            {mitra.project_end
                              ? new Date(mitra.project_end).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "-"}
                          </div>
                        </td>
                        <td>
                          {isExpired ? (
                            <span className="status-badge expired">
                              Selesai
                            </span>
                          ) : (
                            <span className="status-badge active">
                              Berjalan
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn-action edit"
                              title="Edit Data"
                              onClick={() => handleAddOrEditProject(mitra)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-action delete"
                              title="Hapus"
                              onClick={() =>
                                handleRevoke(mitra.id, mitra.email, "project")
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .admin-page-container {
          padding: 40px;
          color: white;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .page-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #fff;
        }
        .page-subtitle {
          color: #94a3b8;
          font-size: 15px;
          margin: 0;
        }

        .btn-tambah {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffd700;
          color: #0f172a;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-tambah:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }

        .stats-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          max-width: 400px;
        }
        .stats-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(255, 215, 0, 0.1);
          color: #ffd700;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .stats-info p {
          margin: 0 0 4px 0;
          font-size: 13px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stats-info h3 {
          margin: 0;
          font-size: 28px;
          color: #ffd700;
        }
        .stats-info span {
          font-size: 16px;
          color: #fff;
          font-weight: 500;
        }

        .content-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
        }

        /* TAB STYLE */
        .tabs-container {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .tab-btn {
          flex: 1;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: transparent;
          border: none;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
        }
        .tab-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.02);
        }
        .tab-btn.active {
          color: #ffd700;
          border-bottom: 2px solid #ffd700;
          background: rgba(255, 215, 0, 0.05);
        }

        .box-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .box-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 16px;
        }
        .search-bar {
          position: relative;
          width: 300px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }
        .search-bar input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 14px 10px 40px;
          border-radius: 10px;
          color: white;
          font-size: 14px;
          outline: none;
        }

        .table-container {
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th {
          background: rgba(0, 0, 0, 0.1);
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 16px 24px;
          text-align: left;
        }
        .admin-table td {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          color: #cbd5e1;
          font-size: 14px;
        }
        .date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-badge.active {
          background: rgba(74, 222, 128, 0.15);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.3);
        }
        .status-badge.expired {
          background: rgba(248, 113, 113, 0.15);
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .btn-action {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #94a3b8;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-action.edit:hover {
          background: rgba(255, 215, 0, 0.1);
          color: #ffd700;
          border-color: #ffd700;
        }
        .btn-action.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: #ef4444;
        }

        .text-center {
          text-align: center;
        }
        .py-8 {
          padding-top: 32px;
          padding-bottom: 32px;
        }
      `}</style>
    </div>
  );
}
