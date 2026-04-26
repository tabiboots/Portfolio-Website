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
    mediaManifestPromise = null;
    return null;
  }
}

function getProjectMedia(work, mediaManifest) {
  const slug = work?.slug;
  if (!slug) return null;
  return mediaManifest?.projects?.[slug] ?? null;
}

function pickDetailImageSrc(work, projectMedia) {
  const coverUrl = projectMedia?.cover?.url;
  if (coverUrl) return coverUrl;
  return toRootPath(work?.imageSrc);
}

function inferMediaOrderToken(item) {
  const base = String(item?.displayName || item?.publicId || "").toLowerCase();
  const match = base.match(/^(\d+)/);
  const index = match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  return { index, base };
}

function getInterleavedMediaItems(projectMedia) {
  const galleryItems = Array.isArray(projectMedia?.gallery) ? projectMedia.gallery : [];
  if (!heroImageSrc && galleryItems.length === 0) return;

  const section = el("section", { className: "work-detail-gallery" });
  section.appendChild(el("h3", { className: "work-detail-gallery-title", text: `${work.title ?? "Work"} gallery` }));

  const carousel = el("div", { className: "work-detail-gallery-carousel" });
  const prevBtn = el("button", {
    className: "work-detail-gallery-nav",
    text: "←",
    attrs: { type: "button", "aria-label": "Previous gallery image" }
  });
  const nextBtn = el("button", {
    className: "work-detail-gallery-nav",
    text: "→",
    attrs: { type: "button", "aria-label": "Next gallery image" }
  });
  const track = el("div", { className: "work-detail-gallery-track" });

  const scrollByPage = (direction) => {
    const amount = Math.max(track.clientWidth * 0.8, 240);
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };
  prevBtn.addEventListener("click", () => scrollByPage(-1));
  nextBtn.addEventListener("click", () => scrollByPage(1));

  if (heroImageSrc) {
    const heroImg = el("img", {
      className: "work-detail-gallery-image",
      attrs: {
        src: heroImageSrc,
        alt: work.imageAlt ?? `${work.title ?? "Work"} hero image`
      }
    });
    track.appendChild(heroImg);
  }

  for (const item of mediaItems) {
    if (item.url === heroImageSrc) continue;
    const img = el("img", {
      className: "work-detail-gallery-image",
      attrs: {
        src: item.url,
        alt: work.imageAlt ?? `${work.title ?? "Work"} gallery image`
      }
    });
    track.appendChild(img);
  }

  carousel.appendChild(prevBtn);
  carousel.appendChild(track);
  carousel.appendChild(nextBtn);
  section.appendChild(carousel);
  container.appendChild(section);
}

export async function renderWorkDetail(container, work) {
  const mediaManifest = await loadMediaManifest();
  const projectMedia = getProjectMedia(work, mediaManifest);

  container.replaceChildren();

  container.appendChild(el("h2", { className: "work-detail-title", text: work.title ?? "Work" }));
  const detailImageSrc = pickDetailImageSrc(work, projectMedia);
  renderGallery(container, work, projectMedia, detailImageSrc);
  if (work.year) container.appendChild(el("p", { className: "work-detail-year", text: String(work.year) }));
  if (work.materials) container.appendChild(el("p", { className: "work-detail-materials", text: `Materials: ${work.materials}` }));
  if (work.description) container.appendChild(el("p", { className: "work-detail-description", text: work.description }));
}
