let xmlDocCache = null;
let activeWikiId = "overview";

let vfsFiles = ["init", "test.txt"];
let vfsFolders = {};
let currentVfsDir = "/";
let shellHostname = "nikinix";

const FALLBACK_XML_STRING = `<?xml version="1.0" encoding="UTF-8"?>
<nikinix_portal>
  <downloads>
    <release id="iso-latest">
      <tag>ISO BOOTÁVEL</tag>
      <tag_en>BOOTABLE ISO</tag_en>
      <size>~14.2 MB</size>
      <title_pt>Nikinix OS x86_64 — Live ISO</title_pt>
      <title_en>Nikinix OS x86_64 — Live ISO</title_en>
      <desc_pt>Imagem ISO inicializável com bootloader configurado, kernel 64-bit e interface de teste em framebuffer VESA.</desc_pt>
      <desc_en>Bootable ISO image with configured bootloader, 64-bit kernel, and VESA framebuffer test UI.</desc_en>
      <sha256>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</sha256>
      <github_url>https://github.com/nicolasbickhoff11/Nikinix/releases</github_url>
      <manifest_file>nikinix-iso-manifest.txt</manifest_file>
    </release>
    <release id="vm-bundle">
      <tag>QEMU / VMWARE</tag>
      <tag_en>QEMU / VMWARE</tag_en>
      <size>~16.0 MB</size>
      <title_pt>Pacote de Virtualização &amp; Scripts</title_pt>
      <title_en>Virtualization &amp; Scripts Bundle</title_en>
      <desc_pt>Configuração pronta para VMware Workstation (.vmx) e script de inicialização automatizado para QEMU x86_64.</desc_pt>
      <desc_en>Ready-to-run VMware Workstation (.vmx) profile and automated launch script for QEMU x86_64.</desc_en>
      <sha256>8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4</sha256>
      <github_url>https://github.com/nicolasbickhoff11/Nikinix</github_url>
      <manifest_file>run-nikinix-qemu.bat</manifest_file>
    </release>
    <release id="source-code">
      <tag>SOURCE CODE</tag>
      <tag_en>SOURCE CODE</tag_en>
      <size>Git Main</size>
      <title_pt>Código-Fonte Completo (.ZIP / Git)</title_pt>
      <title_en>Full Source Code (.ZIP / Git)</title_en>
      <desc_pt>Repositório completo em C e Assembly x86_64, scripts de compilação, Makefile e suporte a VS Code Dev Containers.</desc_pt>
      <desc_en>Complete C and x86_64 Assembly repository, build scripts, Makefile, and VS Code Dev Containers support.</desc_en>
      <sha256>2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae</sha256>
      <github_url>https://github.com/nicolasbickhoff11/Nikinix/archive/refs/heads/main.zip</github_url>
      <manifest_file>build-instructions.txt</manifest_file>
    </release>
  </downloads>
  <wiki>
    <article id="overview">
      <category>CORE</category>
      <title_pt>1. Visão Geral &amp; Arquitetura</title_pt>
      <title_en>1. Overview &amp; Architecture</title_en>
      <body_pt><![CDATA[<p>O <strong>Nikinix</strong> é um sistema operacional hobbyista de código aberto desenvolvido para a arquitetura <strong>x86_64</strong> por <code>nicolasbickhoff11</code> e <code>Danoni631</code>.</p><p>O objetivo principal do projeto é explorar o funcionamento real do hardware sem camadas pesadas de abstração, implementando gerenciamento de memória, interrupções e saída gráfica diretamente sobre o processador.</p><ul><li><strong>Arquitetura Alvo:</strong> AMD64 / Intel 64 (x86_64 Long Mode).</li><li><strong>Linguagens Base:</strong> C (freestanding, sem libc externa) e Assembly x86_64 (NASM).</li><li><strong>Saída de Vídeo:</strong> Framebuffer Linear VESA (LFB) 32-bit RGBA.</li><li><strong>Depuração:</strong> Saída serial COM1 (0x3F8) integrada ao log do QEMU.</li></ul>]]></body_pt>
      <body_en><![CDATA[<p><strong>Nikinix</strong> is an open-source hobbyist operating system built for the <strong>x86_64</strong> architecture by <code>nicolasbickhoff11</code> and <code>Danoni631</code>.</p><p>The project focuses on exploring bare-metal hardware behavior without heavy abstraction layers, implementing memory management, interrupts, and graphical output directly on the CPU.</p><ul><li><strong>Target Architecture:</strong> AMD64 / Intel 64 (x86_64 Long Mode).</li><li><strong>Core Languages:</strong> Freestanding C (no external libc) and x86_64 Assembly (NASM).</li><li><strong>Video Output:</strong> VESA Linear Framebuffer (LFB) 32-bit RGBA.</li><li><strong>Debugging:</strong> COM1 (0x3F8) serial output integrated with QEMU logs.</li></ul>]]></body_en>
      <code><![CDATA[; small changes by Danoni631
[bits 64]

[global _start]
[extern entry]

_start:
    xor rax, rax
    mov rdi, 1
    mov rsi, buf
    mov rdx, size

    ;int 0x80
    syscall

    call entry

buf: db "No SIGSEGV so far, I hate SIGSEGVs and I love Nikinix", 10
size: equ $ - buf
]]></code>
    </article>
  </wiki>
</nikinix_portal>`;

async function loadPortalXML() {
  const parser = new DOMParser();
  try {
    const response = await fetch("wiki_data.xml");
    if (!response.ok) throw new Error("HTTP error");
    const xmlText = await response.text();
    xmlDocCache = parser.parseFromString(xmlText, "application/xml");
  } catch (err) {
    xmlDocCache = parser.parseFromString(FALLBACK_XML_STRING, "application/xml");
  }
  window.renderDynamicXMLContent();
}

function getTagText(parent, tagName) {
  const el = parent.querySelector(tagName);
  return el ? el.textContent.trim() : "";
}

window.renderDynamicXMLContent = function () {
  if (!xmlDocCache) return;
  renderDownloadsFromXML();
  renderWikiSidebarAndArticle();
};

function renderDownloadsFromXML() {
  const container = document.getElementById("downloadsContainer");
  if (!container) return;

  const lang = window.currentLang || "pt";
  const releases = xmlDocCache.querySelectorAll("downloads > release");
  container.innerHTML = "";

  releases.forEach((rel) => {
    const id = rel.getAttribute("id");
    const tag = lang === "pt" ? getTagText(rel, "tag") : getTagText(rel, "tag_en");
    const size = getTagText(rel, "size");
    const title = lang === "pt" ? getTagText(rel, "title_pt") : getTagText(rel, "title_en");
    const desc = lang === "pt" ? getTagText(rel, "desc_pt") : getTagText(rel, "desc_en");
    const sha = getTagText(rel, "sha256");
    const ghUrl = getTagText(rel, "github_url");
    const manifest = getTagText(rel, "manifest_file");

    const card = document.createElement("div");
    card.className = "dl-card";
    card.innerHTML = `
      <div class="dl-header">
        <span class="dl-tag">${tag}</span>
        <span class="dl-size">${size}</span>
      </div>
      <h3>${title}</h3>
      <p>${desc}</p>
      <div class="sha-box"><strong>SHA-256:</strong> ${sha}</div>
      <div class="dl-actions">
        <a href="${ghUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">${t("btn_github_dl")}</a>
        <button class="btn-outline" data-manifest="${id}" data-filename="${manifest}">${t("btn_gen_script")}</button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-manifest]").forEach((btn) => {
    btn.addEventListener("click", () => {
      generateHelperFile(btn.getAttribute("data-manifest"), btn.getAttribute("data-filename"));
    });
  });
}

function renderWikiSidebarAndArticle(filterQuery = "") {
  const navList = document.getElementById("wikiNavList");
  const contentArea = document.getElementById("wikiContentArea");
  if (!navList || !contentArea || !xmlDocCache) return;

  const lang = window.currentLang || "pt";
  const articles = Array.from(xmlDocCache.querySelectorAll("wiki > article"));
  const query = filterQuery.toLowerCase();

  navList.innerHTML = "";
  const filtered = articles.filter((art) => {
    const title = (lang === "pt" ? getTagText(art, "title_pt") : getTagText(art, "title_en")).toLowerCase();
    const body = (lang === "pt" ? getTagText(art, "body_pt") : getTagText(art, "body_en")).toLowerCase();
    return title.includes(query) || body.includes(query);
  });

  if (filtered.length === 0) {
    navList.innerHTML = `<span style="color:var(--text-secondary);font-size:0.85rem;">Nenhum tópico encontrado.</span>`;
    return;
  }

  if (!filtered.some((a) => a.getAttribute("id") === activeWikiId)) {
    activeWikiId = filtered[0].getAttribute("id");
  }

  filtered.forEach((art) => {
    const id = art.getAttribute("id");
    const title = lang === "pt" ? getTagText(art, "title_pt") : getTagText(art, "title_en");
    const btn = document.createElement("button");
    btn.className = `wiki-topic-btn ${id === activeWikiId ? "active" : ""}`;
    btn.textContent = title;
    btn.addEventListener("click", () => {
      activeWikiId = id;
      renderWikiSidebarAndArticle(document.getElementById("wikiSearch").value);
    });
    navList.appendChild(btn);
  });

  const currentArt = filtered.find((a) => a.getAttribute("id") === activeWikiId) || filtered[0];
  const category = getTagText(currentArt, "category");
  const title = lang === "pt" ? getTagText(currentArt, "title_pt") : getTagText(currentArt, "title_en");
  const bodyHtml = lang === "pt" ? getTagText(currentArt, "body_pt") : getTagText(currentArt, "body_en");
  const codeText = getTagText(currentArt, "code");

  contentArea.innerHTML = `
    <span class="wiki-meta">NIKINIX WIKI // ${category}</span>
    <h2>${title}</h2>
    <div>${bodyHtml}</div>
    ${
      codeText
        ? `<div class="code-wrapper">
             <button class="copy-btn" id="wikiCopyBtn">${t("btn_copy")}</button>
             <pre><code>${escapeHtml(codeText)}</code></pre>
           </div>`
        : ""
    }
  `;

  const copyBtn = document.getElementById("wikiCopyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => copyToClipboard(codeText, copyBtn));
  }
}

function replayCaptureVideo() {
  const video = document.getElementById("systemCaptureVideo");
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }
  setShellOutput("[VIDEO] Replaying video_1.mp4 from 00:00...", "term-ok");
}

function updatePromptLabel() {
  const promptEl = document.getElementById("shellPromptLabel");
  if (!promptEl) return;
  const pathPart = currentVfsDir === "/" ? "~" : currentVfsDir.replace(/\/$/, "");
  promptEl.textContent = `root@${shellHostname}:${pathPart}#`;
}

function setShellOutput(text, className = "") {
  const out = document.getElementById("terminalOutput");
  if (!out) return;
  out.className = `shell-feedback-bar ${className}`;
  out.textContent = text;
}

function handleTerminalCommand(rawCmd) {
  const trimmed = rawCmd.trim();
  if (!trimmed) return;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts[1] || "";

  switch (cmd) {
    case "help":
      setShellOutput("Commands: help, uname, ls, create <file>, mkdir <dir>, cd <dir>, sethostname <name>, replay, clear");
      break;
    case "uname":
      setShellOutput("Nikinix v1.0.0 No ICBEEG so far v6.0.0 x86_64", "term-ok");
      break;
    case "ls": {
      const items = currentVfsDir === "/"
        ? [...vfsFiles, ...Object.keys(vfsFolders)]
        : (vfsFolders[currentVfsDir] || []);
      setShellOutput(items.length ? items.join("  ") : "(empty)");
      break;
    }
    case "create":
      if (!arg) {
        setShellOutput("usage: create <filename>", "term-warn");
      } else if (currentVfsDir === "/") {
        if (!vfsFiles.includes(arg)) vfsFiles.push(arg);
        setShellOutput(`Created ${arg}`, "term-ok");
      } else {
        vfsFolders[currentVfsDir] = vfsFolders[currentVfsDir] || [];
        if (!vfsFolders[currentVfsDir].includes(arg)) vfsFolders[currentVfsDir].push(arg);
        setShellOutput(`Created ${arg} in ${currentVfsDir}`, "term-ok");
      }
      break;
    case "mkdir":
      if (!arg) {
        setShellOutput("usage: mkdir <folder>", "term-warn");
      } else {
        const key = currentVfsDir === "/" ? arg : `${currentVfsDir}/${arg}`;
        if (!vfsFolders[key]) vfsFolders[key] = [];
        setShellOutput(`Directory created: ${arg}`, "term-ok");
      }
      break;
    case "cd":
      if (!arg || arg === "/" || arg === "~") {
        currentVfsDir = "/";
        updatePromptLabel();
        setShellOutput("Changed directory to /");
      } else if (arg === "..") {
        currentVfsDir = "/";
        updatePromptLabel();
        setShellOutput("Changed directory to /");
      } else {
        const target = currentVfsDir === "/" ? arg : `${currentVfsDir}/${arg}`;
        if (vfsFolders[target] || Object.keys(vfsFolders).includes(arg)) {
          currentVfsDir = target;
          updatePromptLabel();
          setShellOutput(`Entered ${currentVfsDir}`);
        } else {
          setShellOutput(`cd: ${arg}: No such directory`, "term-warn");
        }
      }
      break;
    case "sethostname":
      if (!arg) {
        setShellOutput("usage: sethostname <hostname>", "term-warn");
      } else {
        shellHostname = arg;
        updatePromptLabel();
        setShellOutput("Hostname updated", "term-ok");
      }
      break;
    case "replay":
      replayCaptureVideo();
      break;
    case "clear":
      setShellOutput("");
      break;
    default:
      setShellOutput(`nikinix: command not found: ${cmd}`, "term-warn");
  }
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateHelperFile(type, filename) {
  if (type === "vm-bundle") {
    const batContent = `@echo off\r\necho Starting Nikinix OS x86_64 in QEMU...\r\nqemu-system-x86_64 -cdrom nikinix-x86_64.iso -m 512M -vga std -serial stdio\r\npause\r\n`;
    downloadTextFile(filename, batContent);
  } else if (type === "iso-latest") {
    const manifest = `NIKINIX OS RELEASE MANIFEST\nRepository: https://github.com/nicolasbickhoff11/Nikinix\nDevelopers: nicolasbickhoff11 & Danoni631\nArchitecture: x86_64\nVideo: VESA Linear Framebuffer (32-bit)\n`;
    downloadTextFile(filename, manifest);
  } else {
    const buildTxt = `NIKINIX OS BUILD GUIDE\n1. git clone https://github.com/nicolasbickhoff11/Nikinix.git\n2. cd Nikinix\n3. make clean && make iso\n4. qemu-system-x86_64 -cdrom nikinix.iso -m 512M -vga std\n`;
    downloadTextFile(filename, buildTxt);
  }
}

function copyToClipboard(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btnElement.textContent;
    btnElement.textContent = t("btn_copied");
    setTimeout(() => {
      btnElement.textContent = original;
    }, 1600);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.addEventListener("DOMContentLoaded", () => {
  function switchSection(sectionId) {
    document.querySelectorAll(".page-section").forEach((sec) => sec.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));

    const targetSec = document.getElementById(`section-${sectionId}`);
    if (targetSec) targetSec.classList.add("active");

    document.querySelectorAll(`.nav-btn[data-section="${sectionId}"]`).forEach((btn) => {
      btn.classList.add("active");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-section]").forEach((el) => {
    el.addEventListener("click", () => switchSection(el.getAttribute("data-section")));
  });

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const savedTheme = localStorage.getItem("nikinix_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeIcon.textContent = savedTheme === "dark" ? "☀️" : "🌙";

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("nikinix_theme", next);
    themeIcon.textContent = next === "dark" ? "☀️" : "🌙";
  });

  updatePromptLabel();
  document.getElementById("rebootTermBtn").addEventListener("click", replayCaptureVideo);
  document.getElementById("terminalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("terminalInput");
    handleTerminalCommand(input.value);
    input.value = "";
  });

  const wikiSearch = document.getElementById("wikiSearch");
  if (wikiSearch) {
    wikiSearch.addEventListener("input", (e) => {
      renderWikiSidebarAndArticle(e.target.value);
    });
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copyToClipboard(btn.getAttribute("data-copy"), btn));
  });

  const vmxBtn = document.getElementById("downloadVmxBtn");
  if (vmxBtn) {
    vmxBtn.addEventListener("click", () => {
      const vmxConfig = `.encoding = "UTF-8"\nconfig.version = "8"\nvirtualHW.version = "17"\ndisplayName = "Nikinix OS x86_64"\nguestOS = "other-64"\nmemsize = "512"\nsvga.vramSize = "33554432"\nide1:0.present = "TRUE"\nide1:0.fileName = "nikinix-x86_64.iso"\nide1:0.deviceType = "cdrom-image"\nserial0.present = "TRUE"\nserial0.fileType = "file"\nserial0.fileName = "nikinix-serial.log"\n`;
      downloadTextFile("Nikinix-x86_64.vmx", vmxConfig);
    });
  }

  loadPortalXML();
});