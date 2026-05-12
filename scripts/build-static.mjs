import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "Diseño WEB");
const target = join(root, "dist", "web");

const activeDirs = [
  "admin",
  "caja",
  "cocina",
  "img",
  "login",
  "menu",
  "mesera",
  "orden"
];

const activeFiles = [
  "index.html",
  "css/menu.css",
  "data/productos.json",
  "data/roles.json",
  "data/usuarios-prueba.json",
  "js/menu.js",
  "js/order-page.js",
  "js/private.js",
  "js/supabase-config.js",
  "js/supabase-service.js"
];

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const entry of activeDirs) {
  await cp(join(source, entry), join(target, entry), { recursive: true });
}

for (const entry of activeFiles) {
  const output = join(target, entry);
  await mkdir(dirname(output), { recursive: true });
  await cp(join(source, entry), output);
}

console.log(`Static build ready: ${target}`);
