const main = document.querySelector("main");
const button = document.querySelector(".button");
const imagefile = document.querySelector("#files");
const title = document.querySelector("#title");
const price = document.querySelector("#price");
const desc = document.querySelector("#description");
const response = document.querySelector(".response");
const progress = document.getElementById("progress");
// const logout = document.querySelector(".logout");
const cards = document.getElementsByClassName("card");
const images = document.getElementsByTagName("img");
const characters = document.querySelector(".characters");
const thumbInfo = document.querySelector(".thumbzz");
const gifFile = document.querySelector("#gif");
const gifMenu = document.querySelector(".gif_menu");
const gifShow = document.querySelector(".gif_icon_show");
const gifHide = document.querySelector(".gif_icon_hide");
const deleteMenu = document.querySelector(".delete_menu");
const deleteShow = document.querySelector(".delete_icon_show");
const deleteHide = document.querySelector(".delete_icon_hide");
const deleteContainer = document.querySelector(".delete_container");
const loadingAlert = document.querySelector(".loading_alert");
const gifBcg = document.querySelector(".gif_background");
const userCount = document.querySelector(".data_count");
const formData = new FormData();
let progressValue = 0;
let totalSize = 0;
let auctionsData = [];
const config = {
  onUploadProgress: (progressEvent) => {
    progressValue = Math.round((progressEvent.loaded / totalSize) * 100);
    progress.value = isFinite(progressValue) ? progressValue : 0;
    response.innerText = `Przesłano ${progressValue} %`;
    if (document.hidden && progressValue > 0) {
      document.title = `Przesłano ${progressValue} % - admin.noanzo.pl`;
    } else {
      document.title = "Nowe ogloszenie - admin.noanzo.pl";
    }
    if (progressValue >= 100) {
      response.innerText = "Trwa przetwarzanie...";
    }
  },
};

const calculateMargin = () => {
  let widthParent = deleteMenu.offsetWidth / 2;
  let widthChild = deleteContainer.offsetWidth;
  let margin = (widthParent - widthChild) / 2;
  return margin.toFixed();
};
if (window.innerWidth > 550) {
  deleteContainer.style = `margin-left: ${calculateMargin()}px`;
}

window.onresize = (e) => {
  if (window.innerWidth > 550) {
    deleteContainer.style = `margin-left: ${calculateMargin()}px`;
  } else {
    deleteContainer.removeAttribute("style");
  }
};
// Pass auction.image into that function
const handleDeleteThumbnail = (data) => {
  const filtered = data.filter((item) => item.thumbnail === true);
  if (filtered?.length > 0) {
    return filtered[0]?.url;
  } else {
    return data[0]?.url;
  }
};

const handleDelete = (e) => {
  let id = e.currentTarget.parentElement.id;
  axios
    .get(`http://localhost:8080/delete?id=${id}`)
    .then((res) => {
      console.log(res);
      handleAuctionsDataFetch();
    })
    .catch((err) => console.log(err));
};

const handleAuctionsDataFetch = () => {
  deleteContainer.innerHTML = `<p style="padding-left:10px">Ładowanie ogłoszeń</p>`;
  axios
    .get("http://localhost:8080/api/auctions")
    .then((res) => (auctionsData = res.data))
    .finally(() => {
      if (auctionsData.length > 0) {
        deleteContainer.innerHTML = `<ul>${auctionsData
          .map((auction, i) => {
            return `<li class=${i % 2 === 0 ? "light_item" : "dark_item"} id=${
              auction.id
            }><div><img width="50px" src=${handleDeleteThumbnail(
              auction.image
            )}/><p>${
              auction.title
            }</p></div><div class="delete_item">${deleteIcon}</div><li>`;
          })
          .join("")}<ul>`;
        const deleteHandler = document.querySelectorAll(".delete_item");
        const arr = Array.from(deleteHandler);
        arr.forEach((item) => item.addEventListener("click", handleDelete));
      } else {
        deleteContainer.innerHTML = `<p style="padding-left:10px">Nic tu nie ma!</p>`;
      }
    })
    .catch((err) => console.log(err));
};

// Gif menu handler
gifShow.addEventListener("click", () => {
  if (deleteMenu.classList.contains("delete_menu_show")) {
    main.style = "overflow-x: hidden";
    deleteMenu.classList.remove("delete_menu_show");
    gifBcg.classList.add("background_hidden");
  }
  if (!gifMenu.classList.contains("gif_menu_show")) {
    main.style = "overflow:hidden";
    gifMenu.classList.add("gif_menu_show");
    gifBcg.classList.remove("background_hidden");
  }
});
gifHide.addEventListener("click", () => {
  if (gifMenu.classList.contains("gif_menu_show")) {
    main.style = "overflow-x: hidden";
    gifMenu.classList.remove("gif_menu_show");
    gifBcg.classList.add("background_hidden");
  }
});

deleteShow.addEventListener("click", () => {
  if (gifMenu.classList.contains("gif_menu_show")) {
    main.style = "overflow-x: hidden";
    gifMenu.classList.remove("gif_menu_show");
    gifBcg.classList.add("background_hidden");
  }
  if (!deleteMenu.classList.contains("delete_menu_show")) {
    if (auctionsData.length === 0) {
      handleAuctionsDataFetch();
    }

    main.style = "overflow:hidden";
    deleteMenu.classList.add("delete_menu_show");
    gifBcg.classList.remove("background_hidden");
  }
});
deleteHide.addEventListener("click", () => {
  if (deleteMenu.classList.contains("delete_menu_show")) {
    main.style = "overflow-x: hidden";
    deleteMenu.classList.remove("delete_menu_show");
    gifBcg.classList.add("background_hidden");
  }
});

const checkmark = `<span style="margin-right: 10px;"><svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24"><path style="fill:green;" d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.393 7.5l-5.643 5.784-2.644-2.506-1.856 1.858 4.5 4.364 7.5-7.643-1.857-1.857z"/></svg></span>`;

const warning = `<span><?xml version="1.0" encoding="iso-8859-1"?>
<!-- Generator: Adobe Illustrator 18.1.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="30px" x="30px" y="20px"
   viewBox="0 0 320.83 320.83" style="enable-background:new 0 0 20 20;" xml:space="preserve">
<g>
  <g>
      <path style="fill:red;" d="M180.494,39.687l-1.333-1.327c-5.009-5.015-11.667-7.772-18.754-7.772
          c-7.082,0-13.739,2.758-18.748,7.767l-1.333,1.333L5.551,256.847c-5.466,6.413-7.016,14.196-4.112,21.207
          c3.16,7.631,10.704,12.189,20.173,12.189h277.604c9.475,0,17.013-4.558,20.173-12.189c2.904-7.011,1.354-14.8-4.112-21.207
          L180.494,39.687z M43.484,257.614L160.413,69.221l116.934,188.393H43.484z"/>
      <path style="fill:#010002;" d="M143.758,122.002v71.388c0,9.197,7.457,16.654,16.654,16.654s16.654-7.457,16.654-16.654v-71.388
          c0-9.197-7.457-16.654-16.654-16.654C151.215,105.347,143.758,112.804,143.758,122.002z"/>
      <circle style="fill:#010002;" cx="160.244" cy="234.906" r="16.486"/>
  </g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg></span>`;

const deleteIcon = `
<svg  viewBox="0 0 512 512" width="30px" xmlns="http://www.w3.org/2000/svg"><path d="m256 0c-141.164062 0-256 114.835938-256 256s114.835938 256 256 256 256-114.835938 256-256-114.835938-256-256-256zm0 0" fill="#f44336"/><path d="m350.273438 320.105469c8.339843 8.34375 8.339843 21.824219 0 30.167969-4.160157 4.160156-9.621094 6.25-15.085938 6.25-5.460938 0-10.921875-2.089844-15.082031-6.25l-64.105469-64.109376-64.105469 64.109376c-4.160156 4.160156-9.621093 6.25-15.082031 6.25-5.464844 0-10.925781-2.089844-15.085938-6.25-8.339843-8.34375-8.339843-21.824219 0-30.167969l64.109376-64.105469-64.109376-64.105469c-8.339843-8.34375-8.339843-21.824219 0-30.167969 8.34375-8.339843 21.824219-8.339843 30.167969 0l64.105469 64.109376 64.105469-64.109376c8.34375-8.339843 21.824219-8.339843 30.167969 0 8.339843 8.34375 8.339843 21.824219 0 30.167969l-64.109376 64.105469zm0 0" fill="#fafafa"/></svg>        
`;
imagefile.onchange = (e) => {
  formData.delete("image");
  let files = [...e.target.files];
  files.length > 0
    ? thumbInfo.classList.remove("thumbzz_hidden")
    : thumbInfo.classList.add("thumbzz_hidden");
  for (let item of files) {
    formData.append("image", item);
  }
  Array.from(cards).forEach((card) => {
    card.remove();
  });
  Array.from(images).forEach((image) => {
    image.remove();
  });
  if (files) {
    Array.from(files).forEach((file, i) => {
      const imgContainer = document.createElement("div");
      const imga = document.createElement("img");
      const url = URL.createObjectURL(file);
      imga.setAttribute("src", url);
      imga.classList.add("preview");
      document.querySelector(".images").appendChild(imgContainer);
      imgContainer.setAttribute("id", i);
      imgContainer.classList.add("card");
      imgContainer.appendChild(imga);
      imgContainer.addEventListener("click", (e) => {
        thumbInfo.classList.add("thumbzz_hidden");
        document
          .querySelectorAll(".card")
          .forEach((item) => item.classList.remove("border"));
        e.currentTarget.classList.add("border");
        formData.delete("thumbnail");
        formData.append("thumbnail", file.name);
      });
    });
  }
};
gifFile.onchange = (e) => {
  formData.delete("gif");
  let file = [...e.target.files][0];
  formData.append("gif", file);
};

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
});
price.addEventListener("input", () => {
  if (price.value > 50000) {
    price.value = 50000;
  }
});

document.addEventListener("visibilitychange", (e) => {
  if (document.hidden && progressValue > 0 && progressValue < 100) {
    document.title = `Przesłano ${progressValue} %`;
  } else {
    document.title = "Nowe ogloszenie - admin.noanzo.pl";
  }
});

// logout.addEventListener("click", (e) => {
//     e.preventDefault();
//     axios.get("/logout",{withCredentials: true}).then((res) =>  window.location=`/`).catch(err => console.log(err));
// })

button.addEventListener("click", (e) => {
  e.preventDefault();
  const isTitle = formData.getAll("title")[0]
    ? /^\s*$/.test(formData.getAll("title")[0])
      ? false
      : true
    : false;
  const isPrice = formData.getAll("price")[0] ? true : false;
  const isDesc = formData.getAll("description")[0]
    ? /^\s*$/.test(formData.getAll("description")[0])
      ? false
      : true
    : false;
  const isImage = formData.getAll("image").length > 0 ? true : false;
  const imagesCount = formData.getAll("image").length;
  const checklist = () => {
    const items = [isTitle, isPrice, isDesc, isImage, imagesCount];
    let response = "";
    items.forEach((item, i) => {
      if (!item && i === 2) {
        response = "Wpisz opis ogłoszenia";
      }
      if (!item && i === 1) {
        response = "Wpisz cenę";
      }
      if (!item && i === 0) {
        response = "Wpisz tytuł ogłoszenia";
      }
      if (!item && i === 3) {
        response = "Wybierz zdjęcia";
      }
      if (item > 10 && i === 4) {
        response = "Wybierz maksymalnie 10 zdjęć";
      }
    });
    return response;
  };
  if (isTitle && isPrice && isDesc && isImage && imagesCount <= 10) {
    response.innerText = "";
    progress.value = "0";
    button.setAttribute("disabled", true);
    imagefile.setAttribute("disabled", true);
    title.setAttribute("disabled", true);
    price.setAttribute("disabled", true);
    desc.setAttribute("disabled", true);
    formData.getAll("image")?.forEach((element) => {
      totalSize += element.size;
    });
    axios
      .post("/upload", formData, config, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        response.innerHTML =
          res.data !== "Jesteś niezalogowany"
            ? `${checkmark}  ${res.data}`
            : `${warning}  ${res.data}`;
        totalSize = 0;
        button.removeAttribute("disabled");
        imagefile.removeAttribute("disabled");
        title.removeAttribute("disabled");
        price.removeAttribute("disabled");
        desc.removeAttribute("disabled");
        handleAuctionsDataFetch();
      })
      .catch((err) => {
        console.log(err);
        response.innerHTML = `${warning} Błąd. Spróbuj ponownie.`;
        button.removeAttribute("disabled");
        imagefile.removeAttribute("disabled");
        title.removeAttribute("disabled");
        price.removeAttribute("disabled");
        desc.removeAttribute("disabled");
      });
  } else {
    response.innerHTML = `${warning}<span class="alertzz">${checklist()}</span>`;
  }
});
