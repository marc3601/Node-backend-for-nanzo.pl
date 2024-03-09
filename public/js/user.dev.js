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
const mondays = document.querySelectorAll([
  "#M1",
  "#M2",
  "#M3",
  "#M4",
  "#M5",
  "#M6",
  "#M7",
]);
const tuesdays = document.querySelectorAll([
  "#T1",
  "#T2",
  "#T3",
  "#T4",
  "#T5",
  "#T6",
  "#T7",
]);
const wednesdays = document.querySelectorAll([
  "#W1",
  "#W2",
  "#W3",
  "#W4",
  "#W5",
  "#W6",
  "#W7",
]);
const thursdays = document.querySelectorAll([
  "#TH1",
  "#TH2",
  "#TH3",
  "#TH4",
  "#TH5",
  "#TH6",
  "#TH7",
]);
const fridays = document.querySelectorAll([
  "#F1",
  "#F2",
  "#F3",
  "#F4",
  "#F5",
  "#F6",
  "#F7",
]);
const saturdays = document.querySelectorAll([
  "#ST1",
  "#ST2",
  "#ST3",
  "#ST4",
  "#ST5",
  "#ST6",
  "#ST7",
]);
const sundays = document.querySelectorAll([
  "#SA1",
  "#SA2",
  "#SA3",
  "#SA4",
  "#SA5",
  "#SA6",
  "#SA7",
]);

const createHoursGraph = (data) => {
  const dates = data;
  const daysOfWeek = {
    Ndz: [],
    Pon: [],
    Wt: [],
    Śr: [],
    Czw: [],
    Pt: [],
    Sb: [],
  };
  const daysColumns = [
    mondays,
    tuesdays,
    wednesdays,
    thursdays,
    fridays,
    saturdays,
    sundays,
  ];
  const daysNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sb", "Ndz"];
  const ranges = ["6-8", "9-11", "12-14", "15-17", "18-20", "21-23"];

  for (day in daysOfWeek) {
    dates.forEach((date) => {
      if (getDayOfWeek(date.x) === day) {
        daysOfWeek[day].push(...date.hours);
      }
    });

    const groupedRanges = {
      "6-8": [],
      "9-11": [],
      "12-14": [],
      "15-17": [],
      "18-20": [],
      "21-23": [],
    };
    daysOfWeek[day].forEach((element) => {
      const num = parseInt(element, 10);
      if (num >= 6 && num <= 8) {
        groupedRanges["6-8"].push(element);
      } else if (num >= 9 && num <= 11) {
        groupedRanges["9-11"].push(element);
      } else if (num >= 12 && num <= 14) {
        groupedRanges["12-14"].push(element);
      } else if (num >= 15 && num <= 17) {
        groupedRanges["15-17"].push(element);
      } else if (num >= 18 && num <= 20) {
        groupedRanges["18-20"].push(element);
      } else if (num >= 21 && num <= 23) {
        groupedRanges["21-23"].push(element);
      }
    });

    daysOfWeek[day] = groupedRanges;
  }

  let largestNumber = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      const count = daysOfWeek[daysNames[i]][ranges[j]].length;
      if (count > largestNumber) {
        largestNumber = count;
      }
      daysColumns[i][j].firstChild.textContent = count;
    }
  }

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      if (daysColumns[i][j].firstChild.style.color === "white") {
        daysColumns[i][j].firstChild.style.color = "#7b4505";
      }
      const count = parseInt(daysColumns[i][j].firstChild.textContent);
      const alpha = (count / largestNumber).toFixed(2);
      if (alpha >= 0.6) {
        daysColumns[i][j].firstChild.style.color = "white";
      }
      daysColumns[i][j].style.backgroundColor = `rgb(210, 115, 3, ${alpha})`;
    }
  }
};

let dataToBuildGraph = {};

let graphData = {
  labels: [],
  data: [],
};

let arrowFlag = "none";

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

const throttle = (func, wait) => {
  let waiting = false;
  return function () {
    if (waiting) {
      return;
    }

    waiting = true;
    setTimeout(() => {
      func.apply(this, arguments);
      waiting = false;
    }, wait);
  };
};

const onScroll = throttle(() => {
  if (Math.round((window.scrollY / body.offsetHeight) * 100) > 50) {
    if (btn_b.style.right !== "50px") {
      btn_b.style.right = "50px";
    }
  } else {
    if (btn_b.style.right !== "-50px") {
      btn_b.style.right = "-50px";
    }
  }
}, 100);

document.addEventListener("scroll", onScroll);

const graphConfig = (graphData) => {
  const data = {
    labels: graphData.labels,
    datasets: [
      {
        data: graphData.data,
        label: "Wyświetlenia",
        borderColor: "#d27303",
        fill: true,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: { reverse: true },
      },
    },
  };

  return config;
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
  const ctx = document.querySelector(".visitor_chart").getContext("2d");
  new Chart(ctx, graphConfig(graphData));
};

const createTextSummary = (users, period) => {
  const parsedUsers = {},
    perioidsToCompare = {};
  let iterable = Object.keys(users);
  iterable.forEach((item) => {
    let init = 0;
    if (users[item][0]) {
      const stuff = users[item].reduce((acc, curr) => acc + curr.y, init);
      parsedUsers[item] = stuff;
    }
  });
  if (period == "week") {
    perioidsToCompare.current = parsedUsers.week;
    perioidsToCompare.prev = parsedUsers.last_week;
  } else if (period === "month") {
    perioidsToCompare.current = parsedUsers.month;
    perioidsToCompare.prev = parsedUsers.last_month;
  }

  const trafficUp =
    perioidsToCompare.current > perioidsToCompare.prev ? true : false;
  const percent =
    (Math.abs(perioidsToCompare.current - perioidsToCompare.prev) /
      perioidsToCompare.current) *
    100;

  perioidsToCompare.current > perioidsToCompare.prev
    ? (arrowFlag = "up")
    : perioidsToCompare.current < perioidsToCompare.prev
    ? (arrowFlag = "down")
    : (arrowFlag = "none");

  //generate icon indicator
  const hasImgChild = summary_icon.lastElementChild.tagName === "IMG";
  if (hasImgChild) {
    summary_icon.removeChild(summary_icon.lastElementChild);
  }
  const image = document.createElement("img");
  summary_icon.appendChild(image);
  switch (arrowFlag) {
    case "up":
      image.src = "/public/assets/arrow_up.svg";
      break;
    case "down":
      image.src = "/public/assets/arrow_down.svg";
      break;
    case "none":
      image.src = "";
      break;
    default:
      break;
  }
  if (period !== "all") {
    return `Liczba wyświetleń w tym ${
      period == "week" ? "tygodniu" : "miesiącu"
    } to ${perioidsToCompare.current}. ${
      perioidsToCompare.current !== perioidsToCompare.prev
        ? `Ruch ${trafficUp ? "wzrósł" : "spadł"} o ${Math.abs(
            percent.toFixed(0)
          )}% w porównaniu z poprzednim ${
            period == "week" ? "tygodniem" : "miesiącem"
          }.`
        : "Tyle samo co w poprzednim tygodniu"
    }`;
  } else return ``;
};

const websitePerformance = () => {
  summary_text.textContent = createTextSummary(dataToBuildGraph, currentEvent);
};

const getDayOfWeek = (dateString) => {
  const dateParts = dateString.split("/");
  const day = dateParts[0];
  const month = dateParts[1];
  const year = dateParts[2];
  const date = year + "-" + month + "-" + day;
  const inputDate = new Date(date);
  const daysOfWeek = ["Ndz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sb"];
  const dayIndex = inputDate.getDay();

  return daysOfWeek[dayIndex];
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

      //building the graph initial
      graphBuilder();
      websitePerformance();
    })
    .catch((err) => console.error(err.message));
};

const fetchKeywords = (link) => {
  axios
    .get(link)
    .then((res) => {
      const data = res.data;
      google_placeholder.remove();
      data.forEach((item, id) => {
        const tr = document.createElement("tr");
        data_table.appendChild(tr);
        for (const [key, value] of Object.entries(item)) {
          const td = document.createElement("td");
          td.textContent = value;
          if (key !== "domain") {
            tr.appendChild(td);
          }
        }
      });
      const p = document.createElement("p");
      p.textContent = "Dane dotyczą ostatnich 30 dni";
      p.classList.add("info");
      google_container.appendChild(p);
    })
    .catch((err) => console.error(err.message));
};

let currentEvent = "week";
range.addEventListener("change", (e) => {
  currentEvent = e.target.value;
  while (chart_main.childElementCount > 1) {
    chart_main.removeChild(chart_main.lastChild);
  }
  if (currentEvent === "week") {
    createHoursGraph(dataToBuildGraph.week);
    graphData.data = dataToBuildGraph.week;
    graphData.labels = dataToBuildGraph.week.map((item) => item.x);
    graphBuilder();
    websitePerformance();
    range_title.innerText = "Ostatni tydzień";
  } else if (currentEvent === "month") {
    createHoursGraph(dataToBuildGraph.month);
    graphData.data = dataToBuildGraph.month;
    graphData.labels = dataToBuildGraph.month.map((item) => item.x);
    graphBuilder();
    websitePerformance();
    range_title.innerText = "Ostatni miesiąc";
  } else if (currentEvent === "all") {
    graphData.data = Object.fromEntries(
      Object.entries(dataToBuildGraph.monthly).reverse()
    );
    const keysArray = Object.keys(graphData.data);
    graphData.labels = keysArray.map((item) => item);
    graphBuilder();
    websitePerformance();
    range_title.innerText = "Cały czas";
  }
});
fetchKeywords(`https://admin.noanzo.pl/api/most-popular-keywords`);
fetchDates(`https://admin.noanzo.pl/dates`);
