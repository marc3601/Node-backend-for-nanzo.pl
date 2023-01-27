const btns = document.querySelectorAll(".btn_expand");
const btn_b = document.querySelector(".back_btn");
const chart_main = document.querySelector(".chart_container");
const placeholder = document.querySelector(".placeholder");
const range = document.querySelector(".range");
const body = document.querySelector("body");
const range_title = document.querySelector(".range-title");
const summary_text = document.querySelector(".summary_text");
const summary_icon = document.querySelector(".summary_icon");

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
    const stuff = users[item].reduce((acc, curr) => acc + curr.y, init);
    parsedUsers[item] = stuff;
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
};

const websitePerformance = () => {
  summary_text.textContent = createTextSummary(dataToBuildGraph, currentEvent);
};

const fetchData = (link) => {
  axios
    .get(link)
    .then((res) => {
      dataToBuildGraph = res.data;
      dataToBuildGraph.month.reverse();
      graphData.data = dataToBuildGraph.week.reverse();
      graphData.labels = dataToBuildGraph.week.map((item) => item.x);

      //building the graph initial
      graphBuilder();
      websitePerformance();
    })
    .catch((err) => console.error(err.message));
};

let currentEvent = "week";
range.addEventListener("click", (e) => {
  if (currentEvent !== e.target.value) {
    currentEvent = e.target.value;
    while (chart_main.childElementCount > 1) {
      chart_main.removeChild(chart_main.lastChild);
    }
    if (currentEvent === "week") {
      graphData.data = dataToBuildGraph.week;
      graphData.labels = dataToBuildGraph.week.map((item) => item.x);
      graphBuilder();
      websitePerformance();
      range_title.innerText = "Ostatni tydzień";
    } else if (currentEvent === "month") {
      graphData.data = dataToBuildGraph.month;
      graphData.labels = dataToBuildGraph.month.map((item) => item.x);
      graphBuilder();
      websitePerformance();
      range_title.innerText = "Ostatni miesiąc";
    }
  }
});
fetchData(`https://admin.noanzo.pl/dates`);
