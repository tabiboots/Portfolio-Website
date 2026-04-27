import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const source = path.join(root, "resources");
const destination = path.join(root, "dist", "resources");

await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true });

console.log("Copied resources/ to dist/resources/");
