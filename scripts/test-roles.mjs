import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();

async function readJson(path) {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

async function readText(path) {
  return readFile(join(root, path), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const rolesConfig = await readJson("Diseño WEB/data/roles.json");
const usersConfig = await readJson("Diseño WEB/data/usuarios-prueba.json");
const privateJs = await readText("Diseño WEB/js/private.js");
const supabaseService = await readText("Diseño WEB/js/supabase-service.js");

const expectedRoleRoutes = new Map([
  ["administradora", "admin"],
  ["caja", "caja"],
  ["cocinero", "cocina"],
  ["mesera", "mesera"]
]);

const roles = rolesConfig.rolesPrivados || [];
const users = usersConfig.usuarios || [];

assert(roles.length === expectedRoleRoutes.size, "La matriz de roles privados debe tener 4 roles.");
assert(users.length === expectedRoleRoutes.size, "La matriz de usuarios de prueba debe tener 4 actores.");

for (const [roleId, page] of expectedRoleRoutes) {
  const role = roles.find((item) => item.id === roleId);
  assert(role, `Falta el rol ${roleId} en roles.json.`);
  assert(role.ruta === `/${page}`, `El rol ${roleId} debe apuntar a /${page}.`);
  assert(privateJs.includes(`${roleId}: "${page}"`), `private.js no protege la ruta ${page} para ${roleId}.`);

  const user = users.find((item) => item.rol === roleId);
  assert(user, `Falta usuario de prueba para el rol ${roleId}.`);
  assert(user.ruta === `/${page}/`, `El usuario ${user.usuario} debe tener ruta /${page}/.`);
  assert(user.email?.includes("@"), `El usuario ${user.usuario} debe mapearse a un correo Auth.`);

  const pageHtml = await readText(`Diseño WEB/${page}/index.html`);
  assert(
    pageHtml.includes(`data-private-page="${page}"`),
    `La pagina ${page} debe declarar data-private-page="${page}".`
  );
  assert(
    pageHtml.includes('src="/js/private.js"'),
    `La pagina ${page} debe cargar el controlador privado.`
  );
}

assert(privateJs.includes("iniciarSesion(loginUser.email, password)"), "El login debe autenticarse con Supabase Auth.");
assert(privateJs.includes("await cargarPerfilActual()"), "Las rutas privadas deben validar la sesion activa en Supabase.");
assert(!privateJs.includes('mode: "demo"'), "El acceso privado no debe crear sesiones demo.");
assert(privateJs.includes("clearSession()"), "El login debe limpiar sesion ante errores de acceso.");
assert(
  supabaseService.includes(".from(\"perfiles\")") && supabaseService.includes("select(\"id,email,nombre,rol\")"),
  "La autorizacion debe leer el perfil interno con rol desde Supabase."
);

console.log("Pruebas de caja negra de roles: OK");
