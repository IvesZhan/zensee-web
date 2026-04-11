(function () {
  var config = window.ZENSEE_GROUP_PAGE_CONFIG || {};
  var locale = detectLocale();
  var copy = localeCopy(locale);
  var state = {
    groupId: parseGroupId(),
    snapshot: null,
    members: [],
    mode: "join"
  };

  var elements = {
    status: document.getElementById("page-status"),
    title: document.getElementById("group-name"),
    description: document.getElementById("group-description"),
    ownerLine: document.getElementById("group-owner-line"),
    membersSection: document.getElementById("members-section"),
    memberList: document.getElementById("member-list"),
    errorState: document.getElementById("error-state"),
    errorTitle: document.getElementById("error-title"),
    errorBody: document.getElementById("error-body"),
    contentState: document.getElementById("content-state")
  };

  setLoadingState();

  if (!state.groupId) {
    renderError(copy.invalidGroup);
    return;
  }

  scheduleInitialOpenAttempt();
  loadGroup();

  function detectLocale() {
    var lang = String(document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (lang.indexOf("ja") === 0) {
      return "ja";
    }
    if (lang.indexOf("zh-hant") === 0) {
      return "zh-hant";
    }
    if (lang.indexOf("en") === 0) {
      return "en";
    }
    return "zh-cn";
  }

  function localeCopy(currentLocale) {
    var table = {
      "zh-cn": {
        loading: "正在载入群组详情…",
        invalidGroup: "群组链接无效或群组已不存在。",
        loadFailed: "暂时无法加载群组详情，请稍后再试。",
        unknownOwner: "禅友",
        defaultDescription: "坚持打卡，共见成长",
        noMembers: "暂时还没有可展示的成员。",
        publicBadge: "公开群组",
        ownerRole: "群主",
        memberRole: "成员",
        brand: "禅·见",
        pageTitle: "禅·见 | 群组邀请",
        groupSuffix: "群组详情",
        ownerLine: "群主：%@"
      },
      "zh-hant": {
        loading: "正在載入群組詳情…",
        invalidGroup: "群組連結無效或群組已不存在。",
        loadFailed: "暫時無法載入群組詳情，請稍後再試。",
        unknownOwner: "禪友",
        defaultDescription: "堅持打卡，共見成長",
        noMembers: "暫時還沒有可展示的成員。",
        publicBadge: "公開群組",
        ownerRole: "群主",
        memberRole: "成員",
        brand: "禪·見",
        pageTitle: "禪·見 | 群組邀請",
        groupSuffix: "群組詳情",
        ownerLine: "群主：%@"
      },
      "ja": {
        loading: "グループ詳細を読み込み中…",
        invalidGroup: "グループリンクが無効か、グループが存在しません。",
        loadFailed: "現在グループ詳細を読み込めません。しばらくしてからお試しください。",
        unknownOwner: "禅友",
        defaultDescription: "毎日続けて、ともに成長していきましょう。",
        noMembers: "表示できるメンバーがまだいません。",
        publicBadge: "公開グループ",
        ownerRole: "グループ主",
        memberRole: "メンバー",
        brand: "禅·見",
        pageTitle: "禅·見 | グループ招待",
        groupSuffix: "グループ詳細",
        ownerLine: "グループ主：%@"
      },
      "en": {
        loading: "Loading group details…",
        invalidGroup: "This group link is invalid or no longer available.",
        loadFailed: "Group details are unavailable right now. Please try again later.",
        unknownOwner: "Zen Friend",
        defaultDescription: "Keep showing up and grow together.",
        noMembers: "No members are available to display yet.",
        publicBadge: "Public Group",
        ownerRole: "Owner",
        memberRole: "Member",
        brand: "ZenSee",
        pageTitle: "ZenSee | Group Invitation",
        groupSuffix: "Group Details",
        ownerLine: "Owner: %@"
      }
    };

    return table[currentLocale] || table["zh-cn"];
  }

  function parseGroupId() {
    var params = new URLSearchParams(window.location.search);
    var raw = String(params.get("id") || "").trim();
    return /^[0-9a-fA-F-]{36}$/.test(raw) ? raw.toLowerCase() : "";
  }

  function currentDateKey() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var day = String(now.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function rpc(functionName, payload) {
    return fetch(
      String(config.supabaseUrl || "").replace(/\/+$/, "") + "/rest/v1/rpc/" + functionName,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.supabaseAnonKey || "",
          Authorization: "Bearer " + (config.supabaseAnonKey || "")
        },
        body: JSON.stringify(payload)
      }
    ).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (data) {
        if (!response.ok) {
          throw new Error(data.message || copy.loadFailed);
        }
        return data;
      });
    });
  }

  function loadGroup() {
    var payload = {
      target_group_id: state.groupId,
      target_session_date: currentDateKey()
    };

    Promise.all([
      rpc("get_group_public_snapshot", payload),
      rpc("get_group_public_members", payload)
    ]).then(function (responses) {
      var snapshots = responses[0] || [];
      var members = responses[1] || [];
      if (!snapshots.length) {
        renderError(copy.invalidGroup);
        return;
      }

      state.snapshot = snapshots[0];
      state.members = members;
      renderGroup();
    }).catch(function (error) {
      console.error("[group-page] failed to render group", error);
      renderError(copy.loadFailed);
    });
  }

  function setLoadingState() {
    document.title = copy.pageTitle;
    if (elements.status) {
      elements.status.textContent = copy.loading;
    }
    if (elements.title) {
      elements.title.textContent = copy.loading;
    }
  }

  function renderGroup() {
    var snapshot = state.snapshot;

    document.title = snapshot.name + " · " + copy.brand;

    elements.status.textContent = copy.publicBadge;
    elements.title.textContent = snapshot.name;
    elements.description.textContent = trimmed(snapshot.description) || copy.defaultDescription;
    if (elements.ownerLine) {
      elements.ownerLine.textContent = format(copy.ownerLine, snapshot.owner_name || copy.unknownOwner);
    }
    elements.contentState.hidden = false;
    elements.membersSection.hidden = false;
    elements.errorState.hidden = true;
    state.mode = "join";
    renderMemberList(elements.memberList, state.members);
  }

  function renderMemberList(list, members) {
    if (!list) {
      return;
    }

    if (!members.length) {
      list.innerHTML = '<p class="member-empty">' + escapeHtml(copy.noMembers) + "</p>";
      return;
    }

    list.innerHTML = members.map(function (member) {
      var role = member.role === "owner" ? copy.ownerRole : copy.memberRole;

      return [
        '<article class="member-card">',
        '<div class="member-avatar">' + escapeHtml(initials(member.nickname)) + "</div>",
        '<div class="member-copy">',
        '<strong>' + escapeHtml(member.nickname || copy.unknownOwner) + "</strong>",
        '<span class="member-role">' + escapeHtml(role) + "</span>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderError(message) {
    document.title = copy.pageTitle;
    if (elements.contentState) {
      elements.contentState.hidden = true;
    }
    if (elements.membersSection) {
      elements.membersSection.hidden = true;
    }
    if (elements.errorState) {
      elements.errorState.hidden = false;
    }
    state.mode = "join";
    if (elements.errorTitle) {
      elements.errorTitle.textContent = copy.groupSuffix;
    }
    if (elements.errorBody) {
      elements.errorBody.textContent = message;
    }
  }

  function isAndroidDevice() {
    return /android/i.test(navigator.userAgent || "");
  }

  function universalGroupLink(groupId) {
    var universalLinkBase = String(config.appUniversalLinkBase || "https://iveszhan.github.io/zensee/").replace(/\?+$/, "");
    return universalLinkBase + "?target=group-join&id=" + encodeURIComponent(groupId);
  }

  function customSchemeGroupLink(groupId) {
    return "zensee://group/join?id=" + encodeURIComponent(groupId);
  }

  function androidIntentGroupLink(groupId) {
    var fallbackURL = String(config.downloadPageURL || "https://iveszhan.github.io/zensee-web/download/");
    return "intent://group/join?id=" + encodeURIComponent(groupId) +
      "#Intent;scheme=zensee;package=com.yuzhan.zenseeapp;S.browser_fallback_url=" +
      encodeURIComponent(fallbackURL) + ";end";
  }

  function scheduleInitialOpenAttempt() {
    if (!state.groupId || !isAndroidDevice()) {
      return;
    }

    try {
      var sessionKey = "zensee-group-auto-open:" + state.groupId;
      if (window.sessionStorage && window.sessionStorage.getItem(sessionKey) === "1") {
        return;
      }
      if (window.sessionStorage) {
        window.sessionStorage.setItem(sessionKey, "1");
      }
    } catch (error) {
      console.warn("[group-page] failed to persist android auto-open state", error);
    }

    window.setTimeout(function () {
      if (!document.hidden) {
        openApp(state.groupId, { useCustomScheme: true });
      }
    }, 140);
  }

  function openApp(groupId, options) {
    var useCustomScheme = Boolean(options && options.useCustomScheme);
    var deepLink = useCustomScheme
      ? customSchemeGroupLink(groupId)
      : (isAndroidDevice() ? androidIntentGroupLink(groupId) : universalGroupLink(groupId));
    var didHide = false;
    var visibilityHandler = function () {
      didHide = document.hidden;
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    window.location.href = deepLink;

    window.setTimeout(function () {
      document.removeEventListener("visibilitychange", visibilityHandler);
    }, 900);
  }

  function trimmed(value) {
    return String(value || "").replace(/^\s+|\s+$/g, "");
  }

  function initials(value) {
    var text = trimmed(value);
    return text ? text.slice(0, 1).toUpperCase() : "Z";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function format(template, value) {
    return String(template || "").replace("%@", String(value || ""));
  }
}());
