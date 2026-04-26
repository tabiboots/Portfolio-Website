function el(tag, { className, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value != null) node.setAttribute(key, String(value));
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

function inferResourceTypeFromUrl(url = "") {
  const normalized = String(url).toLowerCase();
  if (/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/.test(normalized)) return "video";
  return "image";
}

function pickDetailHeroMedia(work, projectMedia) {
  const cover = projectMedia?.cover;
  if (cover?.url) {
    return {
      url: cover.url,
      resourceType: cover.resourceType ?? inferResourceTypeFromUrl(cover.url)
    };
  }

  const firstVideo = Array.isArray(projectMedia?.videos)
    ? projectMedia.videos.find((item) => item?.url)
    : null;
  if (firstVideo?.url) {
    return { url: firstVideo.url, resourceType: "video" };
  }

  const fallbackUrl = toRootPath(work?.imageSrc);
  if (!fallbackUrl) return null;
  return {
    url: fallbackUrl,
    resourceType: inferResourceTypeFromUrl(fallbackUrl)
  };
}

function inferMediaOrderToken(item) {
  const base = String(item?.displayName || item?.publicId || "").toLowerCase();
  const match = base.match(/^(\d+)/);
  const index = match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  return { index, base };
}

function compareMediaItems(a, b) {
  const tokenA = inferMediaOrderToken(a);
  const tokenB = inferMediaOrderToken(b);
  if (tokenA.index !== tokenB.index) return tokenA.index - tokenB.index;
  return tokenA.base.localeCompare(tokenB.base);
}

function getInterleavedMediaItems(projectMedia) {
  if (!projectMedia) return [];

  const imageItems = [
    ...(Array.isArray(projectMedia.gallery) ? projectMedia.gallery : []),
    ...(Array.isArray(projectMedia.process) ? projectMedia.process : [])
  ]
    .filter((item) => item?.url)
    .map((item) => ({ ...item, resourceType: "image" }));

  const videoItems = (Array.isArray(projectMedia.videos) ? projectMedia.videos : [])
    .filter((item) => item?.url)
    .map((item) => ({ ...item, resourceType: "video" }));

  return [...imageItems, ...videoItems].sort(compareMediaItems);
}

function createAutoplayMutedVideo({ className, src, ariaLabel }) {
  const video = document.createElement("video");
  if (className) video.className = className;
  video.src = src;
  video.controls = false;
  video.autoplay = true;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", ariaLabel);
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");

  // Some browsers still require an explicit play call.
  const tryPlay = () => {
    video.play().catch(() => {
      // Ignore: browser may still block based on user/device settings.
    });
  };
  video.addEventListener("loadedmetadata", tryPlay, { once: true });

  return video;
}

function renderGallery(container, work, projectMedia, heroMedia) {
  const mediaItems = getInterleavedMediaItems(projectMedia);
  if (!heroMedia?.url && mediaItems.length === 0) return;

  const section = el("section", { className: "work-detail-gallery" });

  const carousel = el("div", { className: "work-detail-gallery-carousel" });
  const prevBtn = el("button", {
    className: "work-detail-gallery-nav",
    text: "←",
    attrs: { type: "button", "aria-label": "Previous gallery item" }
  });
  const nextBtn = el("button", {
    className: "work-detail-gallery-nav",
    text: "→",
    attrs: { type: "button", "aria-label": "Next gallery item" }
  });
  const track = el("div", { className: "work-detail-gallery-track" });

  const scrollByPage = (direction) => {
    const amount = Math.max(track.clientWidth * 0.8, 240);
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  prevBtn.addEventListener("click", () => scrollByPage(-1));
  nextBtn.addEventListener("click", () => scrollByPage(1));

  if (heroMedia?.url) {
    if (heroMedia.resourceType === "video") {
      track.appendChild(
        createAutoplayMutedVideo({
          src: heroMedia.url,
          ariaLabel: `${work.title ?? "Work"} hero video`
        })
      );
    } else {
      track.appendChild(
        el("img", {
          attrs: {
            src: heroMedia.url,
            alt: work.imageAlt ?? `${work.title ?? "Work"} hero image`
          }
        })
      );
    }
  }

  for (const item of mediaItems) {
    if (item.url === heroMedia?.url) continue;

    if (item.resourceType === "video") {
      track.appendChild(
        createAutoplayMutedVideo({
          src: item.url,
          ariaLabel: `${work.title ?? "Work"} gallery video`
        })
      );
      continue;
    }

    track.appendChild(
      el("img", {
        attrs: {
          src: item.url,
          alt: work.imageAlt ?? `${work.title ?? "Work"} gallery image`
        }
      })
    );
  }

  carousel.appendChild(prevBtn);
  carousel.appendChild(track);
  carousel.appendChild(nextBtn);
  section.appendChild(carousel);
  container.appendChild(section);
}

function renderGalleryFlex(container, work, projectMedia, heroMedia) {
  const mediaItems = getInterleavedMediaItems(projectMedia);
  if (!heroMedia?.url && mediaItems.length === 0) return;

  const section = el("section", { className: "work-detail-gallery" });
  const flexGrid = el("div", { className: "work-detail-gallery-flex" });

  if (heroMedia?.url) {
    if (heroMedia.resourceType === "video") {
      flexGrid.appendChild(
        createAutoplayMutedVideo({
          src: heroMedia.url,
          ariaLabel: `${work.title ?? "Work"} hero video`
        })
      );
    } else {
      flexGrid.appendChild(
        el("img", {
          attrs: {
            src: heroMedia.url,
            alt: work.imageAlt ?? `${work.title ?? "Work"} hero image`
          }
        })
      );
    }
  }

  for (const item of mediaItems) {
    if (item.url === heroMedia?.url) continue;

    if (item.resourceType === "video") {
      flexGrid.appendChild(
        createAutoplayMutedVideo({
          src: item.url,
          ariaLabel: `${work.title ?? "Work"} gallery video`
        })
      );
      continue;
    }

    flexGrid.appendChild(
      el("img", {
        attrs: {
          src: item.url,
          alt: work.imageAlt ?? `${work.title ?? "Work"} gallery image`
        }
      })
    );
  }

  section.appendChild(flexGrid);
  container.appendChild(section);
}

// Alternate gallery renderer for future sections that need a
// simple wrapped flex layout instead of the carousel UI.
export async function renderWorkDetailGalleryFlex(container, work) {
  const mediaManifest = await loadMediaManifest();
  const projectMedia = getProjectMedia(work, mediaManifest);
  const detailHeroMedia = pickDetailHeroMedia(work, projectMedia);
  renderGalleryFlex(container, work, projectMedia, detailHeroMedia);
}

export async function renderWorkDetail(container, work) {
  const mediaManifest = await loadMediaManifest();
  const projectMedia = getProjectMedia(work, mediaManifest);

  container.replaceChildren();
  container.appendChild(el("h2", { className: "work-detail-title", text: work.title ?? "Work" }));

  const detailHeroMedia = pickDetailHeroMedia(work, projectMedia);
  if (work?.slug === "touchdesigner") {
    renderGalleryFlex(container, work, projectMedia, detailHeroMedia);
  } else {
    renderGallery(container, work, projectMedia, detailHeroMedia);
  }

  if (work.year) {
    container.appendChild(el("p", { className: "work-detail-year", text: String(work.year) }));
  }
  if (work.materials) {
    container.appendChild(
      el("p", {
        className: "work-detail-materials",
        text: `${work.materials}`
      })
    );
  }
  if (work.description) {
    container.appendChild(el("p", { className: "work-detail-description", text: work.description }));
  }
  if (work.externalUrl) {
    const actionLink = el("a", {
      className: "work-detail-action-link",
      text: work.externalLabel ?? "Open project",
      attrs: { href: work.externalUrl }
    });
    const actionWrapper = el("div", { className: "work-detail-actions" });
    actionWrapper.appendChild(actionLink);
    container.appendChild(actionWrapper);
  }
}
