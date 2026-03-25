(function () {
  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeRoot(value) {
    return String(value || "").replace(/^\/+|\/+$/g, "");
  }

  function detectLocale() {
    var langs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ""];

    for (var i = 0; i < langs.length; i += 1) {
      var lang = String(langs[i] || "").toLowerCase();

      if (!lang) {
        continue;
      }

      if (lang.indexOf("ja") === 0) {
        return "ja";
      }

      if (
        lang.indexOf("zh-hant") === 0 ||
        lang.indexOf("zh-tw") === 0 ||
        lang.indexOf("zh-hk") === 0 ||
        lang.indexOf("zh-mo") === 0
      ) {
        return "zh-hant";
      }

      if (lang.indexOf("zh") === 0) {
        return "zh-cn";
      }
    }

    return "en";
  }

  var root = normalizeRoot(document.documentElement.getAttribute("data-locale-root"));

  if (!root) {
    return;
  }

  var path = window.location.pathname
    .replace(/index\.html$/i, "")
    .replace(/\/+$/, "/");
  var rootPattern = new RegExp("/" + escapeRegExp(root) + "/$");

  if (!rootPattern.test(path)) {
    return;
  }

  if (/(^|[?&])lang=/.test(window.location.search)) {
    return;
  }

  var locale = detectLocale();
  var target = path;

  if (locale === "zh-hant") {
    target = path + "zh-hant/";
  } else if (locale === "ja") {
    target = path + "ja/";
  } else if (locale === "en") {
    target = path + "en/";
  }

  if (target !== path) {
    window.location.replace(target + window.location.search + window.location.hash);
  }
}());
