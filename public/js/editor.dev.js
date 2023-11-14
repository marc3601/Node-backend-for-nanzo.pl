const title = document.querySelector("#title");
const price = document.querySelector("#price");
const desc = document.querySelector("#description");
const characters = document.querySelector(".characters");
const deleteButton = document.getElementById("delete_auction");
const formData = new FormData();
let updatedAuction = {};

title.addEventListener("input", () => {
  updatedAuction.title = title.value;
  console.log(updatedAuction);
});

price.addEventListener("input", () => {
  updatedAuction.price = parseInt(price.value);
  console.log(updatedAuction);
});

// Handling description input
desc.addEventListener("input", () => {
  let length = desc.value.length;
  characters.innerText = length;
  if (length > 170) {
    if (!characters.classList.contains("alert_char")) {
      characters.classList.add("alert_char");
    }
  } else if (characters.classList.contains("alert_char")) {
    characters.classList.remove("alert_char");
  }

  updatedAuction.description = desc.value;
  console.log(updatedAuction);
});

//Price limit 50000
price.addEventListener("input", () => {
  if (price.value > 50000) {
    price.value = 50000;
  }
});

title.onchange = (e) => {
  formData.delete("title");
  formData.append("title", title.value);
};
price.onchange = (e) => {
  formData.delete("price");
  formData.append("price", price.value);
};
desc.onchange = (e) => {
  formData.delete("description");
  formData.append("description", description.value);
};

const body = document.body;
const auctionID = body.id;

const fetchAuctionState = (id) => {
  axios
    .get(`/api/auctions?id=${id}`)
    .then((res) => {
      updatedAuction = res.data[0];
    })
    .catch((err) => console.log(err));
};
const handleDelete = (e) => {
  const id = e.currentTarget.getAttribute("data-id");
  const consent = confirm("Czy napewno chcesz usunąć?");
  if (consent) {
    axios.post(`/api/edit?action=delete&id=${id}`).then((res) => {
      alert(res.data);
      window.location.href = "/edit";
    });
  } else {
    return;
  }
};
deleteButton.addEventListener("click", handleDelete);

fetchAuctionState(auctionID);
