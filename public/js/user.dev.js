const btns = document.querySelectorAll(".btn_expand");
const btn_b = document.querySelector(".back_btn");

const body = document.querySelector("body");
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
