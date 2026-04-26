function el(tag, { className, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v != null) node.setAttribute(k, String(v));
    }
  }
  return node;
}

function toRootPath(path) {
  if (!path) return path;
  // Make "resources/..." work no matter what page we're on.
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

function inferResourceTypeFromUrl(url = "") {
  const normalized = String(url).toLowerCase();
  if (/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/.test(normalized)) return "video";
  return "image";
}

function createAutoplayMutedVideo({ className, src, ariaLabel }) {
  const video = document.createElement("video");
  if (className) video.className = className;
  video.src = src;
  video.autoplay = true;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.controls = false;
  video.setAttribute("aria-label", ariaLabel);
  video.setAttribute("muted", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");

  const tryPlay = () => {
    video.play().catch(() => {
      // Ignore blocked autoplay attempts.
    });
  };
  video.addEventListener("loadedmetadata", tryPlay, { once: true });

  return video;
}

let mediaManifestPromise = null;

async function loadMediaManifest() {
  if (!mediaManifestPromise) {
    mediaManifestPromise = fetch("/resources/data/works-media.json", {
      headers: { Accept: "application/json" }
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load works-media.json (${res.status})`);
      return await res.json();
    });
  }

  try {
    return await mediaManifestPromise;
  } catch {
    // Reset cache so a later retry can succeed.
    mediaManifestPromise = null;
    return null;
  }
}

function pickCardMedia(work, mediaManifest) {
  const slug = work?.slug;
  if (!slug || !mediaManifest?.projects) {
    const fallbackUrl = toRootPath(work?.imageSrc);
    return fallbackUrl
      ? { url: fallbackUrl, resourceType: inferResourceTypeFromUrl(fallbackUrl) }
      : null;
  }

  const project = mediaManifest.projects?.[slug];
  const cover = project?.cover;
  if (cover?.url) {
    return {
      url: cover.url,
      resourceType: cover.resourceType ?? inferResourceTypeFromUrl(cover.url)
    };
  }

  const firstVideo = Array.isArray(project?.videos) ? project.videos.find((item) => item?.url) : null;
  if (firstVideo?.url) {
    return { url: firstVideo.url, resourceType: "video" };
  }

  const fallbackUrl = toRootPath(work?.imageSrc);
  return fallbackUrl
    ? { url: fallbackUrl, resourceType: inferResourceTypeFromUrl(fallbackUrl) }
    : null;
}

export async function renderDisplayBlocks(container, works) {
  if (!container) throw new Error("renderDisplayBlocks: missing container");
  if (!Array.isArray(works)) throw new Error("renderDisplayBlocks: works must be an array");

  const mediaManifest = await loadMediaManifest();
  container.replaceChildren();

  for (const work of works) {
    const a = el("a", { className: "display-block", attrs: { href: work.href ?? "#" } });

    const imgContainer = el("div", { className: "display-block-image-container" });
    const cardMedia = pickCardMedia(work, mediaManifest);
    if (cardMedia?.resourceType === "video") {
      imgContainer.appendChild(
        createAutoplayMutedVideo({
          src: cardMedia.url,
          ariaLabel: work.imageAlt ?? work.title ?? "Portfolio work video"
        })
      );
    } else {
      const img = el("img", {
        attrs: {
          src: cardMedia?.url ?? "",
          alt: work.imageAlt ?? work.title ?? "Portfolio work"
        }
      });
      imgContainer.appendChild(img);
    }

    const textContainer = el("div", { className: "display-block-text-container" });
    textContainer.appendChild(el("p", { className: "display-block-title", text: work.title ?? "" }));
    textContainer.appendChild(el("p", { className: "display-block-year", text: work.year ?? "" }));

    a.appendChild(imgContainer);
    a.appendChild(textContainer);

    container.appendChild(a);
  }
}

