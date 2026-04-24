import { renderDisplayBlocks } from "./portfolio.js";

async function loadJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return await res.json();
}

function matchRoute(pathname) {
  if (pathname === "/") return { name: "home" };
  if (pathname === "/about") return { name: "about" };
  if (pathname === "/contact") return { name: "contact" };
  if (pathname === "/portfolio") return { name: "portfolioIndex" };

  const m = pathname.match(/^\/portfolio\/([^/]+)\/?$/);
  if (m) return { name: "portfolioDetail", slug: decodeURIComponent(m[1]) };

  return { name: "notFound" };
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

function renderSimplePage(container, title, body) {
  container.replaceChildren(
    el("h2", { className: "title", text: title }),
    el("p", { text: body })
  );
}

function renderNotFound(container) {
  renderSimplePage(container, "Not found", "That page doesn’t exist.");
}

function renderHome(container) {
  renderSimplePage(container, "Home", "Welcome.");
}

function renderAbout(container) {
  container.replaceChildren();
  container.appendChild(el("div", { className: "about-container" }));
  container.appendChild(el("img", { className: "headshot-image", attrs: { src: "/resources/img/headshot.jpeg" } }));
  container.appendChild(el("p", { className: "about-text", text: "I'm an artist and technologist based in New York City and Toronto. My practice of making art is a hybrid of traditional and digital media, often incorporating interactive elements and generative systems." }));
}

function renderContact(container) {
  renderSimplePage(container, "Contact", "Contact page content goes here.");
}

function renderWorkDetail(container, work) {
  container.replaceChildren();

  container.appendChild(el("h2", { className: "title", text: work.title ?? "Work" }));
  if (work.year) container.appendChild(el("p", { className: "display-block-year", text: String(work.year) }));
  if (work.materials) container.appendChild(el("p", { className: "display-block-materials", text: `Materials: ${work.materials}` }));
  if (work.imageSrc) {
    const img = el("img", {
      className: "content-container-main-image",
      attrs: { src: work.imageSrc.startsWith("/") ? work.imageSrc : `/${work.imageSrc}`, alt: work.imageAlt ?? work.title ?? "Work image" }
    });
    container.appendChild(img);
  }
  if (work.description) container.appendChild(el("p", { className: "display-block-description", text: work.description }));
}

async function renderRoute() {
  const container = document.getElementById("content-container-main");
  if (!container) return;

  const route = matchRoute(window.location.pathname);

  if (route.name === "home") return renderHome(container);
  if (route.name === "about") return renderAbout(container);
  if (route.name === "contact") return renderContact(container);

  if (route.name === "portfolioIndex") {
    const works = await loadJson("/resources/data/works.json");
    return renderDisplayBlocks(container, works);
  }

  if (route.name === "portfolioDetail") {
    const works = await loadJson("/resources/data/works.json");
    const work = works.find((w) => w.slug === route.slug);
    if (!work) return renderNotFound(container);
    return renderWorkDetail(container, work);
  }

  return renderNotFound(container);
}

function isInternalLeftClickNavigation(evt, a) {
  if (evt.defaultPrevented) return false;
  if (evt.button !== 0) return false;
  if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.altKey) return false;
  if (!a || !a.getAttribute) return false;
  if (a.target && a.target !== "_self") return false;

  const href = a.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("http:") || href.startsWith("https:") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("#")) return false;

  // Only intercept same-origin absolute paths like "/about".
  if (!href.startsWith("/")) return false;

  return true;
}

function setupSpaNavigation() {
  document.addEventListener("click", (evt) => {
    const a = evt.target?.closest?.("a");
    if (!isInternalLeftClickNavigation(evt, a)) return;

    evt.preventDefault();
    const href = a.getAttribute("href");
    if (href === window.location.pathname) return;

    history.pushState({}, "", href);
    renderRoute().catch((err) => console.error(err));
  });

  window.addEventListener("popstate", () => {
    renderRoute().catch((err) => console.error(err));
  });
}

setupSpaNavigation();
renderRoute().catch((err) => console.error(err));

