import { createApp } from "vue";
import App from "./App.vue";
import mitt from "mitt";
import "./main.css";

const app = createApp(App);

let backend;
if (process.env.VUE_APP_BACKEND == "Electron") {
  const ElectronApi = require("./api/electron.js");

  backend = new ElectronApi();
} else if (process.env.VUE_APP_BACKEND == "Mock") {
  const MockApi = require("./api/mock.js");

  backend = new MockApi({ delay: 2000 });
} else {
  console.log(`Unknown backend: ${process.env.VUE_APP_BACKEND}`);
}

app.provide("backend", backend);
app.provide("emitter", mitt());

app.provide("log", {
  info: (msg) => {
    window.electronAPI.log("info", msg);
  },
});

if (window.electronAPI) {
  window.electronAPI.onBodyCapture((event) => {
    const htmlToImage = require("html-to-image");

    htmlToImage
      .toPng(document.querySelectorAll("body")[0], {
        filter: (node) => node.tagName !== "NOSCRIPT",
      })
      .then((image) => {
        event.sender.send(
          "body-captured",
          String(image).replace(/^data:image\/\w+;base64,/, "")
        );
      });
  });
}

app.mount("#app");
