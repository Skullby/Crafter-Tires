import { spawn } from "node:child_process";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const children = [];
let shuttingDown = false;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(1500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "pipe",
      shell: false,
      ...options
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || stdout || `Command failed with exit code ${code}`));
    });
  });
}

async function ensurePostgres() {
  const ready = await isPortOpen(5432);
  if (ready) {
    console.log("[local] PostgreSQL disponible en localhost:5432");
    return;
  }

  console.log("[local] PostgreSQL no responde en localhost:5432. Intentando iniciarlo...");

  if (os.platform() === "win32") {
    try {
      await runCommand(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          "$service = Get-Service *postgres* | Sort-Object Status -Descending | Select-Object -First 1; if (-not $service) { throw 'No se encontro servicio PostgreSQL'; }; if ($service.Status -ne 'Running') { Start-Service -Name $service.Name; Start-Sleep -Seconds 3 }; Write-Output $service.Name"
        ],
        { cwd: repoRoot }
      );
    } catch (error) {
      throw new Error(
        `No pude iniciar PostgreSQL automaticamente. Inicia el servicio manualmente y reintenta.\nDetalle: ${error.message}`
      );
    }
  } else {
    throw new Error(
      "PostgreSQL no responde en localhost:5432. Inicia tu servicio local antes de correr este comando."
    );
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (await isPortOpen(5432)) {
      console.log("[local] PostgreSQL iniciado correctamente.");
      return;
    }
    await wait(1000);
  }

  throw new Error("PostgreSQL no quedo disponible en localhost:5432.");
}

function spawnDevProcess(label, filter) {
  const child =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", `corepack pnpm --filter ${filter} dev`], {
          cwd: repoRoot,
          stdio: "inherit",
          env: process.env
        })
      : spawn("corepack", ["pnpm", "--filter", filter, "dev"], {
          cwd: repoRoot,
          stdio: "inherit",
          env: process.env
        });

  children.push(child);

  child.on("error", (error) => {
    if (shuttingDown) {
      return;
    }
    console.error(`[local] No pude iniciar ${label}: ${error.message}`);
    shutdown(1);
  });

  child.on("exit", (code) => {
    if (shuttingDown) {
      return;
    }

    if (code !== 0) {
      console.error(`[local] ${label} termino con codigo ${code}. Cerrando el resto.`);
      shutdown(code ?? 1);
    }
  });
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => {
    process.exit(exitCode);
  }, 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  await ensurePostgres();

  const storefrontRunning = await isPortOpen(3000);
  const adminRunning = await isPortOpen(3001);

  if (storefrontRunning) {
    console.log("[local] Storefront ya disponible en http://localhost:3000");
  } else {
    console.log("[local] Levantando storefront en http://localhost:3000");
    spawnDevProcess("storefront", "storefront");
  }

  if (adminRunning) {
    console.log("[local] Admin ya disponible en http://localhost:3001");
  } else {
    console.log("[local] Levantando admin en http://localhost:3001");
    spawnDevProcess("admin", "admin");
  }

  if (storefrontRunning && adminRunning) {
    console.log("[local] Ambos servicios ya estaban arriba.");
    return;
  }

  console.log("[local] Presiona Ctrl+C para detener ambos.");
}

main().catch((error) => {
  console.error(`[local] ${error.message}`);
  process.exit(1);
});
