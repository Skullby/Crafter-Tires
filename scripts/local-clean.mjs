import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

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

async function getWindowsPids() {
  const powershellScript = [
    "$ports = @(3000,3001)",
    "$portPids = @()",
    "foreach ($port in $ports) {",
    "  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess",
    "  if ($conns) { $portPids += $conns }",
    "}",
    "$cmdPids = Get-CimInstance Win32_Process | Where-Object { ($_.CommandLine -like '*pnpm*--filter storefront dev*') -or ($_.CommandLine -like '*pnpm*--filter admin dev*') -or ($_.CommandLine -like '*next dev -p 3000*') -or ($_.CommandLine -like '*next dev -p 3001*') } | Select-Object -ExpandProperty ProcessId",
    "$all = @($portPids + $cmdPids) | Where-Object { $_ } | Sort-Object -Unique",
    "if (-not $all -or $all.Count -eq 0) { Write-Output 'NO_PROCESSES' } else { Write-Output ($all -join ',') }"
  ].join("; ");

  const result = await runCommand("powershell.exe", ["-NoProfile", "-Command", powershellScript], {
    cwd: repoRoot
  });

  const output = result.stdout.trim();
  if (!output || output === "NO_PROCESSES") {
    return [];
  }

  return output
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
}

async function killWindowsPid(pid) {
  try {
    await runCommand("taskkill.exe", ["/PID", String(pid), "/T", "/F"], { cwd: repoRoot });
  } catch (error) {
    const message = String(error.message ?? "");
    if (message.includes("not found") || message.includes("no running instance") || message.includes("not valid")) {
      return;
    }
    throw error;
  }
}

async function main() {
  if (os.platform() !== "win32") {
    console.log("local:clean solo esta implementado para Windows en este repo.");
    return;
  }

  const pids = await getWindowsPids();

  if (pids.length === 0) {
    console.log("NO_PROCESSES");
    return;
  }

  for (const pid of pids) {
    await killWindowsPid(pid);
  }

  console.log(`STOPPED=${pids.join(",")}`);
}

main().catch((error) => {
  console.error(`[local:clean] ${error.message}`);
  process.exit(1);
});
