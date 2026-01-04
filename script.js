const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let mode = "brush";
let color = "#000000";
let size = 6;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getPos(e) {
  if (e.touches) e = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function start(e) {
  drawing = true;
  const p = getPos(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
}

function move(e) {
  if (!drawing) return;
  e.preventDefault();

  const p = getPos(e);
  ctx.strokeStyle = mode === "eraser" ? "#ffffff" : color;
  ctx.lineWidth = size;
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function end() {
  drawing = false;
  ctx.closePath();
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", end);
canvas.addEventListener("mouseleave", end);

canvas.addEventListener("touchstart", start, { passive: false });
canvas.addEventListener("touchmove", move, { passive: false });
canvas.addEventListener("touchend", end);

document.getElementById("brush").onclick = () => mode = "brush";
document.getElementById("eraser").onclick = () => mode = "eraser";
document.getElementById("colorPicker").oninput = e => color = e.target.value;
document.getElementById("size").oninput = e => size = e.target.value;

document.getElementById("clear").onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

document.getElementById("pdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("portrait", "px", "a4");

  const img = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = (canvas.height / canvas.width) * pageWidth;

  pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);
  pdf.save("cloud-doodle.pdf");
};
