const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let tool = "brush";
let color = "#000000";
let size = 6;
let drawing = false;

let elements = [];
let undoStack = [];
let redoStack = [];
let current = null;

/* ===== CANVAS SETUP ===== */
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function getPos(e) {
  if (e.touches) e = e.touches[0];
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

/* ===== DRAW LOGIC ===== */
function start(e) {
  drawing = true;
  const p = getPos(e);

  if (tool === "brush" || tool === "eraser") {
    current = {
      type: "path",
      points: [p],
      color: tool === "eraser" ? "#ffffff" : color,
      size
    };
  } else {
    current = { type: tool, x1: p.x, y1: p.y, x2: p.x, y2: p.y, color, size };
  }
}

function move(e) {
  if (!drawing) return;
  e.preventDefault();
  const p = getPos(e);

  if (current.type === "path") {
    current.points.push(p);
  } else {
    current.x2 = p.x;
    current.y2 = p.y;
  }

  redraw();
  drawElement(current);
}

function end() {
  if (!drawing) return;
  drawing = false;
  elements.push(current);
  undoStack.push(JSON.stringify(elements));
  redoStack = [];
  current = null;
}

/* ===== RENDER ===== */
function drawElement(el) {
  ctx.strokeStyle = el.color;
  ctx.lineWidth = el.size;
  ctx.lineCap = "round";

  if (el.type === "path") {
    ctx.beginPath();
    el.points.forEach((p, i) =>
      i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)
    );
    ctx.stroke();
  }

  if (el.type === "rect") {
    ctx.strokeRect(el.x1, el.y1, el.x2 - el.x1, el.y2 - el.y1);
  }

  if (el.type === "circle") {
    const r = Math.hypot(el.x2 - el.x1, el.y2 - el.y1);
    ctx.beginPath();
    ctx.arc(el.x1, el.y1, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (el.type === "line") {
    ctx.beginPath();
    ctx.moveTo(el.x1, el.y1);
    ctx.lineTo(el.x2, el.y2);
    ctx.stroke();
  }
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elements.forEach(drawElement);
}

/* ===== EVENTS ===== */
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", end);
canvas.addEventListener("mouseleave", end);

canvas.addEventListener("touchstart", start, { passive: false });
canvas.addEventListener("touchmove", move, { passive: false });
canvas.addEventListener("touchend", end);

document.querySelectorAll("[data-tool]").forEach(btn => {
  btn.onclick = () => tool = btn.dataset.tool;
});

document.querySelectorAll(".palette span").forEach(c => {
  c.style.background = c.dataset.color;
  c.onclick = () => color = c.dataset.color;
});

document.getElementById("size").oninput = e => size = e.target.value;

document.getElementById("undo").onclick = () => {
  if (!undoStack.length) return;
  redoStack.push(JSON.stringify(elements));
  elements = JSON.parse(undoStack.pop());
  redraw();
};

document.getElementById("redo").onclick = () => {
  if (!redoStack.length) return;
  undoStack.push(JSON.stringify(elements));
  elements = JSON.parse(redoStack.pop());
  redraw();
};

/* ===== PDF EXPORT ===== */
document.getElementById("pdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("portrait", "px", "a4");

  const img = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = (canvas.height / canvas.width) * pageWidth;

  pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);
  pdf.save("adityas-doodle-space.pdf");
};
