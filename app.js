/* global LAWS, PROVISIONS */

const STORAGE_KEY = "lawboard.favorites.v1";

function safeText(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function uniq(arr) {
  return [...new Set(arr)];
}

function tokenize(q) {
  return safeText(q)
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function lawSearchIndex(law) {
  const parts = [
    law.title,
    law.industry,
    law.ministry,
    law.support,
    law.scope,
    ...(law.instruments || []),
    ...((law.links || []).flatMap((l) => [l?.title, l?.url])),
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function loadFavs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveFavs(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function chip(label, active, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `chip${active ? " is-active" : ""}`;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function chipWithClass(label, active, className, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `${className}${active ? " is-active" : ""}`;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderEmpty(container, message) {
  container.innerHTML = "";
  const box = el("div", "empty", message);
  container.appendChild(box);
}

function setView(view) {
  const cardsView = document.getElementById("cardsView");
  const tableView = document.getElementById("tableView");
  const viewCards = document.getElementById("viewCards");
  const viewTable = document.getElementById("viewTable");

  const isCards = view === "cards";
  cardsView.classList.toggle("is-hidden", !isCards);
  tableView.classList.toggle("is-hidden", isCards);
  tableView.setAttribute("aria-hidden", String(isCards));

  viewCards.classList.toggle("is-active", isCards);
  viewTable.classList.toggle("is-active", !isCards);
  viewCards.setAttribute("aria-selected", String(isCards));
  viewTable.setAttribute("aria-selected", String(!isCards));
}

function downloadText(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  const escape = (v) => {
    const s = safeText(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return rows.map((r) => r.map(escape).join(",")).join("\n");
}

function main() {
  const qEl = document.getElementById("q");
  const onlyFavEl = document.getElementById("onlyFav");
  const industryChipsEl = document.getElementById("industryChips");
  const policyChipsEl = document.getElementById("policyChips");
  const provisionGroupsEl = document.getElementById("provisionGroups");
  const provisionHintEl = document.getElementById("provisionHint");
  const cardsViewEl = document.getElementById("cardsView");
  const tableBodyEl = document.getElementById("tableBody");
  const resultCountEl = document.getElementById("resultCount");
  const lastUpdatedEl = document.getElementById("lastUpdated");

  const resetBtn = document.getElementById("reset");
  const exportBtn = document.getElementById("export");
  const viewCardsBtn = document.getElementById("viewCards");
  const viewTableBtn = document.getElementById("viewTable");
  const clearProvisionBtn = document.getElementById("clearProvision");
  const openProvisionMatrixBtn = document.getElementById("openProvisionMatrix");
  const provisionDialog = document.getElementById("provisionDialog");
  const closeProvisionDialogBtn = document.getElementById("closeProvisionDialog");
  const provisionMatrixBody = document.getElementById("provisionMatrixBody");
  const dialogSub = document.getElementById("dialogSub");
  const provisionDetailDialog = document.getElementById("provisionDetailDialog");
  const closeProvisionDetailDialogBtn = document.getElementById("closeProvisionDetailDialog");
  const provisionDetailTitle = document.getElementById("provisionDetailTitle");
  const provisionDetailSub = document.getElementById("provisionDetailSub");
  const provisionDetailBody = document.getElementById("provisionDetailBody");
  const provisionDetailHint = document.getElementById("provisionDetailHint");
  const lawProvisionDialog = document.getElementById("lawProvisionDialog");
  const closeLawProvisionDialogBtn = document.getElementById("closeLawProvisionDialog");
  const lawProvisionTitle = document.getElementById("lawProvisionTitle");
  const lawProvisionSub = document.getElementById("lawProvisionSub");
  const lawProvisionBody = document.getElementById("lawProvisionBody");
  const lawProvisionHint = document.getElementById("lawProvisionHint");

  const favs = loadFavs();

  const normalized = (Array.isArray(LAWS) ? LAWS : []).map((l) => ({
    ...l,
    instruments: Array.isArray(l.instruments) ? l.instruments : [],
    links: Array.isArray(l.links) ? l.links : [],
    provisions: Array.isArray(l.provisions) ? l.provisions : [],
    provisionRefs: l && typeof l.provisionRefs === "object" && l.provisionRefs ? l.provisionRefs : {},
    _idx: lawSearchIndex(l),
  }));

  const provisions = Array.isArray(PROVISIONS) ? PROVISIONS : [];
  const provisionById = new Map(provisions.map((p) => [p.id, p]));
  const provisionGroups = uniq(provisions.map((p) => safeText(p.group)).filter(Boolean)).sort(
    (a, b) => a.localeCompare(b, "ko"),
  );

  const industries = uniq(normalized.map((l) => safeText(l.industry)).filter(Boolean)).sort(
    (a, b) => a.localeCompare(b, "ko"),
  );
  const policies = uniq(normalized.flatMap((l) => l.instruments || []).map(safeText).filter(Boolean)).sort(
    (a, b) => a.localeCompare(b, "ko"),
  );

  const state = {
    q: "",
    industries: new Set(),
    policies: new Set(),
    onlyFav: false,
    view: "cards",
    provision: null, // selected provision id (for popup only; does NOT filter)
  };

  function renderChips() {
    industryChipsEl.innerHTML = "";
    industryChipsEl.appendChild(
      chip("전체", state.industries.size === 0, () => {
        state.industries.clear();
        rerender();
      }),
    );
    for (const ind of industries) {
      industryChipsEl.appendChild(
        chip(ind, state.industries.has(ind), () => {
          if (state.industries.has(ind)) state.industries.delete(ind);
          else state.industries.add(ind);
          rerender();
        }),
      );
    }

    policyChipsEl.innerHTML = "";
    policyChipsEl.appendChild(
      chip("전체", state.policies.size === 0, () => {
        state.policies.clear();
        rerender();
      }),
    );
    for (const p of policies) {
      policyChipsEl.appendChild(
        chip(p, state.policies.has(p), () => {
          if (state.policies.has(p)) state.policies.delete(p);
          else state.policies.add(p);
          rerender();
        }),
      );
    }
  }

  function matches(law) {
    if (state.onlyFav && !favs.has(law.id)) return false;
    if (state.industries.size > 0 && !state.industries.has(law.industry)) return false;
    if (state.policies.size > 0) {
      const inst = new Set(law.instruments || []);
      for (const p of state.policies) if (!inst.has(p)) return false;
    }
    const tokens = tokenize(state.q);
    if (tokens.length === 0) return true;
    return tokens.every((t) => law._idx.includes(t));
  }

  function openLawProvisionDetail(lawId, provisionId) {
    if (!lawId || !provisionId) return;
    if (!lawProvisionBody) return;

    const law = normalized.find((x) => x.id === lawId);
    const p = provisionById.get(provisionId);
    if (!law) return;

    const has = (law.provisions || []).includes(provisionId);
    const ref = law.provisionRefs?.[provisionId];
    const content = safeText(ref?.content || "").trim();

    lawProvisionBody.innerHTML = "";

    if (lawProvisionTitle) lawProvisionTitle.textContent = `유사 조항: ${law.title}`;
    if (lawProvisionSub) {
      lawProvisionSub.textContent = p ? `${p.group} · ${p.label}` : provisionId;
    }

    const tr = document.createElement("tr");
    const c1 = document.createElement("td");
    c1.textContent = p?.label || provisionId;

    const c2 = document.createElement("td");
    c2.innerHTML = has ? `<b>${safeText(ref?.article || "—")}</b>` : "<small class='muted'>해당 없음</small>";

    const c3 = document.createElement("td");
    if (!has) {
      c3.innerHTML = "<small class='muted'>이 법에서 유사 조항을 아직 매핑하지 않았습니다.</small>";
    } else {
      if (!content) {
        c3.innerHTML = "<small class='muted'>조항 본문(content)이 아직 입력되지 않았습니다. laws.data.js의 provisionRefs에 content를 추가해 주세요.</small>";
      } else {
        const pre = document.createElement("pre");
        pre.style.whiteSpace = "pre-wrap";
        pre.style.margin = "0";
        pre.style.fontFamily = "var(--sans)";
        pre.textContent = content;
        c3.appendChild(pre);
      }
    }

    tr.appendChild(c1);
    tr.appendChild(c2);
    tr.appendChild(c3);
    lawProvisionBody.appendChild(tr);

    if (lawProvisionHint) {
      lawProvisionHint.textContent = "표시되는 본문은 현재 데이터(laws.data.js)에 저장된 조항 텍스트입니다.";
    }

    if (typeof lawProvisionDialog?.showModal === "function") lawProvisionDialog.showModal();
  }

  function openProvisionDetail(provisionId) {
    if (!provisionId) return;
    const p = provisionById.get(provisionId);
    state.provision = provisionId;
    renderProvisionPanel();

    if (!provisionDetailBody) return;
    provisionDetailBody.innerHTML = "";

    if (provisionDetailTitle) provisionDetailTitle.textContent = p ? `항목 상세: ${p.label}` : `항목 상세: ${provisionId}`;
    if (provisionDetailSub) provisionDetailSub.textContent = p?.hint || "";

    const rows = normalized
      .filter((l) => l.id !== "ai-semicon-act-draft")
      .map((law) => {
        const has = (law.provisions || []).includes(provisionId);
        const ref = law.provisionRefs?.[provisionId];
        return { law, has, ref };
      })
      .sort((a, b) => Number(b.has) - Number(a.has) || a.law.title.localeCompare(b.law.title, "ko"));

    for (const { law, has, ref } of rows) {
      const tr = document.createElement("tr");

      const c1 = document.createElement("td");
      c1.textContent = law.title;

      const c2 = document.createElement("td");
      c2.innerHTML = has ? `<b>${safeText(ref?.article || "—")}</b>` : "<small class='muted'>해당 없음</small>";

      const c3 = document.createElement("td");
      if (!has) {
        c3.innerHTML = "<small class='muted'>—</small>";
      } else {
        const title = safeText(ref?.title || p?.label || "—");
        const link = (law.links || []).find((x) => x?.url);
        if (link?.url) {
          const a = document.createElement("a");
          a.href = link.url;
          a.target = "_blank";
          a.rel = "noreferrer";
          a.textContent = title;
          c3.appendChild(a);
        } else {
          c3.textContent = title;
        }
      }

      // 타법 행 클릭 → 해당 유사조항만 별도 팝업
      tr.addEventListener("click", () => {
        if (!has) return;
        openLawProvisionDetail(law.id, provisionId);
      });
      tr.style.cursor = has ? "pointer" : "default";

      tr.appendChild(c1);
      tr.appendChild(c2);
      tr.appendChild(c3);
      provisionDetailBody.appendChild(tr);
    }

    const hitCount = normalized
      .filter((l) => l.id !== "ai-semicon-act-draft")
      .filter((l) => (l.provisions || []).includes(provisionId)).length;
    if (provisionDetailHint) {
      provisionDetailHint.textContent = `현재 데이터 기준으로 타 법 ${hitCount}개에서 유사 항목을 표시했습니다. (정확한 조문 번호/제목은 laws.data.js의 provisionRefs에서 수정 가능)`;
    }

    if (typeof provisionDetailDialog?.showModal === "function") provisionDetailDialog.showModal();
  }

  function renderProvisionPanel() {
    if (!provisionGroupsEl) return;
    provisionGroupsEl.innerHTML = "";

    for (const g of provisionGroups) {
      const groupWrap = el("div", "provGroup");
      groupWrap.appendChild(el("div", "provGroup__title", g));
      const chipsWrap = el("div", "provChips");
      for (const p of provisions.filter((x) => x.group === g)) {
        const btn = chipWithClass(
          p.label,
          state.provision === p.id,
          "chip chip--prov",
          () => {
            const next = state.provision === p.id ? null : p.id;
            state.provision = next;
            renderProvisionPanel(); // highlight only; keep filters
            if (next) openProvisionDetail(next);
          },
        );
        btn.title = p.hint || "";
        chipsWrap.appendChild(btn);
      }
      groupWrap.appendChild(chipsWrap);
      provisionGroupsEl.appendChild(groupWrap);
    }

    if (!provisionHintEl) return;
    if (!state.provision) {
      provisionHintEl.textContent =
        "항목을 클릭하면 팝업으로 ‘타 법의 조항 제목/근거 조문(제n조)’을 보여줍니다. (기존 필터는 유지)";
      return;
    }
    const p = provisionById.get(state.provision);
    const count = normalized
      .filter((l) => l.id !== "ai-semicon-act-draft")
      .filter((l) => (l.provisions || []).includes(state.provision)).length;
    provisionHintEl.textContent = `선택: ${p?.label || state.provision} · 타 법 유사 항목 표시: ${count}개 (팝업 참조)`;
  }

  function renderProvisionMatrix() {
    if (!provisionMatrixBody) return;
    provisionMatrixBody.innerHTML = "";

    const targetLaw = normalized.find((l) => l.id === "ai-semicon-act-draft");
    const aiSet = new Set(targetLaw?.provisions || provisions.map((p) => p.id));

    for (const p of provisions) {
      const tr = document.createElement("tr");

      const c1 = document.createElement("td");
      const title = el("div", null, p.label);
      const hint = el("small", null, p.hint || "");
      c1.appendChild(title);
      if (hint.textContent) c1.appendChild(hint);

      const c2 = document.createElement("td");
      c2.innerHTML = aiSet.has(p.id) ? "<b>✓</b> 포함" : "<small class='muted'>—</small>";

      const c3 = document.createElement("td");
      const hits = normalized
        .filter((l) => l.id !== "ai-semicon-act-draft")
        .filter((l) => (l.provisions || []).includes(p.id))
        .map((l) => l.title);
      if (hits.length === 0) {
        c3.innerHTML = "<small class='muted'>해당 없음(현재 데이터 기준)</small>";
      } else {
        c3.textContent = hits.join(" · ");
      }

      tr.addEventListener("click", () => {
        provisionDialog?.close();
        openProvisionDetail(p.id);
      });
      tr.style.cursor = "pointer";

      tr.appendChild(c1);
      tr.appendChild(c2);
      tr.appendChild(c3);
      provisionMatrixBody.appendChild(tr);
    }
  }

  function toggleFav(id) {
    if (!id) return;
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    saveFavs(favs);
    rerender();
  }

  function renderCards(list) {
    cardsViewEl.innerHTML = "";
    if (list.length === 0) {
      renderEmpty(cardsViewEl, "조건에 맞는 항목이 없습니다. 검색어/필터를 조정해보세요.");
      return;
    }

    for (const law of list) {
      const card = el("article", "card");

      const top = el("div", "card__top");
      const titleWrap = el("div");
      const h = el("h3", "card__title", safeText(law.title));
      const sub = el(
        "p",
        "card__subtitle",
        [law.ministry, law.scope].filter(Boolean).join(" · "),
      );
      titleWrap.appendChild(h);
      if (sub.textContent) titleWrap.appendChild(sub);

      const favBtn = el("button", `fav${favs.has(law.id) ? " is-active" : ""}`, favs.has(law.id) ? "★" : "☆");
      favBtn.type = "button";
      favBtn.title = "즐겨찾기";
      favBtn.setAttribute("aria-label", "즐겨찾기");
      favBtn.addEventListener("click", () => toggleFav(law.id));

      top.appendChild(titleWrap);
      top.appendChild(favBtn);
      card.appendChild(top);

      const badges = el("div", "badges");
      if (law.industry) badges.appendChild(el("span", "badge badge--industry", safeText(law.industry)));
      for (const i of law.instruments || []) badges.appendChild(el("span", "badge badge--policy", safeText(i)));
      card.appendChild(badges);

      const grid = el("div", "card__grid");
      const kv1 = el("div", "kv");
      kv1.appendChild(el("div", "kv__k", "핵심지원"));
      kv1.appendChild(el("div", "kv__v", safeText(law.support)));
      grid.appendChild(kv1);

      const kv2 = el("div", "kv");
      kv2.appendChild(el("div", "kv__k", "메모"));
      kv2.appendChild(
        el(
          "div",
          "kv__v",
          safeText(law.note || "—"),
        ),
      );
      grid.appendChild(kv2);

      card.appendChild(grid);

      const linksWrap = el("div", "links");
      const links = (law.links || []).filter((l) => l && (l.url || l.title));
      if (links.length > 0) {
        for (const l of links) {
          const a = document.createElement("a");
          a.className = "link";
          a.href = l.url || "#";
          a.target = l.url ? "_blank" : "_self";
          a.rel = "noreferrer";
          a.textContent = l.title || "링크";
          const s = el("span", null, l.url ? "열기" : "미설정");
          a.appendChild(s);
          linksWrap.appendChild(a);
        }
      } else {
        const hint = el("a", "link", "링크 추가하기");
        hint.href = "./laws.data.js";
        hint.target = "_self";
        hint.appendChild(el("span", null, "데이터 파일"));
        linksWrap.appendChild(hint);
      }
      card.appendChild(linksWrap);

      cardsViewEl.appendChild(card);
    }
  }

  function renderTable(list) {
    tableBodyEl.innerHTML = "";
    if (list.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "muted";
      td.textContent = "조건에 맞는 항목이 없습니다.";
      tr.appendChild(td);
      tableBodyEl.appendChild(tr);
      return;
    }

    for (const law of list) {
      const tr = document.createElement("tr");

      const c1 = document.createElement("td");
      const title = el("div", null, safeText(law.title));
      const meta = el("small", null, [law.scope].filter(Boolean).join(" "));
      c1.appendChild(title);
      if (meta.textContent) c1.appendChild(meta);

      const favBtn = el("button", `fav${favs.has(law.id) ? " is-active" : ""}`, favs.has(law.id) ? "★" : "☆");
      favBtn.type = "button";
      favBtn.style.marginLeft = "10px";
      favBtn.addEventListener("click", () => toggleFav(law.id));
      title.appendChild(favBtn);

      const c2 = document.createElement("td");
      c2.textContent = safeText(law.industry);

      const c3 = document.createElement("td");
      c3.textContent = safeText(law.ministry);

      const c4 = document.createElement("td");
      c4.textContent = safeText(law.support);

      const c5 = document.createElement("td");
      const links = (law.links || []).filter((l) => l && l.url);
      if (links.length === 0) {
        c5.innerHTML = "<small class='muted'>—</small>";
      } else {
        const a = document.createElement("a");
        a.href = links[0].url;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.textContent = links[0].title || "열기";
        c5.appendChild(a);
      }

      tr.appendChild(c1);
      tr.appendChild(c2);
      tr.appendChild(c3);
      tr.appendChild(c4);
      tr.appendChild(c5);
      tableBodyEl.appendChild(tr);
    }
  }

  function rerender() {
    const list = normalized.filter(matches);
    resultCountEl.textContent = `${list.length}건`;
    renderChips();
    renderProvisionPanel();
    if (state.view === "cards") renderCards(list);
    else renderTable(list);
  }

  qEl.addEventListener("input", () => {
    state.q = qEl.value;
    rerender();
  });

  onlyFavEl.addEventListener("change", () => {
    state.onlyFav = Boolean(onlyFavEl.checked);
    rerender();
  });

  resetBtn.addEventListener("click", () => {
    state.q = "";
    state.industries.clear();
    state.policies.clear();
    state.onlyFav = false;
    state.provision = null;
    qEl.value = "";
    onlyFavEl.checked = false;
    rerender();
  });

  clearProvisionBtn?.addEventListener("click", () => {
    state.provision = null;
    renderProvisionPanel();
  });

  openProvisionMatrixBtn?.addEventListener("click", () => {
    renderProvisionMatrix();
    dialogSub.textContent = state.provision
      ? `현재 선택: ${provisionById.get(state.provision)?.label || state.provision} (행 클릭 시 상세 팝업 열기)`
      : "행을 클릭하면 상세 팝업이 열립니다.";
    if (typeof provisionDialog?.showModal === "function") provisionDialog.showModal();
  });

  closeProvisionDialogBtn?.addEventListener("click", () => {
    provisionDialog?.close();
  });

  provisionDialog?.addEventListener("click", (e) => {
    if (e.target === provisionDialog) provisionDialog.close();
  });

  closeProvisionDetailDialogBtn?.addEventListener("click", () => {
    provisionDetailDialog?.close();
  });

  provisionDetailDialog?.addEventListener("click", (e) => {
    if (e.target === provisionDetailDialog) provisionDetailDialog.close();
  });

  closeLawProvisionDialogBtn?.addEventListener("click", () => {
    lawProvisionDialog?.close();
  });

  lawProvisionDialog?.addEventListener("click", (e) => {
    if (e.target === lawProvisionDialog) lawProvisionDialog.close();
  });

  exportBtn.addEventListener("click", () => {
    const list = normalized.filter(matches);
    const rows = [
      ["id", "title", "industry", "ministry", "instruments", "support", "scope", "link1_title", "link1_url"],
      ...list.map((l) => [
        l.id,
        l.title,
        l.industry,
        l.ministry,
        (l.instruments || []).join("|"),
        l.support,
        l.scope,
        l.links?.[0]?.title || "",
        l.links?.[0]?.url || "",
      ]),
    ];
    downloadText("laws.csv", toCsv(rows), "text/csv;charset=utf-8");
  });

  viewCardsBtn.addEventListener("click", () => {
    state.view = "cards";
    setView("cards");
    rerender();
  });

  viewTableBtn.addEventListener("click", () => {
    state.view = "table";
    setView("table");
    rerender();
  });

  const now = new Date();
  lastUpdatedEl.textContent = `페이지 생성: ${now.toLocaleDateString("ko-KR")} ${now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  setView(state.view);
  renderChips();
  renderProvisionPanel();
  rerender();
}

document.addEventListener("DOMContentLoaded", main);
