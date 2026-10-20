import fs from "node:fs";
import path from "node:path";

// Fast in-memory candidate cache with 30s TTL to prevent synchronous disk thrashing
let cachedCandidates = null;
let lastScanTime = 0;

try {
  const oxideModule = await import("@tailwindcss/oxide");
  const oxide = oxideModule.default || oxideModule;

  if (oxide && oxide.Scanner && !oxide.Scanner.__ryport_patched) {
    oxide.Scanner.__ryport_patched = true;
    const origScan = oxide.Scanner.prototype.scan;

    oxide.Scanner.prototype.scan = function () {
      const now = Date.now();
      if (cachedCandidates && now - lastScanTime < 30000) {
        return cachedCandidates;
      }

      const candidates = new Set(origScan ? origScan.call(this) : []);

      function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (
            entry.name === "node_modules" ||
            entry.name === ".next" ||
            entry.name === ".git" ||
            entry.name === "scratch"
          ) {
            continue;
          }
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(full);
          } else if (/\.(tsx|ts|jsx|js|html|css)$/.test(entry.name)) {
            const content = fs.readFileSync(full, "utf8");
            const words = content.match(/[a-zA-Z0-9_\-\/\[\]#:\.%]+/g) || [];
            for (const w of words) {
              if (w.length >= 2 && w.length <= 100) {
                candidates.add(w);
              }
            }
          }
        }
      }

      const rootDir = process.cwd();
      for (const d of ["app", "components", "staff", "lib"]) {
        walk(path.join(rootDir, d));
      }

      cachedCandidates = Array.from(candidates);
      lastScanTime = now;
      return cachedCandidates;
    };
  }
} catch {
  // Graceful fallback for non-patched environments
}

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
