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

function pickCoverUrl(work, mediaManifest) {
  const slug = work?.slug;
  if (!slug || !mediaManifest?.projects) return toRootPath(work?.imageSrc);

  const coverUrl = mediaManifest.projects?.[slug]?.cover?.url;
  if (coverUrl) return coverUrl;

  return toRootPath(work?.imageSrc);
}

export async function renderDisplayBlocks(container, works) {
  if (!container) throw new Error("renderDisplayBlocks: missing container");
  if (!Array.isArray(works)) throw new Error("renderDisplayBlocks: works must be an array");

  const mediaManifest = await loadMediaManifest();
  container.replaceChildren();

  for (const work of works) {
    const a = el("a", { className: "display-block", attrs: { href: work.href ?? "#" } });

    const imgContainer = el("div", { className: "display-block-image-container" });
    const img = el("img", {
      className: "content-container-main-image",
      attrs: {
        src: pickCoverUrl(work, mediaManifest),
        alt: work.imageAlt ?? work.title ?? "Portfolio work"
      }
    });
    imgContainer.appendChild(img);

    const textContainer = el("div", { className: "display-block-text-container" });
    textContainer.appendChild(el("p", { className: "display-block-title", text: work.title ?? "" }));
    textContainer.appendChild(el("p", { className: "display-block-year", text: work.year ?? "" }));

    a.appendChild(imgContainer);
    a.appendChild(textContainer);

    container.appendChild(a);
  }
}

