import path from "path";

export function resolveResources(...fragments) {
  const mode = process.env.NODE_ENV || "production";

  if (mode === "production" && process.resourcesPath) {
    fragments.unshift("app");
    fragments.unshift(process.resourcesPath);
  }

  return path.resolve(...fragments);
}
