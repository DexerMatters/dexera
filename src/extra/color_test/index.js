import { useEffect, useRef } from "react";
import { Flex, Heading } from "rebass";

let record = [0, 0, 0];
let min = 180;

export default function ColorTestPage() {
  const canvasRef = useRef(null)
  useEffect(() => {
    record = [0, 0, 0];
    let min = 180;
    const cvs = canvasRef.current;
    const ctx = cvs.getContext('2d');
    let count = 5;
    let [cx, cy, d, ...drgb] = spawn(ctx, count, 180);
    cvs.addEventListener("click", (e) => {
      console.log(min, record);
      if (cx === Math.floor(e.offsetX / (ctx.canvas.width / count))
        && cy === Math.floor(e.offsetY / (ctx.canvas.height / count))) {
        if (Math.abs(d) <= min) {
          min = Math.abs(d);
          record = drgb;
        }
      }
      [cx, cy, d, ...drgb] = spawn(ctx, count, min + 10);
    })
  });
  return <Flex
    width='100vw'
    height='100vh'
    flexDirection='column'
    alignItems='center'
  >
    <Heading p={3}>颜色测试</Heading>
    <canvas ref={canvasRef} width='500px' height='500px' />
  </Flex>
}

function spawn(ctx, count, d) {
  const cx = Math.floor(Math.random() * count);
  const cy = Math.floor(Math.random() * count);
  let diff = d + 35 * (Math.random() - 0.8);
  diff = diff <= 1 ? 1 : diff;
  const h = Math.random() * 360;
  const s = 100;
  const l = 50;
  const bsize = ctx.canvas.width / count;
  for (let y = 0; y < count; y++)
    for (let x = 0; x < count; x++) {
      if (x === cx && y === cy)
        ctx.fillStyle = hslToHex(h + diff, s, l);
      else
        ctx.fillStyle = hslToHex(h, s, l);
      ctx.fillRect(x * bsize, y * bsize, bsize - 3, bsize - 3);
    }
  let [r, g, b] = hslToRgb(h / 360, 1, 0.5);
  let [r_, g_, b_] = hslToRgb((h + diff) / 360, 1, 0.5);
  return [cx, cy, diff
    , Math.abs(r - r_)
    , Math.abs(g - g_)
    , Math.abs(b - b_)];
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}