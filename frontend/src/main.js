import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/index.js";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(Toast, {
  position: "bottom-left",
  timeout: 3000,
});
app.mount("#app");
