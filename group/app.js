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
    owner: document.getElementById("group-owner"),
    groupId: document.getElementById("group-id"),
    memberCount: document.getElementById("member-count"),
    activeCount: document.getElementById("active-count"),
    activePanel: document.getElementById("active-panel"),
    inactivePanel: document.getElementById("inactive-panel"),
    activeList: document.getElementById("active-members"),
    inactiveList: document.getElementById("inactive-members"),
    errorState: document.getElementById("error-state"),
    errorTitle: document.getElementById("error-title"),
    errorBody: document.getElementById("error-body"),
    contentState: document.getElementById("content-state"),
    joinButton: document.getElementById("join-button"),
    joinHint: document.getElementById("join-hint")
  };

  bindButton();
  setLoadingState();

  if (!state.groupId) {
    renderError(copy.invalidGroup);
    return;
  }

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
        noDescription: "群主还没有留下群组介绍。",
        noMembers: "还没有可展示的成员数据。",
        activeSection: "完成禅修",
        inactiveSection: "尚未禅修",
        checkedInToday: "今日已打卡",
        notCheckedInToday: "今日未打卡",
        ownerRole: "群主",
        memberRole: "成员",
        minuteUnit: "分钟",
        joinButton: "加入群组",
        joinHint: "点击按钮会尝试打开 ZenSee，并把这张群组邀请卡片带回 App。",
        openFallback: "如未安装 App，将跳转到下载页。",
        downloadButton: "下载 ZenSee",
        groupSuffix: "群组详情"
      },
      "zh-hant": {
        loading: "正在載入群組詳情…",
        invalidGroup: "群組連結無效或群組已不存在。",
        loadFailed: "暫時無法載入群組詳情，請稍後再試。",
        unknownOwner: "禪友",
        noDescription: "群主還沒有留下群組介紹。",
        noMembers: "還沒有可展示的成員資料。",
        activeSection: "完成禪修",
        inactiveSection: "尚未禪修",
        checkedInToday: "今日已打卡",
        notCheckedInToday: "今日未打卡",
        ownerRole: "群主",
        memberRole: "成員",
        minuteUnit: "分鐘",
        joinButton: "加入群組",
        joinHint: "點擊按鈕會嘗試打開 ZenSee，並把這張群組邀請卡片帶回 App。",
        openFallback: "如未安裝 App，將跳轉到下載頁。",
        downloadButton: "下載 ZenSee",
        groupSuffix: "群組詳情"
      },
      "ja": {
        loading: "グループ詳細を読み込み中…",
        invalidGroup: "グループリンクが無効か、グループが存在しません。",
        loadFailed: "現在グループ詳細を読み込めません。しばらくしてからお試しください。",
        unknownOwner: "禅友",
        noDescription: "グループ紹介はまだありません。",
        noMembers: "表示できるメンバー情報がまだありません。",
        activeSection: "修行完了",
        inactiveSection: "未修行",
        checkedInToday: "本日はチェックイン済み",
        notCheckedInToday: "本日は未チェックイン",
        ownerRole: "グループ主",
        memberRole: "メンバー",
        minuteUnit: "分",
        joinButton: "グループに参加",
        joinHint: "ボタンを押すと ZenSee を開き、この招待カードを App に戻します。",
        openFallback: "App が未インストールの場合はダウンロードページへ移動します。",
        downloadButton: "ZenSee をダウンロード",
        groupSuffix: "グループ詳細"
      },
      "en": {
        loading: "Loading group details…",
        invalidGroup: "This group link is invalid or no longer available.",
        loadFailed: "Group details are unavailable right now. Please try again later.",
        unknownOwner: "Zen Friend",
        noDescription: "The group owner has not added a description yet.",
        noMembers: "No member activity is available yet.",
        activeSection: "Checked In Today",
        inactiveSection: "Not Checked In Yet",
        checkedInToday: "Checked in today",
        notCheckedInToday: "Not checked in today",
        ownerRole: "Owner",
        memberRole: "Member",
        minuteUnit: "min",
        joinButton: "Join Group",
        joinHint: "This button will try to open ZenSee and bring this invitation card back into the app.",
        openFallback: "If the app is not installed, you will be redirected to the download page.",
        downloadButton: "Download ZenSee",
        groupSuffix: "Group Details"
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
    }).catch(function () {
      renderError(copy.loadFailed);
    });
  }

  function setLoadingState() {
    if (elements.status) {
      elements.status.textContent = copy.loading;
    }
    if (elements.title) {
      elements.title.textContent = copy.loading;
    }
    if (elements.joinButton) {
      elements.joinButton.textContent = copy.joinButton;
    }
    if (elements.joinHint) {
      elements.joinHint.textContent = copy.openFallback;
    }
  }

  function renderGroup() {
    var snapshot = state.snapshot;
    var activeMembers = [];
    var inactiveMembers = [];
    var i;

    for (i = 0; i < state.members.length; i += 1) {
      if (state.members[i].did_check_in_today) {
        activeMembers.push(state.members[i]);
      } else {
        inactiveMembers.push(state.members[i]);
      }
    }

    document.title = snapshot.name + " · " + copy.groupSuffix;

    elements.status.textContent = copy.joinHint;
    elements.title.textContent = snapshot.name;
    elements.description.textContent = trimmed(snapshot.description) || copy.noDescription;
    elements.owner.textContent = snapshot.owner_name || copy.unknownOwner;
    elements.groupId.textContent = snapshot.id;
    elements.memberCount.textContent = String(state.members.length || snapshot.member_count || 0);
    elements.activeCount.textContent = String(snapshot.active_count || 0);
    elements.contentState.hidden = false;
    elements.errorState.hidden = true;
    state.mode = "join";
    elements.joinButton.textContent = copy.joinButton;
    elements.joinHint.textContent = copy.openFallback;

    renderMemberSection(elements.activePanel, elements.activeList, activeMembers, copy.activeSection, copy.checkedInToday);
    renderMemberSection(elements.inactivePanel, elements.inactiveList, inactiveMembers, copy.inactiveSection, copy.notCheckedInToday);
  }

  function renderMemberSection(panel, list, members, title, fallbackStatus) {
    var titleNode;

    if (!panel || !list) {
      return;
    }

    titleNode = panel.querySelector("[data-section-title]");
    if (titleNode) {
      titleNode.textContent = title;
    }

    if (!members.length) {
      panel.hidden = true;
      list.innerHTML = "";
      return;
    }

    panel.hidden = false;
    list.innerHTML = members.map(function (member) {
      var role = member.role === "owner" ? copy.ownerRole : copy.memberRole;
      var status = member.did_check_in_today
        ? String(member.total_minutes_today || 0) + " " + copy.minuteUnit
        : fallbackStatus;

      return [
        '<article class="member-card">',
        '<div class="member-avatar">' + escapeHtml(initials(member.nickname)) + "</div>",
        '<div class="member-copy">',
        '<div class="member-topline">',
        '<strong>' + escapeHtml(member.nickname || copy.unknownOwner) + "</strong>",
        '<span class="member-role">' + escapeHtml(role) + "</span>",
        "</div>",
        '<p>' + escapeHtml(status) + "</p>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderError(message) {
    document.title = copy.groupSuffix;
    if (elements.contentState) {
      elements.contentState.hidden = true;
    }
    if (elements.errorState) {
      elements.errorState.hidden = false;
    }
    state.mode = "download";
    if (elements.errorTitle) {
      elements.errorTitle.textContent = copy.downloadButton;
    }
    if (elements.errorBody) {
      elements.errorBody.textContent = message;
    }
    if (elements.joinButton) {
      elements.joinButton.textContent = copy.downloadButton;
    }
    if (elements.joinHint) {
      elements.joinHint.textContent = copy.openFallback;
    }
  }

  function bindButton() {
    if (!elements.joinButton) {
      return;
    }

    elements.joinButton.addEventListener("click", function () {
      if (state.mode === "download" || !state.groupId) {
        window.location.href = config.downloadUrl || (config.siteBaseUrl || "") + "/download/";
        return;
      }

      openApp(state.groupId);
    });
  }

  function openApp(groupId) {
    var deepLink = "zensee://group/join?id=" + encodeURIComponent(groupId);
    var fallback = config.downloadUrl || (config.siteBaseUrl || "") + "/download/";
    var didHide = false;
    var visibilityHandler = function () {
      didHide = document.hidden;
    };

    document.addEventListener("visibilitychange", visibilityHandler);
    window.location.href = deepLink;

    window.setTimeout(function () {
      document.removeEventListener("visibilitychange", visibilityHandler);
      if (!didHide) {
        window.location.href = fallback;
      }
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
}());
