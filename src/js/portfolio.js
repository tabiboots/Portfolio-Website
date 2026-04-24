async function loadJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Failed to load ${url} (${res.status})`);
  }
  return await res.json();
}

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

export function renderDisplayBlocks(container, works) {
  if (!container) throw new Error("renderDisplayBlocks: missing container");
  if (!Array.isArray(works)) throw new Error("renderDisplayBlocks: works must be an array");

  container.replaceChildren();

  for (const work of works) {
    const a = el("a", { className: "display-block", attrs: { href: work.href ?? "#" } });

    const imgContainer = el("div", { className: "display-block-image-container" });
    const img = el("img", {
      className: "content-container-main-image",
      attrs: {
        src: toRootPath(work.imageSrc),
        alt: work.imageAlt ?? work.title ?? "Portfolio work"
      }
    });
    imgContainer.appendChild(img);

    const textContainer = el("div", { className: "display-block-text-container" });
    textContainer.appendChild(el("p", { className: "display-block-title", text: work.title ?? "" }));
    textContainer.appendChild(el("p", { className: "display-block-year", text: work.year ?? "" }));
    textContainer.appendChild(
      el("p", {
        className: "display-block-materials",
        text: work.materials ? `Materials: ${work.materials}` : ""
      })
    );
    textContainer.appendChild(el("p", { className: "display-block-description", text: work.description ?? "" }));

    a.appendChild(imgContainer);
    a.appendChild(textContainer);

    container.appendChild(a);
  }
}

async function main() {
  const container = document.getElementById("content-container-main");
  if (!container) return;

  const works = await loadJson("/resources/data/works.json");
  renderDisplayBlocks(container, works);
}

main().catch((err) => {
  console.error(err);
});

