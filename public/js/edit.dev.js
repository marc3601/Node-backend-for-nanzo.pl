const placeholder = document.querySelectorAll(".placeholder");
const placeholders = [...placeholder];
const fastEditButton = document.querySelector(".fast_edit_button");
const auction = document.querySelector(".auction");
const sucess = createElement("p", ["sucess"]);
let fastEditMode = false;
let changedPrices = [];
let pageData;
function createElement(
  elementType,
  classes = [],
  textContent = "",
  attributes = {}
) {
  const element = document.createElement(elementType);
  if (textContent) {
    element.textContent = textContent;
  }
  if (classes.length > 0) {
    element.classList.add(...classes);
  }
  for (const attribute in attributes) {
    element.setAttribute(attribute, attributes[attribute]);
  }
  return element;
}

function createAuctionBadge(image, title, price, id) {
  // Using the function to create elements and structure the HTML
  const auction_content = createElement("div", ["auction_content"]);
  const auction_image = createElement("div", ["auction_image"]);
  const img = createElement("img", [], "", {
    src: image,
  });
  const auction_text_section = createElement("div", ["auction_text_section"]);
  const auction_headline = createElement("div", ["auction_headline"]);
  const h2 = createElement("h2", [], title);
  const auction_price = createElement("div", ["auction_price"]);
  const p = createElement("p", ["price"], "Cena: ", {
    ["data-id"]: id,
    ["data-price"]: price,
  });
  const span = createElement("span", [], `${price} zł`);
  const auction_edit = createElement("div", ["auction_edit"]);
  const a = createElement("a", ["edit_button"], "Edytuj", {
    href: `/edit/editor?id=${id}`,
  });
  const parents = [
    auction,
    auction_content,
    auction_image,
    auction_content,
    auction_text_section,
    auction_headline,
    auction_text_section,
    auction_price,
    p,
    auction_text_section,
    auction_edit,
  ];

  const children = [
    auction_content,
    auction_image,
    img,
    auction_text_section,
    auction_headline,
    h2,
    auction_price,
    p,
    span,
    auction_edit,
    a,
  ];

  parents.forEach((item, i) => {
    item.appendChild(children[i]);
  });
}

function handlePriceUpdate() {
  const auction_price = [...document.querySelectorAll(".price")];
  auction_price.forEach((price) => {
    price.childNodes[1].remove();
    const input = createElement("input", ["price_input"], "", {
      type: "number",
      min: "0",
      max: "50000",
    });
    price.appendChild(input);
    input.value = price.attributes["data-price"].value;
    input.addEventListener("input", (e) => {
      let price_value = e.target.parentNode.attributes["data-price"].value;
      let auction_id = e.target.parentNode.attributes["data-id"].value;
      let parent = price.parentElement.parentElement.parentElement;
      let input_value = e.target.value < 50000 ? e.target.value : 50000;
      if (!parent.classList.contains("auction_content_edited")) {
        parent.classList.add("auction_content_edited");
      } else if (price_value === input_value) {
        parent.classList.remove("auction_content_edited");
      }
      const currentEntry = changedPrices.filter(
        (item) => item.id === auction_id
      );
      const isEdited = currentEntry.length > 0 ? true : false;
      if (!isEdited) {
        changedPrices.push({ id: auction_id, newPrice: input_value });
      } else {
        currentEntry[0].newPrice = input_value;
      }
    });
  });
}

function handleFastEditMode() {
  fastEditMode = !fastEditMode;
  const btn_title = document.querySelector(".btn_title").childNodes[1];
  if (fastEditMode) {
    btn_title.textContent = "Zapisz zmiany";
    handlePriceUpdate();
  } else {
    axios
      .post("/api/edit-price", changedPrices)
      .then(function (response) {
        changedPrices = [];
        btn_title.textContent = "Tryb szybkiej edycji cen";
        while (auction.firstChild) {
          auction.removeChild(auction.lastChild);
        }

        auction.appendChild(sucess);
        sucess.textContent = response.data;
        getData("/api/auctions");
      })
      .catch(function (error) {
        changedPrices = [];
        btn_title.textContent = "Tryb szybkiej edycji cen";
        while (auction.firstChild) {
          auction.removeChild(auction.lastChild);
        }
        auction.appendChild(sucess);
        sucess.textContent = error.message;
      });
  }
}

async function getData(url) {
  await axios
    .get(url)
    .then((res) => {
      if (placeholders) {
        placeholders.forEach((item) => {
          item.remove();
        });
      }

      pageData = res.data;
      pageData.forEach((item) => {
        let image = item.image.filter((img) => img.thumbnail === true);
        if (image.length === 0) {
          image = [item.image[0]];
        }
        createAuctionBadge(image[0].url, item.title, item.price, item._id);
      });
      if (!fastEditButton.style.visibility) {
        fastEditButton.style.visibility = "visible";
      }
    })
    .catch((err) => console.log(err));
}

fastEditButton.addEventListener("click", handleFastEditMode);
getData("/api/auctions");

document.querySelector(".search_button").addEventListener("click", (e) => {
  e.preventDefault();
});
