import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const directory = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/software-animations");
const frames = { ha: 6.8, zephyr: 6.8, gfx2: 6.8, esphome: 6.8, micropython: 4.8, sensecraft: 6.8 };
for (const [id, time] of Object.entries(frames)) {
  const frame = execFileSync("ffmpeg", ["-v", "error", "-ss", String(time), "-i", resolve(directory, `${id}.mp4`), "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], { maxBuffer: 10_000_000 });
  await sharp(frame).webp({ quality: 85 }).toFile(resolve(directory, `${id}.webp`));
}
console.log("Exported six static posters.");
