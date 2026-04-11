"use client";
import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Link from "next/link";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("2D Assets");
  const [image, setImage] = useState(""); // Link gambar preview

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Masukkan data ke koleksi "products"
      await addDoc(collection(db, "products"), {
        nama: name,
        harga: Number(price),
        kategori: category,
        gambar: image,
        isUnlimited: true,
        createdAt: new Date(),
      });
      alert("Aset Berhasil Masuk ke Gudang Cloud!");
      setName("");
      setPrice("");
      setImage("");
    } catch (error: any) {
      alert("Waduh, gagal simpan: " + error.message);
    }
  };

  return (
    <div
      style={{
        padding: "50px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ color: "#ffd700", marginBottom: "20px" }}>
        Admin: Tambah Aset Nusantara
      </h1>
      <form
        onSubmit={handleUpload}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "400px",
        }}
      >
        <input
          type="text"
          placeholder="Nama Aset (Contoh: Pixel Art Wayang)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", color: "black" }}
          required
        />
        <input
          type="number"
          placeholder="Harga (Rp)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", color: "black" }}
          required
        />
        <input
          type="text"
          placeholder="Link Gambar Preview (URL)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", color: "black" }}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "12px", borderRadius: "8px", color: "black" }}
        >
          <option value="2D Assets">2D Assets</option>
          <option value="3D Models">3D Models</option>
          <option value="Audio">Audio Tradisional</option>
        </select>
        <button
          type="submit"
          style={{
            background: "#ffd700",
            color: "black",
            padding: "15px",
            fontWeight: "bold",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Simpan ke Cloud Firestore
        </button>
      </form>
      <br />
      <Link href="/" style={{ color: "#64748b" }}>
        ← Balik ke Web Utama
      </Link>
    </div>
  );
}
