"use client";
import React from "react";

export default function BioLink() {
  const links = [
    {
      name: "Website Utama",
      url: "https://nusantaraassets.vercel.app/",
      icon: "/img/logo.png",
    },
    {
      name: "Discord Community",
      url: "https://discord.gg/HJv32AP7",
      icon: "/img/discord.png",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/nusantaraassets5",
      icon: "/img/ig.png",
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@nusantaraassets5",
      icon: "/img/tiktok.png",
    },
    {
      name: "Hubungi WhatsApp",
      url: "https://wa.me/6285795381482",
      icon: "/img/whatsapp.png",
    },
  ];

  return (
    <main className="biolink-container">
      {/* Header Profil */}
      <section className="profile-section">
        <img
          src="/img/logo.png"
          alt="Nusantara Assets Logo"
          className="profile-img"
        />
        <h1 className="profile-name">
          Nusantara<span>Assets</span>
        </h1>
        <p className="profile-tag">Cultural Heritage in Every Pixel</p>
      </section>

      {/* List Links */}
      <div className="links-stack">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card"
          >
            <img src={link.icon} alt="" className="link-icon" />
            <span>{link.name}</span>
          </a>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">• © 2026 NusantaraAssets •</footer>
    </main>
  );
}
