import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";

async function preguntar(texto: string, oculto = false): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  if (oculto) {
    // Muestra el texto de la pregunta, pero no lo que se escribe
    const interno = rl as unknown as { _writeToOutput: (s: string) => void };
    let preguntaMostrada = false;
    interno._writeToOutput = (s) => {
      if (!preguntaMostrada) {
        stdout.write(s);
        preguntaMostrada = true;
      }
    };
  }
  const respuesta = await rl.question(texto);
  rl.close();
  if (oculto) stdout.write("\n");
  return respuesta;
}

async function main() {
  const usuario = (await preguntar("Usuario: ")).trim().toLowerCase();
  if (!usuario) throw new Error("El usuario no puede ir vacío.");

  const contrasena = await preguntar(
    "Contraseña (mínimo 10 caracteres): ",
    true,
  );
  if (contrasena.length < 10)
    throw new Error("La contraseña debe tener al menos 10 caracteres.");
  const confirmacion = await preguntar("Repite la contraseña: ", true);
  if (contrasena !== confirmacion)
    throw new Error("Las contraseñas no coinciden.");

  const hashContrasena = await argon2.hash(contrasena);
  const existente = await prisma.usuario.findUnique({ where: { usuario } });

  if (existente) {
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: existente.id },
        data: { hashContrasena },
      }),
      prisma.sesion.deleteMany({ where: { usuarioId: existente.id } }),
    ]);
    console.log(
      `Contraseña de "${usuario}" actualizada. Se cerraron todas sus sesiones.`,
    );
  } else {
    await prisma.usuario.create({ data: { usuario, hashContrasena } });
    console.log(`Usuario "${usuario}" creado.`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
