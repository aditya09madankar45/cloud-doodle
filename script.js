const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;

let drawing = false;
let tool = "brush";
let color = "#000000";
let size = 5;

/* WHITE PAGE */
const page = {
  width: 600,
  height: 800,
  x: 0,
  y: 0
};

/* RESIZE */
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  page.x = (w - page.width) / 2;
  page.y = (h - page.height) / 2;

  drawBackground();
}
window.addEventListener("resize", resize);

/* DRAW BACKGROUND + PAGE */
function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // dark bg
  ctx.fillStyle = "#0b1f40";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // white page
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(page.x, page.y, page.width, page.height);
}

/* UTILS */
function insidePage(x, y) {
  return (
    x >= page.x &&
    x <= page.x + page.width &&
    y >= page.y &&
    y <= page.y + page.height
  );
}

function getPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

/* DRAWING */
canvas.addEventListener("pointerdown", e => {
  const p = getPos(e);
  if (!insidePage(p.x, p.y)) return;

  drawing = true;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  const p = getPos(e);
  if (!insidePage(p.x, p.y)) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = size;

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }

  ctx.lineTo(p.x, p.y);
  ctx.stroke();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;
  ctx.closePath();
  ctx.globalCompositeOperation = "source-over";
});

/* TOOLS */
document.getElementById("brush").onclick = () => tool = "brush";
document.getElementById("eraser").onclick = () => tool = "eraser";
document.getElementById("color").oninput = e => color = e.target.value;
document.getElementById("size").oninput = e => size = e.target.value;

document.getElementById("clear").onclick = () => {
  drawBackground();
};

/* PDF EXPORT — ONLY WHITE PAGE */
document.getElementById("pdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("portrait", "px", "a4");

  const temp = document.createElement("canvas");
  temp.width = page.width;
  temp.height = page.height;
  const tctx = temp.getContext("2d");

  tctx.drawImage(
    canvas,
    page.x,
    page.y,
    page.width,
    page.height,
    0,
    0,
    page.width,
    page.height
  );

  const img = temp.toDataURL("image/png");
  const pw = pdf.internal.pageSize.getWidth();
  const ph = (page.height / page.width) * pw;

  pdf.addImage(img, "PNG", 0, 0, pw, ph);
  pdf.save("cloud-doodle.pdf");
};

/* INIT */
resize();
