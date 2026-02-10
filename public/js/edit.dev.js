const placeholder = document.querySelectorAll(".placeholder");
const placeholders = [...placeholder];
const fastEditButton = document.querySelector(".fast_edit_button");
const promoteButton = document.querySelector(".promote_button");
const promoteInstruction = document.querySelector(".promote_instruction");
const auction = document.querySelector(".auction");

let fastEditMode = false;
let promoteMode = false;
let changedPrices = [];
let promotedAuctions = [];
let pageData;

/* -------------------- helpers -------------------- */

function createElement(
  elementType,
  classes = [],
  textContent = "",
  attributes = {}
) {
  const el = document.createElement(elementType);
  if (textContent !== null && textContent !== undefined) {
    el.textContent = textContent;
  }
  if (classes.length) el.classList.add(...classes);
  Object.entries(attributes).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/* message container */
const messageContainer = createElement("div", ["message_container"]);

function initMessageContainer() {
  const editMode = document.querySelector(".edit_mode");
  if (editMode && !document.querySelector(".message_container")) {
    editMode.insertAdjacentElement("afterend", messageContainer);
  }
}

function showMessage(text, isError = false) {
  messageContainer.innerHTML = "";
  const p = createElement("p", ["message_text"], text);
  if (isError) p.style.color = "#ad3100";
  messageContainer.appendChild(p);
  setTimeout(() => (messageContainer.innerHTML = ""), 2000);
}

/* -------------------- auction rendering -------------------- */

function createAuctionBadge(image, title, price, id, viewcount, promotion) {
  const card = createElement("div", ["auction_content"]);
  card.dataset.auctionId = id;

  /* promotion star */
  if (promotion > 0) {
    const star = createElement("div", ["promotion_star"]);
    star.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z"
          fill="#FFD700" stroke="#ad3100" stroke-width="1.5"/>
      </svg>
      <span class="promotion_number">${promotion}</span>
    `;
    card.appendChild(star);
  }

  /* image */
  const imgWrap = createElement("div", ["auction_image"]);
  const img = createElement("img", [], "", { src: image });

  if (img.complete) {
    img.classList.add("loaded");
  } else {
    img.addEventListener("load", () => img.classList.add("loaded"));
    img.addEventListener("error", () => img.classList.add("loaded"));
  }

  imgWrap.appendChild(img);

  /* text */
  const text = createElement("div", ["auction_text_section"]);
  const headline = createElement("div", ["auction_headline"]);
  headline.appendChild(createElement("h2", [], title));

  const priceBox = createElement("div", ["auction_price"]);
  const priceP = createElement("p", ["price"], "Cena: ", {
    "data-id": id,
    "data-price": price,
  });
  priceP.appendChild(createElement("span", [], `${price} zł`));

  const bottom = createElement("div", ["auction_bottom"]);
  const edit = createElement("div", ["auction_edit"]);
  edit.appendChild(
    createElement("a", ["edit_button"], "Edytuj", {
      href: `/edit/editor?id=${id}`,
    })
  );

  const views = createElement("div", ["auction_viewcount"]);
  views.appendChild(createElement("span", [], viewcount ?? 0));

  priceBox.appendChild(priceP);
  bottom.append(edit, views);
  text.append(headline, priceBox, bottom);

  card.append(imgWrap, text);
  auction.appendChild(card);

  card.addEventListener("click", handleAuctionClick);
}

/* -------------------- promotion -------------------- */

function handleAuctionClick(e) {
  if (!promoteMode) return;
  if (e.target.tagName === "A") e.preventDefault();

  const card = e.currentTarget;
  const id = card.dataset.auctionId;
  const index = promotedAuctions.indexOf(id);

  if (index !== -1) {
    promotedAuctions.splice(index, 1);
    card.classList.remove("promote_selected");
    card.querySelector(".promotion_badge")?.remove();
    updatePromotionBadges();
  } else {
    promotedAuctions.push(id);
    card.classList.add("promote_selected");
    card.appendChild(
      createElement("div", ["promotion_badge"], promotedAuctions.length)
    );
  }
}

function updatePromotionBadges() {
  document.querySelectorAll(".auction_content").forEach((card) => {
    const index = promotedAuctions.indexOf(card.dataset.auctionId);
    const badge = card.querySelector(".promotion_badge");
    if (badge && index !== -1) badge.textContent = index + 1;
  });
}

/* -------------------- fast edit -------------------- */

function handlePriceUpdate() {
  document.querySelectorAll(".price").forEach((price) => {
    price.lastChild?.remove();

    const input = createElement("input", ["price_input"], "", {
      type: "number",
      min: 0,
      max: 50000,
    });

    input.value = price.dataset.price;
    price.appendChild(input);

    input.addEventListener("input", (e) => {
      const value = Math.min(50000, e.target.value);
      const id = price.dataset.id;
      const card = price.closest(".auction_content");

      card.classList.toggle(
        "auction_content_edited",
        value !== price.dataset.price
      );

      const entry = changedPrices.find((p) => p.id === id);
      entry ? (entry.newPrice = value) : changedPrices.push({ id, newPrice: value });
    });
  });
}

/* -------------------- mode helpers -------------------- */

function disablePromoteModeUI() {
  promoteMode = false;
  promoteInstruction.classList.remove("active");
  promoteButton.querySelector(".btn_title p").textContent = "Promowanie";

  document.querySelectorAll(".auction_content").forEach((card) => {
    card.classList.remove("promote_mode", "promote_selected");
    card.querySelector(".promotion_badge")?.remove();
  });

  promotedAuctions = [];
}

function disableFastEditModeUI() {
  fastEditMode = false;
  changedPrices = [];
  fastEditButton.querySelector(".btn_title p").textContent = "Edycja cen";
}

/* -------------------- handlers -------------------- */

function handleFastEditMode() {
  if (promoteMode) disablePromoteModeUI();

  fastEditMode = !fastEditMode;

  if (fastEditMode) {
    fastEditButton.querySelector(".btn_title p").textContent = "Zapisz zmiany";
    promoteButton.disabled = true;
    handlePriceUpdate();
    return;
  }

  axios
    .post("/api/edit-price", changedPrices)
    .then((res) => {
      showMessage(res.data);
      disableFastEditModeUI();
      promoteButton.disabled = false;
      getData("/api/auctions");
    })
    .catch((err) => {
      showMessage(err.message, true);
      disableFastEditModeUI();
      promoteButton.disabled = false;
    });
}

function handlePromoteMode() {
  if (fastEditMode) disableFastEditModeUI();

  promoteMode = !promoteMode;

  if (promoteMode) {
    promoteButton.querySelector(".btn_title p").textContent = "Zapisz";
    promoteInstruction.classList.add("active");
    fastEditButton.disabled = true;

    document.querySelectorAll(".auction_content").forEach((c) =>
      c.classList.add("promote_mode")
    );
    return;
  }

  promoteButton.querySelector(".btn_title p").textContent = "Promowanie";
  promoteInstruction.classList.remove("active");
  fastEditButton.disabled = false;

  // Always send the request, even if empty array (to reset all promotions)
  axios
    .post("/api/promotion", { promotedIds: promotedAuctions })
    .then((res) => {
      showMessage(res.data.message);
      getData("/api/auctions");
    })
    .catch((err) =>
      showMessage(err.response?.data?.error || err.message, true)
    );

  disablePromoteModeUI();
}

/* -------------------- data -------------------- */

async function getData(url) {
  try {
    const res = await axios.get(url);

    placeholders.forEach((p) => p.remove());
    auction.innerHTML = "";

    pageData = res.data;
    pageData.forEach((item) => {
      const img = item.image.find((i) => i.thumbnail) ?? item.image[0];
      createAuctionBadge(
        img.url,
        item.title,
        item.price,
        item._id,
        item.viewcount ?? 0,
        item.promotion
      );
    });

    fastEditButton.style.visibility = "visible";
    promoteButton.style.visibility = "visible";
  } catch (err) {
    console.error(err);
  }
}

/* -------------------- init -------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initMessageContainer();
  fastEditButton.querySelector(".btn_title p").textContent = "Edycja cen";
});

fastEditButton.addEventListener("click", handleFastEditMode);
promoteButton.addEventListener("click", handlePromoteMode);
getData("/api/auctions");

document.querySelector(".search_button").addEventListener("click", (e) => {
  e.preventDefault();
});