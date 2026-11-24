/*
    CODED BY Danoni631

    Full translations in Portuguese and English
*/

const TRANSLATIONS = {
  pt: {
    nav_home: "Início",
    nav_downloads: "Downloads",
    nav_wiki: "Wiki / Docs",
    nav_credits: "Sobre & Créditos",
    hero_badge: "Arquitetura x86_64 • Bare-Metal Kernel",
    hero_title: "Um sistema operacional feito do zero, direto no hardware.",
    hero_subtitle: "O Nikinix é um projeto colaborativo de sistema operacional 64-bit focado em controle total do hardware, framebuffer VESA de alta resolução e arquitetura modular limpa.",
    btn_download_now: "Baixar Nikinix OS",
    btn_read_docs: "Ler Documentação",
    arch_heading: "Pilares da Arquitetura",
    arch_subheading: "Projetado sem dependências ocultas, priorizando transparência e controle.",
    feat_1_title: "Modo Longo 64-bit",
    feat_1_desc: "Transição completa para Long Mode x86_64 com paginação de 4 níveis (PML4) e GDT configurada para espaço de endereçamento plano.",
    feat_2_title: "Framebuffer VESA Linear",
    feat_2_desc: "Renderização gráfica direta via LFB (Linear Framebuffer) com primitivas de desenho, fontes bitmap e composição de janelas sem aceleração externa.",
    feat_3_title: "Drivers & Interrupções",
    feat_3_desc: "Tabela IDT customizada, remapeamento do controlador PIC/APIC, timer PIT e suporte nativo a teclado e mouse PS/2.",
    feat_4_title: "Build Reproduzível",
    feat_4_desc: "Ambiente padronizado com GCC cross-compiler, NASM e Dev Containers prontos para gerar imagens ISO bootáveis em segundos.",
    dl_heading: "Central de Downloads",
    dl_subheading: "Obtenha as imagens compiladas, pacotes para virtualização ou o código-fonte completo.",
    vm_guide_title: "Execução Rápida em Máquina Virtual",
    vmware_note: "Crie uma VM \"Other 64-bit\", configure firmware BIOS/UEFI conforme a release e anexe a ISO no drive óptico virtual.",
    btn_dl_vmx: "Baixar Perfil .VMX",
    btn_copy: "Copiar",
    btn_copied: "Copiado!",
    btn_github_dl: "Baixar no GitHub",
    btn_gen_script: "Gerar Arquivo Auxiliar",
    wiki_search_ph: "Buscar na documentação...",
    cred_heading: "Desenvolvedores & Repositório",
    cred_subheading: "Construído de forma colaborativa com foco em engenharia de baixo nível.",
    role_creator: "Criador & Arquiteto Principal",
    bio_nicolas: "Idealizador do repositório Nikinix, responsável pela estrutura base do kernel x86_64, ambiente de build e arquitetura central.",
    role_contrib: "Co-desenvolvedor & Contribuidor",
    bio_danoni: "Desenvolvimento da interface gráfica VESA framebuffer, testes em ambientes bare-metal/VMware, ferramentas de distribuição e documentação.",
    repo_banner_desc: "Acompanhe commits, abra issues, envie pull requests ou explore o código-fonte diretamente no GitHub.",
    btn_open_repo: "Abrir Repositório"
  },
  en: {
    nav_home: "Home",
    nav_downloads: "Downloads",
    nav_wiki: "Wiki / Docs",
    nav_credits: "About & Credits",
    hero_badge: "x86_64 Architecture • Bare-Metal Kernel",
    hero_title: "An operating system built from scratch, straight on bare metal.",
    hero_subtitle: "Nikinix is a collaborative 64-bit operating system focused on direct hardware control, high-resolution VESA framebuffer graphics, and a clean modular design.",
    btn_download_now: "Download Nikinix OS",
    btn_read_docs: "Read Documentation",
    arch_heading: "Architecture Pillars",
    arch_subheading: "Engineered with zero hidden dependencies, prioritizing transparency and control.",
    feat_1_title: "64-bit Long Mode",
    feat_1_desc: "Full transition into x86_64 Long Mode with 4-level paging (PML4) and a flat memory model GDT setup.",
    feat_2_title: "VESA Linear Framebuffer",
    feat_2_desc: "Direct graphical rendering via LFB with drawing primitives, bitmap fonts, and window composition without external acceleration.",
    feat_3_title: "Drivers & Interrupts",
    feat_3_desc: "Custom IDT table, PIC/APIC controller remapping, PIT timer, and native PS/2 keyboard and mouse support.",
    feat_4_title: "Reproducible Build",
    feat_4_desc: "Standardized toolchain with GCC cross-compiler, NASM, and Dev Containers ready to produce bootable ISOs in seconds.",
    dl_heading: "Download Center",
    dl_subheading: "Get compiled bootable images, virtualization bundles, or the complete source code.",
    vm_guide_title: "Quick Virtual Machine Setup",
    vmware_note: "Create an \"Other 64-bit\" VM, configure BIOS/UEFI firmware according to the release, and attach the ISO to the optical drive.",
    btn_dl_vmx: "Download .VMX Profile",
    btn_copy: "Copy",
    btn_copied: "Copied!",
    btn_github_dl: "Get on GitHub",
    btn_gen_script: "Generate Helper File",
    wiki_search_ph: "Search documentation...",
    cred_heading: "Developers & Repository",
    cred_subheading: "Built collaboratively with a focus on low-level systems engineering.",
    role_creator: "Creator & Lead Architect",
    bio_nicolas: "Founder of the Nikinix repository, responsible for the core x86_64 kernel structure, build toolchain, and central architecture.",
    role_contrib: "Co-developer & Contributor",
    bio_danoni: "Development of the VESA framebuffer graphical UI, bare-metal/VMware testing, distribution tooling, and technical documentation.",
    repo_banner_desc: "Follow commits, open issues, submit pull requests, or inspect the source code directly on GitHub.",
    btn_open_repo: "Open Repository"
  }
};

window.currentLang = localStorage.getItem("nikinix_lang") || "pt";

function t(key) {
  return (TRANSLATIONS[window.currentLang] && TRANSLATIONS[window.currentLang][key]) || key;
}

function applyTranslations(lang) {
  window.currentLang = lang;
  localStorage.setItem("nikinix_lang", lang);
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (TRANSLATIONS[lang][key]) {
      el.textContent = TRANSLATIONS[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (TRANSLATIONS[lang][key]) {
      el.placeholder = TRANSLATIONS[lang][key];
    }
  });

  if (typeof window.renderDynamicXMLContent === "function") {
    window.renderDynamicXMLContent();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("langSelector");
  if (selector) {
    selector.value = window.currentLang;
    selector.addEventListener("change", (e) => applyTranslations(e.target.value));
  }
  applyTranslations(window.currentLang);
});