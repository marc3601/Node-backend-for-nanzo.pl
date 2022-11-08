const username = document.querySelector("#username");
const password = document.querySelector("#password");
const button = document.querySelector(".button");
const message = document.querySelector(".message");
const data = { username: "", password: "" };
let errorMsg = "";

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

button.addEventListener("click", (e) => {
  e.preventDefault();
  data.username = username.value;
  data.password = password.value;
  axios
    .post("/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      window.location = `/admin`;
    })
    .catch((err) => {
      let errCode = err.message.substring(err.message.length - 3);
      if (errCode === "404") {
        message.innerHTML = `${warning}<span class="alertzz">Błędny adres email.</span>`;
      } else if (errCode === "401") {
        message.innerHTML = `${warning}<span class="alertzz">Błędne hasło.</span>`;
      } else {
        message.innerHTML = `${warning}<span class="alertzz">Błąd, Spróbuj ponownie.</span>`;
      }
    });
});
