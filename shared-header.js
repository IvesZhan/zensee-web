(function () {
  var host = document.getElementById("shared-header");
  if (!host) {
    return;
  }

  var locale = normalizeLocale(host.getAttribute("data-header-locale") || document.documentElement.lang);
  var homeUrl = host.getAttribute("data-header-home-url") || "./";
  var supportUrl = host.getAttribute("data-header-support-url") || homeUrl;
  var iconSrc = host.getAttribute("data-header-icon-src") || "";
  var comingSoon = host.getAttribute("data-header-coming-soon") || "";
  var copy = localeCopy(locale);

  host.outerHTML = [
    '<nav class="nav">',
    '<div class="nav-inner">',
    '<div class="brand-lockup">',
    '<div class="brand-icon">',
    '<img src="' + escapeAttribute(iconSrc) + '" alt="' + escapeAttribute(copy.iconAlt) + '" />',
    "</div>",
    '<div class="brand-text">',
    "<strong>" + escapeHtml(copy.brand) + "</strong>",
    "<span>" + escapeHtml(copy.subtitle) + "</span>",
    "</div>",
    "</div>",
    '<div class="nav-links">',
    '<a href="' + escapeAttribute(link(homeUrl, "experience")) + '">' + escapeHtml(copy.experience) + "</a>",
    '<a href="' + escapeAttribute(link(homeUrl, "features")) + '">' + escapeHtml(copy.features) + "</a>",
    '<a href="' + escapeAttribute(link(homeUrl, "philosophy")) + '">' + escapeHtml(copy.philosophy) + "</a>",
    "</div>",
    '<a class="mobile-nav-link" data-download-button' +
      (comingSoon ? ' data-coming-soon="' + escapeAttribute(comingSoon) + '"' : "") +
      ' href="' + escapeAttribute(supportUrl) + '">' + escapeHtml(copy.download) + "</a>",
    "</div>",
    "</nav>"
  ].join("");

  function normalizeLocale(value) {
    var lang = String(value || "").toLowerCase();
    if (lang.indexOf("zh-hant") === 0) {
      return "zh-hant";
    }
    if (lang.indexOf("ja") === 0) {
      return "ja";
    }
    if (lang.indexOf("en") === 0) {
      return "en";
    }
    return "zh-cn";
  }

  function localeCopy(currentLocale) {
    var table = {
      "zh-cn": {
        brand: "禅·见",
        subtitle: "禅修记录与静心练习",
        experience: "体验",
        features: "功能",
        philosophy: "理念",
        download: "下载APP",
        iconAlt: "禅·见 App Icon"
      },
      "zh-hant": {
        brand: "禪·見",
        subtitle: "禪修記錄與靜心練習",
        experience: "體驗",
        features: "功能",
        philosophy: "理念",
        download: "下載APP",
        iconAlt: "禪·見 App Icon"
      },
      "ja": {
        brand: "禅·見",
        subtitle: "禅修の記録と静かな実践",
        experience: "体験",
        features: "機能",
        philosophy: "思想",
        download: "ダウンロード",
        iconAlt: "禅·見 App Icon"
      },
      "en": {
        brand: "ZenSee",
        subtitle: "Curating digital peace",
        experience: "Experience",
        features: "Features",
        philosophy: "Philosophy",
        download: "Download App",
        iconAlt: "ZenSee App Icon"
      }
    };

    return table[currentLocale] || table["zh-cn"];
  }

  function link(base, hash) {
    return String(base || "./").replace(/#.*$/, "") + "#" + hash;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
}());
