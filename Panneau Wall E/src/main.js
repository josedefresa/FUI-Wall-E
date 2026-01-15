import "./style.css";

const canvas = document.createElement("canvas");
canvas.width = 5760;
canvas.height = 1080;
// positionner le canvas pour que l'iframe puisse le recouvrir
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "1";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
