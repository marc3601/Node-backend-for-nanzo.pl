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
  const daysOfWeek = {
    Ndz: [],
    Pon: [],
    Wt: [],
    Śr: [],
    Czw: [],
    Pt: [],
    Sb: [],
  };

  data.forEach((date) => {
    const day = getDayOfWeek(date.x);
    if (daysOfWeek[day]) {
      daysOfWeek[day].push(...date.hours);
    }
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
      const textColor = alpha >= 0.6 ? "white" : "#7b4505";
      
      daysColumns[i][j].firstChild.style.color = textColor;
      daysColumns[i][j].style.backgroundColor = `rgb(210, 115, 3, ${alpha})`;
    }
  }
};

const throttle = (func, wait) => {
  let waiting = false;
  return function (...args) {
    if (waiting) return;
    waiting = true;
    setTimeout(() => {
      func.apply(this, args);
      waiting = false;
    }, wait);
  };
};

const onScroll = throttle(() => {
  const scrollPercentage = Math.round((window.scrollY / body.offsetHeight) * 100);
  btn_b.style.right = scrollPercentage > 50 ? "50px" : "-50px";
}, 100);

const graphConfig = (graphData) => {
  return {
    type: "line",
    data: {
      labels: graphData.labels,
      datasets: [{
        data: graphData.data,
        label: "Wyświetlenia",
        borderColor: "#d27303",
        fill: true,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { reverse: true },
      },
    },
  };
};

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
  
  const ctx = canvas_element.getContext("2d");
  new Chart(ctx, graphConfig(graphData));
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
  if (period === "all") {
    arrowFlag = "none";
    updateSummaryIcon();
    return "";
  }

  const parsedUsers = {};
  
  Object.keys(users).forEach((item) => {
    if (users[item][0]) {
      parsedUsers[item] = users[item].reduce((acc, curr) => acc + curr.y, 0);
    }
  });

  const perioidsToCompare = {
    current: period === "week" ? parsedUsers.week : parsedUsers.month,
    prev: period === "week" ? parsedUsers.last_week : parsedUsers.last_month,
  };

  const trafficUp = perioidsToCompare.current > perioidsToCompare.prev;
  const percent = Math.abs(
    ((perioidsToCompare.current - perioidsToCompare.prev) / perioidsToCompare.current) * 100
  );

  if (perioidsToCompare.current > perioidsToCompare.prev) {
    arrowFlag = "up";
  } else if (perioidsToCompare.current < perioidsToCompare.prev) {
    arrowFlag = "down";
  } else {
    arrowFlag = "none";
  }

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
  axios
    .get(link)
    .then((res) => {
      dataToBuildGraph = res.data;
      createHoursGraph(dataToBuildGraph.week);
      dataToBuildGraph.month.reverse();
      graphData.data = dataToBuildGraph.week.reverse();
      graphData.labels = dataToBuildGraph.week.map((item) => item.x);

      graphBuilder();
      websitePerformance();
    })
    .catch((err) => {
      console.error(err.message);
    });
};

const fetchKeywords = (link) => {
  axios
    .get(link)
    .then((res) => {
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
      
      const p = document.createElement("p");
      p.textContent = "Dane dotyczą ostatnich 30 dni";
      p.classList.add("info");
      google_container.appendChild(p);
    })
    .catch((err) => console.error(err.message));
};

const updateGraphForPeriod = (period) => {
  while (chart_main.childElementCount > 1) {
    chart_main.removeChild(chart_main.lastChild);
  }

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
    graphData.data = Object.fromEntries(
      Object.entries(dataToBuildGraph.monthly).reverse()
    );
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

fetchKeywords("https://admin.noanzo.pl/api/most-popular-keywords");
fetchDates("https://admin.noanzo.pl/dates");