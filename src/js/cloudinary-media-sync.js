import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const ENV_PATH = path.join(PROJECT_ROOT, ".env");
const WORKS_PATH = path.join(PROJECT_ROOT, "resources", "data", "works.json");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "resources", "data", "works-media.json");
const PROJECT_FOLDER_OVERRIDES = {
  iteotwamtvwto: "iteotw",
  "keeping-reciepts": "keeping-receipts",
  "name-change-game": "new-york-name-change-game"
};

function parseDotEnv(contents) {
  const env = {};
  const lines = contents.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    env[key] = value.replace(/^['"]|['"]$/g, "");
  }
  return env;
}

async function loadLocalEnv() {
  try {
    const contents = await fs.readFile(ENV_PATH, "utf8");
    return parseDotEnv(contents);
  } catch {
    return {};
  }
}

function getEnv(name, fallback = {}) {
  const direct = process.env[name];
  if (direct && direct.trim()) return direct.trim();
  const fromFile = fallback[name];
  if (fromFile && fromFile.trim()) return fromFile.trim();
  return "";
}

function classifyAsset(assetFolder = "", publicId = "") {
  const source = `${assetFolder} ${publicId}`;
  if (source.includes("/images/cover") || source.includes("/photos/cover")) return "cover";
  if (source.includes("/images/gallery") || source.includes("/photos/gallery")) return "gallery";
  if (source.includes("/images/process") || source.includes("/photos/process")) return "process";
  if (source.includes("/videos")) return "videos";
  return "other";
}

function classifySharedAsset(assetFolder = "", publicId = "") {
  const source = `${assetFolder} ${publicId}`;
  if (source.includes("/logos/")) return "logos";
  if (source.includes("/icons/")) return "icons";
  if (source.includes("/social/")) return "social";
  return "other";
}

function cloudFolderFromSlug(slug) {
  return PROJECT_FOLDER_OVERRIDES[slug] ?? slug;
}

function toAssetRecord(asset) {
  return {
    publicId: asset.public_id,
    url: asset.secure_url,
    assetFolder: asset.asset_folder ?? null,
    displayName: asset.display_name ?? null,
    format: asset.format ?? null,
    width: asset.width ?? null,
    height: asset.height ?? null,
    bytes: asset.bytes ?? null,
    resourceType: asset.resource_type ?? null
  };
}

function sortAssetRecords(a, b) {
  const aKey = (a.displayName || a.publicId || "").toLowerCase();
  const bKey = (b.displayName || b.publicId || "").toLowerCase();
  return aKey.localeCompare(bKey);
}

async function fetchResourcesForAssetFolderPrefix({ assetFolderPrefix, resourceType }) {
  const all = [];
  let nextCursor;
  do {
    const result = await cloudinary.search
      .expression(`resource_type:${resourceType} AND asset_folder:${assetFolderPrefix}*`)
      .max_results(500)
      .next_cursor(nextCursor)
      .execute();
    all.push(...(result.resources ?? []));
    nextCursor = result.next_cursor;
  } while (nextCursor);
  return all;
}

async function fetchProjectAssets(slug) {
  const folder = cloudFolderFromSlug(slug);
  const prefix = `portfolio/${folder}/`;
  const [images, videos] = await Promise.all([
    fetchResourcesForAssetFolderPrefix({ assetFolderPrefix: prefix, resourceType: "image" }),
    fetchResourcesForAssetFolderPrefix({ assetFolderPrefix: prefix, resourceType: "video" })
  ]);

  const buckets = {
    cover: [],
    gallery: [],
    process: [],
    videos: [],
    other: []
  };

  for (const asset of [...images, ...videos]) {
    const key = classifyAsset(asset.asset_folder, asset.public_id);
    buckets[key].push(toAssetRecord(asset));
  }

  for (const key of Object.keys(buckets)) {
    buckets[key].sort(sortAssetRecords);
  }

  return {
    slug,
    cloudFolder: folder,
    folderPrefix: prefix,
    cover: buckets.cover[0] ?? null,
    gallery: buckets.gallery,
    process: buckets.process,
    videos: buckets.videos,
    other: buckets.other
  };
}

async function fetchSharedAssets() {
  const prefix = "shared/";
  const [images, videos] = await Promise.all([
    fetchResourcesForAssetFolderPrefix({ assetFolderPrefix: prefix, resourceType: "image" }),
    fetchResourcesForAssetFolderPrefix({ assetFolderPrefix: prefix, resourceType: "video" })
  ]);

  const buckets = {
    logos: [],
    icons: [],
    social: [],
    other: []
  };

  for (const asset of [...images, ...videos]) {
    const key = classifySharedAsset(asset.asset_folder, asset.public_id);
    buckets[key].push(toAssetRecord(asset));
  }

  for (const key of Object.keys(buckets)) {
    buckets[key].sort(sortAssetRecords);
  }

  return {
    folderPrefix: prefix,
    ...buckets
  };
}

async function main() {
  const localEnv = await loadLocalEnv();
  const cloudName = getEnv("CLOUDINARY_CLOUD_NAME", localEnv);
  const apiKey = getEnv("CLOUDINARY_API_KEY", localEnv);
  const apiSecret = getEnv("CLOUDINARY_API_SECRET", localEnv);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  const worksRaw = await fs.readFile(WORKS_PATH, "utf8");
  const works = JSON.parse(worksRaw);
  const slugs = works.map((w) => w.slug).filter(Boolean).sort();

  const media = {};
  for (const slug of slugs) {
    media[slug] = await fetchProjectAssets(slug);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    cloudName,
    projectFolderRoot: "portfolio",
    sharedFolderRoot: "shared",
    projects: media,
    shared: await fetchSharedAssets()
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
