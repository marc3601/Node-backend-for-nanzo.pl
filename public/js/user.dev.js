const btns = document.querySelectorAll(".btn_expand");
const btn_b = document.querySelector(".back_btn");
const chart_main = document.querySelector(".chart_container");
const placeholder = document.querySelector(".placeholder");
const range = document.querySelector(".range");
const body = document.querySelector("body");
const range_title = document.querySelector(".range-title");
const summary_text = document.querySelector(".summary_text");
const summary_icon = document.querySelector(".summary_icon");
const google_container = document.querySelector(".google_container");
const data_table = document.querySelector("tbody");
const google_placeholder = document.querySelector(".google_placeholder");

const mondays = document.querySelectorAll("#M1, #M2, #M3, #M4, #M5, #M6, #M7");
const tuesdays = document.querySelectorAll("#T1, #T2, #T3, #T4, #T5, #T6, #T7");
const wednesdays = document.querySelectorAll("#W1, #W2, #W3, #W4, #W5, #W6, #W7");
const thursdays = document.querySelectorAll("#TH1, #TH2, #TH3, #TH4, #TH5, #TH6, #TH7");
const fridays = document.querySelectorAll("#F1, #F2, #F3, #F4, #F5, #F6, #F7");
const saturdays = document.querySelectorAll("#ST1, #ST2, #ST3, #ST4, #ST5, #ST6, #ST7");
const sundays = document.querySelectorAll("#SA1, #SA2, #SA3, #SA4, #SA5, #SA6, #SA7");

const daysColumns = [mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays];
const daysNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sb", "Ndz"];
const ranges = ["6-8", "9-11", "12-14", "15-17", "18-20", "21-23"];

// ─── TimeAgo (Polish) ────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)   return 'przed chwilą';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)   return minutes === 1 ? 'minutę temu' : (minutes < 5 ? `${minutes} minuty temu` : `${minutes} minut temu`);
  const hours = Math.floor(minutes / 60);
  if (hours < 24)     return hours === 1 ? 'godzinę temu' : (hours < 5 ? `${hours} godziny temu` : `${hours} godzin temu`);
  const days = Math.floor(hours / 24);
  if (days < 7)       return `${days} ${days === 1 ? 'dzień' : 'dni'} temu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4)      return weeks === 1 ? 'tydzień temu' : `${weeks} tygodnie temu`;
  const months = Math.floor(days / 30);
  if (months < 12)    return months === 1 ? 'miesiąc temu' : (months < 5 ? `${months} miesiące temu` : `${months} miesięcy temu`);
  const years = Math.floor(days / 365);
  return years === 1 ? 'rok temu' : `${years} lata temu`;
};

let dataToBuildGraph = {};
let graphData = { labels: [], data: [] };
let arrowFlag = "none";
let currentEvent = "week";

const getDayOfWeek = (dateString) => {
  const [day, month, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  const daysOfWeek = ["Ndz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sb"];
  return daysOfWeek[date.getDay()];
};

const groupHoursByRange = (hours) => {
  const groupedRanges = {
    "6-8": [],
    "9-11": [],
    "12-14": [],
    "15-17": [],
    "18-20": [],
    "21-23": [],
  };
  hours.forEach((hour) => {
    const num = parseInt(hour, 10);
    if (num >= 6 && num <= 8) groupedRanges["6-8"].push(hour);
    else if (num >= 9 && num <= 11) groupedRanges["9-11"].push(hour);
    else if (num >= 12 && num <= 14) groupedRanges["12-14"].push(hour);
    else if (num >= 15 && num <= 17) groupedRanges["15-17"].push(hour);
    else if (num >= 18 && num <= 20) groupedRanges["18-20"].push(hour);
    else if (num >= 21 && num <= 23) groupedRanges["21-23"].push(hour);
  });
  return groupedRanges;
};

const createHoursGraph = (data) => {
  const daysOfWeek = { Ndz: [], Pon: [], Wt: [], Śr: [], Czw: [], Pt: [], Sb: [] };
  data.forEach((date) => {
    const day = getDayOfWeek(date.x);
    if (daysOfWeek[day]) daysOfWeek[day].push(...date.hours);
  });
  Object.keys(daysOfWeek).forEach((day) => {
    daysOfWeek[day] = groupHoursByRange(daysOfWeek[day]);
  });
  let largestNumber = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      const count = daysOfWeek[daysNames[i]][ranges[j]].length;
      if (count > largestNumber) largestNumber = count;
      daysColumns[i][j].firstChild.textContent = count;
    }
  }
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      const count = parseInt(daysColumns[i][j].firstChild.textContent);
      const alpha = (count / largestNumber).toFixed(2);
      daysColumns[i][j].firstChild.style.color = alpha >= 0.6 ? "white" : "#7b4505";
      daysColumns[i][j].style.backgroundColor = `rgb(210, 115, 3, ${alpha})`;
    }
  }
};

const throttle = (func, wait) => {
  let waiting = false;
  return function (...args) {
    if (waiting) return;
    waiting = true;
    setTimeout(() => { func.apply(this, args); waiting = false; }, wait);
  };
};

const onScroll = throttle(() => {
  const scrollPercentage = Math.round((window.scrollY / body.offsetHeight) * 100);
  btn_b.style.right = scrollPercentage > 50 ? "50px" : "-50px";
}, 100);

const graphConfig = (graphData) => ({
  type: "line",
  data: {
    labels: graphData.labels,
    datasets: [{ data: graphData.data, label: "Wyświetlenia", borderColor: "#d27303", fill: true }],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { reverse: true } },
  },
});

const graphBuilder = () => {
  placeholder.remove();
  const chart_container = document.createElement("div");
  const canvas_element = document.createElement("canvas");
  chart_container.setAttribute("class", "chart");
  canvas_element.setAttribute("class", "visitor_chart");
  canvas_element.setAttribute("width", "600");
  canvas_element.setAttribute("height", "200");
  chart_main.appendChild(chart_container);
  chart_container.appendChild(canvas_element);
  new Chart(canvas_element.getContext("2d"), graphConfig(graphData));
};

const updateSummaryIcon = () => {
  if (summary_icon.lastElementChild?.tagName === "IMG") {
    summary_icon.removeChild(summary_icon.lastElementChild);
  }
  if (arrowFlag !== "none") {
    const image = document.createElement("img");
    image.src = `/public/assets/arrow_${arrowFlag}.svg`;
    summary_icon.appendChild(image);
  }
};

const createTextSummary = (users, period) => {
  if (period === "all") { arrowFlag = "none"; updateSummaryIcon(); return ""; }
  const parsedUsers = {};
  Object.keys(users).forEach((item) => {
    if (users[item][0]) parsedUsers[item] = users[item].reduce((acc, curr) => acc + curr.y, 0);
  });
  const perioidsToCompare = {
    current: period === "week" ? parsedUsers.week : parsedUsers.month,
    prev: period === "week" ? parsedUsers.last_week : parsedUsers.last_month,
  };
  const trafficUp = perioidsToCompare.current > perioidsToCompare.prev;
  const percent = Math.abs(
    ((perioidsToCompare.current - perioidsToCompare.prev) / perioidsToCompare.current) * 100
  );
  arrowFlag = trafficUp ? "up" : perioidsToCompare.current < perioidsToCompare.prev ? "down" : "none";
  updateSummaryIcon();
  const periodName = period === "week" ? "tygodniu" : "miesiącu";
  const prevPeriodName = period === "week" ? "tygodniem" : "miesiącem";
  if (perioidsToCompare.current === perioidsToCompare.prev) {
    return `Liczba wyświetleń w tym ${periodName} to ${perioidsToCompare.current}. Tyle samo co w poprzednim ${prevPeriodName}`;
  }
  return `Liczba wyświetleń w tym ${periodName} to ${perioidsToCompare.current}. Ruch ${
    trafficUp ? "wzrósł" : "spadł"
  } o ${Math.abs(percent.toFixed(0))}% w porównaniu z poprzednim ${prevPeriodName}.`;
};

const websitePerformance = () => {
  summary_text.textContent = createTextSummary(dataToBuildGraph, currentEvent);
};

const fetchDates = (link) => {
  axios.get(link).then((res) => {
    dataToBuildGraph = res.data;
    createHoursGraph(dataToBuildGraph.week);
    dataToBuildGraph.month.reverse();
    graphData.data = dataToBuildGraph.week.reverse();
    graphData.labels = dataToBuildGraph.week.map((item) => item.x);
    graphBuilder();
    websitePerformance();
  }).catch((err) => console.error(err.message));
};

const fetchKeywords = (link) => {
  axios.get(link).then((res) => {
    const data = res.data;
    google_placeholder.remove();
    data.forEach((item) => {
      const tr = document.createElement("tr");
      data_table.appendChild(tr);
      Object.entries(item).forEach(([key, value]) => {
        if (key !== "domain") {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        }
      });
    });
    const footer = document.createElement("div");
    footer.classList.add("google_footer");
    footer.innerHTML = `
      <div class="popular_info_note">
        <svg class="info_icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 7V11M8 5V5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <div class="info_text">
          <p>Dane dotyczą ostatnich 30 dni i pochodzą z Google Search Console.</p>
        </div>
      </div>`;
    google_container.appendChild(footer);
  }).catch((err) => console.error(err.message));
};

// ─── Popular Pages ────────────────────────────────────────────────────────────

const getViewsText = (count) => {
  if (count === 1) return "wyświetlenie";
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return "wyświetlenia";
  return "wyświetleń";
};

const buildPopularItem = (index, url, title, viewcount, thumbnail) => {
  const a = document.createElement("a");
  a.classList.add("popular_item");
  a.href = url;
  a.target = "_blank";
  const thumbHtml = thumbnail
    ? `<img src="${thumbnail}" alt="${title}" loading="lazy"
           onerror="this.style.display='none'; this.parentElement.classList.add('popular_thumbnail--placeholder');">`
    : "";
  a.innerHTML = `
    <div class="popular_rank">${index + 1}</div>
    <div class="popular_thumbnail ${!thumbnail ? "popular_thumbnail--placeholder" : ""}">
      ${thumbHtml}
    </div>
    <div class="popular_info">
      <div class="popular_title" title="${title}">${title}</div>
      <div class="popular_views">${viewcount} ${getViewsText(viewcount)}</div>
    </div>`;
  return a;
};

/**
 * Fetch and render the standard all-time popular pages list.
 */
const fetchPopularPages = (link, listEl) => {
  axios.get(link).then((res) => {
    const topPages = res.data
      .filter((item) => item.viewcount > 0)
      .sort((a, b) => b.viewcount - a.viewcount)
      .slice(0, 10)
      .map((item) => ({
        thumbnail: item.image?.find((img) => img.thumbnail)?.url || item.image?.[0]?.url || null,
        title: item.title,
        viewcount: item.viewcount,
        url: `https://noanzo.pl/produkt/${item.id}`,
      }));

    listEl.innerHTML = "";
    if (topPages.length === 0) {
      listEl.innerHTML = '<div class="popular_empty">Brak danych o popularnych stronach</div>';
      return;
    }
    topPages.forEach((item, index) => {
      listEl.appendChild(buildPopularItem(index, item.url, item.title, item.viewcount, item.thumbnail));
    });
  }).catch((err) => {
    console.error(err.message);
    listEl.innerHTML = '<div class="popular_empty">Błąd podczas ładowania danych</div>';
  });
};

/**
 * Fetch current auctions + latest snapshot, compute diffs, render "Test wyświetleń" list.
 * Only items with viewcount > snapshot viewcount (i.e. new views since reset) are shown.
 */
const fetchDiffPages = (auctionsLink, listEl) => {
  listEl.innerHTML = `
    <div class="popular_item skeleton">
      <div class="popular_rank"></div>
      <div class="popular_thumbnail skeleton-img"></div>
      <div class="popular_info">
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text skeleton-views"></div>
      </div>
    </div>
    <div class="popular_item skeleton">
      <div class="popular_rank"></div>
      <div class="popular_thumbnail skeleton-img"></div>
      <div class="popular_info">
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text skeleton-views"></div>
      </div>
    </div>
    <div class="popular_item skeleton">
      <div class="popular_rank"></div>
      <div class="popular_thumbnail skeleton-img"></div>
      <div class="popular_info">
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text skeleton-views"></div>
      </div>
    </div>
  `;

  Promise.all([
    axios.get(auctionsLink),
    axios.get("https://admin.noanzo.pl/api/snapshot/latest", { withCredentials: true }),
  ])
    .then(([auctionsRes, snapshotRes]) => {
      const auctions = auctionsRes.data;
      const snapshotItems = snapshotRes.data.items;

      // Build lookup: id → viewcount at time of snapshot
      const snapshotMap = {};
      snapshotItems.forEach((item) => {
        snapshotMap[item.id] = item.viewcount;
      });

      // Compute diffs — only keep items with new views since reset
      const diffPages = auctions
        .map((item) => {
          const baseline = snapshotMap[item.id] ?? item.viewcount; // unknown items get diff 0
          return {
            title: item.title,
            viewcount: item.viewcount - baseline,
            thumbnail: item.image?.find((img) => img.thumbnail)?.url || item.image?.[0]?.url || null,
            url: `https://noanzo.pl/produkt/${item.id}`,
          };
        })
        .filter((item) => item.viewcount > 0)
        .sort((a, b) => b.viewcount - a.viewcount)
        .slice(0, 10);

      listEl.innerHTML = "";

      if (diffPages.length === 0) {
        listEl.innerHTML = '<div class="popular_empty">Brak nowych wyświetleń od czasu resetu</div>';
        return;
      }

      diffPages.forEach((item, index) => {
        listEl.appendChild(buildPopularItem(index, item.url, item.title, item.viewcount, item.thumbnail));
      });
    })
    .catch((err) => {
      console.error("fetchDiffPages error:", err.response?.status, err.response?.data, err);
      if (err.response?.status === 404) {
        listEl.innerHTML = '<div class="popular_empty">Brak resetu — kliknij "Reset" aby rozpocząć test</div>';
      } else {
        listEl.innerHTML = '<div class="popular_empty">Błąd podczas ładowania danych</div>';
      }
    });
};

// ─── Toggle / Reset ───────────────────────────────────────────────────────────

const popularToggleBtn = document.getElementById("popularToggleBtn");
const popularResetBtn  = document.getElementById("popularResetBtn");
const popularListMain  = document.getElementById("popularListMain");
const popularListReset = document.getElementById("popularListReset");
const resetLabel       = document.getElementById("resetLabel");
const resetLabelText       = document.getElementById("resetLabelText");
const dataCollectedNote    = document.getElementById("dataCollectedNote");
const betaBadge            = document.getElementById("betaBadge");
const homepageSection  = document.getElementById("homepageSection");
const homepageViewsDisplay = document.getElementById("homepageViewsDisplay");

// Viewcount rendered server-side at page load — used as "current" for homepage diff
const homepageViewsAtLoad = parseInt(homepageSection.dataset.views, 10) || 0;

const setHomepageViews = (count) => {
  homepageViewsDisplay.textContent = `${count} ${getViewsText(count)}`;
};

let popularView = "main";

const formatResetDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  const absolute = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const relative = timeAgo(date);
  return `<strong>${absolute}</strong> <span style="white-space:nowrap">(${relative})</span>`;
};

// Restore reset label from backend on page load
axios.get("https://admin.noanzo.pl/api/snapshot/latest", { withCredentials: true })
  .then((res) => {
    resetLabelText.innerHTML = `Test wyświetleń od: ${formatResetDate(new Date(res.data.createdAt))}`;
  })
  .catch(() => {
    // No snapshot yet — label stays empty
  });

popularToggleBtn.addEventListener("click", () => {
  if (popularView === "main") {
    popularView = "reset";
    popularListMain.style.display  = "none";
    popularListReset.style.display = "flex";
    popularToggleBtn.classList.add("active");
    popularToggleBtn.textContent = "Wszystkie";
    popularResetBtn.classList.add("visible");
    dataCollectedNote.style.display = "none";
    betaBadge.style.display = "block";
    popularListReset.style.minHeight = popularListMain.offsetHeight + "px";

    resetLabel.style.display = "flex";

    // Show shimmer while fetching snapshot
    homepageViewsDisplay.innerHTML = '<span class="homepage_views_loading"></span>';

    // Fetch snapshot to get reset date label and homepage baseline
    axios.get("https://admin.noanzo.pl/api/snapshot/latest", { withCredentials: true })
      .then((res) => {
        resetLabelText.innerHTML = `Test wyświetleń od: ${formatResetDate(new Date(res.data.createdAt))}`;
        const homepageSnap = res.data.items.find((i) => i.id === "homepage");
        const baseline = homepageSnap ? homepageSnap.viewcount : homepageViewsAtLoad;
        const diff = Math.max(0, homepageViewsAtLoad - baseline);
        setHomepageViews(diff);
      })
      .catch(() => {
        resetLabelText.textContent = 'Brak resetu — kliknij "Reset" aby rozpocząć test';
        setHomepageViews(homepageViewsAtLoad);
      });

    // Always re-fetch diffs when switching to this tab
    fetchDiffPages("https://admin.noanzo.pl/api/auctions", popularListReset);
  } else {
    popularView = "main";
    popularListMain.style.display  = "flex";
    popularListReset.style.display = "none";
    popularToggleBtn.classList.remove("active");
    popularToggleBtn.textContent = "Test wyświetleń";
    popularResetBtn.classList.remove("visible");
    dataCollectedNote.style.display = "";
    betaBadge.style.display = "none";
    popularListReset.style.minHeight = "";
    resetLabel.style.display = "none";

    // Restore real homepage viewcount
    setHomepageViews(homepageViewsAtLoad);
  }
});

popularResetBtn.addEventListener("click", () => {
  if (!confirm("Potwierdź reset")) return;
  popularResetBtn.disabled = true;
  popularResetBtn.innerHTML = '<span class="dot-flashing"><span></span><span></span><span></span></span>';
  popularToggleBtn.classList.add("disabled");
  popularListReset.innerHTML = `
    <div class="popular_item skeleton">
      <div class="popular_rank"></div>
      <div class="popular_thumbnail skeleton-img"></div>
      <div class="popular_info">
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text skeleton-views"></div>
      </div>
    </div>
    <div class="popular_item skeleton">
      <div class="popular_rank"></div>
      <div class="popular_thumbnail skeleton-img"></div>
      <div class="popular_info">
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text skeleton-views"></div>
      </div>
    </div>
    <div class="popular_item skeleton">
      <div class="popular_rank"></div>
      <div class="popular_thumbnail skeleton-img"></div>
      <div class="popular_info">
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text skeleton-views"></div>
      </div>
    </div>
  `;

  // First fetch the current state of all auctions so we have real viewcounts,
  // then POST them to the backend as the snapshot baseline.
  axios
    .get("https://admin.noanzo.pl/api/auctions")
    .then((auctionsRes) => {
      const items = auctionsRes.data.map((item) => ({
        id: item.id,
        viewcount: item.viewcount ?? 0,
      }));

      // Include homepage with a fixed id
      items.push({ id: "homepage", viewcount: homepageViewsAtLoad });

      return axios.post("https://admin.noanzo.pl/api/snapshot", { items }, { withCredentials: true });
    })
    .then((res) => {
      const now = new Date(res.data.createdAt);
      resetLabelText.innerHTML = `Test wyświetleń od: ${formatResetDate(now)}`;
      resetLabel.style.display = "flex";

      // Homepage diff is 0 right after reset
      setHomepageViews(0);

      popularListReset.innerHTML = '<div class="popular_empty">Brak nowych wyświetleń od czasu resetu</div>';
    })
    .catch((err) => {
      console.error("Snapshot error:", err.response?.status, err.response?.data, err);
      popularListReset.innerHTML = '<div class="popular_empty">Błąd podczas zapisywania resetu</div>';
    })
    .finally(() => {
      popularResetBtn.disabled = false;
      popularResetBtn.textContent = "Reset";
      popularToggleBtn.classList.remove("disabled");
    });
});

// ─── Graph range selector ─────────────────────────────────────────────────────

const updateGraphForPeriod = (period) => {
  while (chart_main.childElementCount > 1) chart_main.removeChild(chart_main.lastChild);
  if (period === "week") {
    createHoursGraph(dataToBuildGraph.week);
    graphData.data = dataToBuildGraph.week;
    graphData.labels = dataToBuildGraph.week.map((item) => item.x);
    range_title.innerText = "Ostatni tydzień";
  } else if (period === "month") {
    createHoursGraph(dataToBuildGraph.month);
    graphData.data = dataToBuildGraph.month;
    graphData.labels = dataToBuildGraph.month.map((item) => item.x);
    range_title.innerText = "Ostatni miesiąc";
  } else if (period === "all") {
    graphData.data = Object.fromEntries(Object.entries(dataToBuildGraph.monthly).reverse());
    graphData.labels = Object.keys(graphData.data);
    range_title.innerText = "Cały czas";
  }
  graphBuilder();
  websitePerformance();
};

btns.forEach((item) => {
  item.addEventListener("click", () => {
    const margin = `${item.previousElementSibling.offsetHeight + 10}px`;
    const extend = `-${item.previousElementSibling.offsetHeight}px`;
    if (item.parentNode.style.marginBottom !== margin) {
      item.parentNode.style.marginBottom = margin;
      item.previousElementSibling.style.marginBottom = extend;
      item.style.transform = "rotate(180deg)";
    } else {
      item.parentNode.style.marginBottom = "0px";
      item.previousElementSibling.style.marginBottom = "0px";
      item.style.transform = "rotate(0)";
    }
  });
});

document.addEventListener("scroll", onScroll);

range.addEventListener("change", (e) => {
  currentEvent = e.target.value;
  updateGraphForPeriod(currentEvent);
});

// ─── Initial fetches ──────────────────────────────────────────────────────────

// Populate homepage views card on load
setHomepageViews(homepageViewsAtLoad);

fetchKeywords("https://admin.noanzo.pl/api/most-popular-keywords");
fetchDates("https://admin.noanzo.pl/dates");
fetchPopularPages("https://admin.noanzo.pl/api/auctions", popularListMain);