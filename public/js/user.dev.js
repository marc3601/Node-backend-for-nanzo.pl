const btns = document.querySelectorAll(".btn_expand");
const btn_b = document.querySelector(".back_btn");
const chart_main = document.querySelector(".chart_container");
const placeholder = document.querySelector(".placeholder");
const range = document.querySelector(".range");
const body = document.querySelector("body");
const range_title = document.querySelector(".range-title");
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

function throttle(func, wait) {
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
}

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

let graphData = {
  labels: [],
  data: [],
};

const testRun = (param) => {
  axios
    .get(`https://admin.noanzo.pl/dates?range=${param}`)
    .then((res) => {
      graphData.data = res.data.reverse();
      const labelsDataRaw = res.data.map((item) => item.x);
      graphData.labels = labelsDataRaw.slice(0, 7);

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

      //building the graph
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
      const myChart = new Chart(ctx, config);
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
    if (window.innerWidth > 800) {
      chart_main.setAttribute("style", "min-height: 300px");
    }
    if (currentEvent === "week") {
      range_title.innerText = "Ostatni tydzień";
    } else if (currentEvent === "month") {
      range_title.innerText = "Ostatni miesiąc";
    }
    testRun(currentEvent);
  }
});
testRun("week");
