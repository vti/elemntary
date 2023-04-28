import { createApp } from "vue";
import { createI18n } from "vue-i18n";
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

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  // We load them later
  messages: {},
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

  window.electronAPI.onLocaleChange(async (event, newLocale) => {
    const messages = await import(`../messages/${newLocale}.json`);

    i18n.global.setLocaleMessage(newLocale, messages);
    i18n.global.locale = newLocale;
  });
}

app.use(i18n);

app.mount("#app");
