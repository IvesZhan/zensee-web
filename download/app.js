(function () {
  var links = window.ZENSEE_DOWNLOAD_LINKS || {};
  var placeholderPattern = /YOUR_APP_ID|YOUR_PACKAGE_NAME/;

  function isConfigured(url) {
    return typeof url === "string" && /^https?:\/\//.test(url) && !placeholderPattern.test(url);
  }

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    var isAndroid = /Android/i.test(ua);
    var isIOS = /iPhone|iPad|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
      return "ios";
    }
    if (isAndroid) {
      return "android";
    }
    return "fallback";
  }

  var buttons = document.querySelectorAll("[data-download-button]");
  var primary = buttons.length > 0 ? buttons[0] : null;
  var pageFallback = primary ? primary.getAttribute("href") : "";
  var fallback = isConfigured(links.fallback) ? links.fallback :
    (isConfigured(pageFallback) ? pageFallback : "https://iveszhan.github.io/zensee-legal/support/");
  var iosLink = isConfigured(links.ios) ? links.ios : fallback;
  var androidLink = isConfigured(links.android) ? links.android : fallback;
  var platform = detectPlatform();
  var resolved = platform === "ios" ? iosLink : (platform === "android" ? androidLink : fallback);

  for (var i = 0; i < buttons.length; i += 1) {
    buttons[i].href = resolved;
  }
}());
