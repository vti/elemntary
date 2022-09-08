import { createApp } from "vue";
import App from "./App.vue";
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

app.mount("#app");
