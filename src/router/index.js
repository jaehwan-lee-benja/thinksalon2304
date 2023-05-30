// @/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import ReadingView from "../views/ReadingView.vue";

const routes = [
{
path: "/reading",
name: "읽기모드",
component: ReadingView,
},
{
path: "/editing",
name: "편집모드",
component: () => import("../views/EditingView.vue"),
},
];

const router = createRouter({
history: createWebHistory(process.env.BASE_URL),
routes,
});

export default router;