const title = document.querySelector("#title");
const price = document.querySelector("#price");
const desc = document.querySelector("#description");
const characters = document.querySelector(".characters");
const deleteButton = document.getElementById("delete_auction");
const submitButton = document.getElementById("submit_changes");
const deleteImageButton = document.querySelectorAll(".svg");
const body = document.body;
const auctionID = body.id;
let updatedAuction = {};

// Handling description input
desc.addEventListener("input", () => {
  let length = desc.value.length;
  characters.innerText = length;
  if (length > 1400) {
    if (!characters.classList.contains("alert_char")) {
      characters.classList.add("alert_char");
    }
  } else if (characters.classList.contains("alert_char")) {
    characters.classList.remove("alert_char");
  }
  updatedAuction.description = desc.value;
});

title.addEventListener("input", () => {
  updatedAuction.title = title.value;
});

price.addEventListener("input", () => {
  updatedAuction.price =
    parseInt(price.value) < 50000 ? parseInt(price.value) : 50000;
  if (price.value > 50000) {
    price.value = 50000;
  }
});

const isTextEmpty = (value) => {
  return /^\s*$/.test(value) ? true : false;
};

const validateInputs = () => {
  if (isTextEmpty(title.value)) {
    alert("Dodaj tutuł");
    return false;
  }
  if (isTextEmpty(price.value)) {
    alert("Dodaj cenę");
    return false;
  }
  if (isTextEmpty(desc.value)) {
    alert("Dodaj opis");
    return false;
  }
  return true;
};

const fetchAuctionState = (id) => {
  axios
    .get(`/api/auctions?id=${id}`)
    .then((res) => {
      updatedAuction = res.data[0];
    })
    .catch((err) => console.log(err));
};

const handleImageDelete = (e) => {
  const id = e.currentTarget.parentNode.id;
  const imagesCount =
    e.currentTarget.parentNode.parentNode.childElementCount - 1;

  if (imagesCount < 1) {
    alert("W ogłoszeniu musi być minimalnie jedno zdjęcie.");
  } else {
    const filteredImagesSmall = updatedAuction.image.filter(
      (item) => item.id !== id
    );
    const filteredImagesLarge = updatedAuction.imageLarge.filter(
      (item) => item.id !== id
    );
    updatedAuction.image = filteredImagesSmall;
    updatedAuction.imageLarge = filteredImagesLarge;
    e.currentTarget.parentNode.remove();
  }
};

const handleDelete = (e) => {
  const id = e.currentTarget.getAttribute("data-id");
  const consent = confirm("Czy napewno chcesz usunąć?");
  if (consent) {
    axios
      .post(`/api/edit?action=delete&id=${id}`)
      .then((res) => {
        alert(res.data);
        window.location.href = "/edit";
      })
      .catch((err) => alert("Wystąpił błąd"));
  } else {
    return;
  }
};

const handleSubmit = (e) => {
  const id = e.currentTarget.getAttribute("data-id");
  const validation = validateInputs();
  if (validation) {
    const consent = confirm("Czy napewno chcesz zapisać zmiany?");
    if (consent) {
      axios
        .post(`/api/edit?action=edit&id=${id}`, updatedAuction)
        .then((res) => {
          alert(res.data);
        })
        .catch((err) => alert("Wystąpił błąd"));
    } else {
      return;
    }
  }
};

deleteButton.addEventListener("click", handleDelete);
[...deleteImageButton].forEach((item) => {
  item.addEventListener("click", handleImageDelete);
});
submitButton.addEventListener("click", handleSubmit);
fetchAuctionState(auctionID);
