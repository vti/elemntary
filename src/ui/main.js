import { createApp } from "vue";
import App from "./App.vue";
import "./main.css";

const app = createApp(App);

//const MockApi = require("./api/mock.js");
//app.provide("backend", new MockApi({ delay: 2000 }));
const ElectronApi = require("./api/electron.js");
app.provide("backend", new ElectronApi());

app.mount("#app");
