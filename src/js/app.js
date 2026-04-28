import "../css/style.scss";
import { renderDisplayBlocks } from "./portfolio.js";
import { renderWorkDetail } from "./render-work-detail.js";

// #region agent log
fetch('http://127.0.0.1:7760/ingest/dead568a-e924-44e1-a77e-d89ab58e887f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fc50e'},body:JSON.stringify({sessionId:'6fc50e',runId:'pre-fix-1',hypothesisId:'H3',location:'src/js/app.js:5',message:'app.js module executed',data:{pathname:window.location.pathname},timestamp:Date.now()})}).catch(()=>{});
// #endregion

async function loadJson(url) {
  // #region agent log
  fetch('http://127.0.0.1:7760/ingest/dead568a-e924-44e1-a77e-d89ab58e887f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fc50e'},body:JSON.stringify({sessionId:'6fc50e',runId:'pre-fix-2',hypothesisId:'H1_H2_H3',location:'src/js/app.js:10',message:'loadJson start',data:{requestedUrl:url,origin:window.location.origin,pathname:window.location.pathname},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  // #region agent log
  fetch('http://127.0.0.1:7760/ingest/dead568a-e924-44e1-a77e-d89ab58e887f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fc50e'},body:JSON.stringify({sessionId:'6fc50e',runId:'pre-fix-2',hypothesisId:'H1_H2_H3_H4',location:'src/js/app.js:13',message:'loadJson response',data:{requestedUrl:url,responseOk:res.ok,status:res.status,responseUrl:res.url,contentType:res.headers.get('content-type')},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return await res.json();
}

function matchRoute(pathname) {
  if (pathname === "/") return { name: "portfolioIndex" };
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

function renderAbout(container) {
  container.replaceChildren();
  const aboutContainer = el("div", { className: "about-container" });
  const aboutTextContainer = el("div", { className: "about-text-container" });
  const headshot = el('div', { className: 'about-headshot-container' });
  headshot.appendChild(
    el("img", {
      className: "headshot-image",
      attrs: { src: "https://res.cloudinary.com/dhokowg6q/image/upload/v1777237883/headshot_dfpuvt.jpg" }
    })
  );
  aboutContainer.appendChild(headshot);
  aboutTextContainer.appendChild(el('h2', { className: 'about-title', text: 'about: tabi cass' }));
  const aboutText = el("p", { className: "about-text" });
  aboutText.innerHTML =
    "Tabi Cass is a creative technologist whose work explores the tension between their fascination and unease regarding emerging technologies. Through experimental media, visual metaphor, and conceptual craft, they examine how technological systems shape perception, identity, and interpersonal relationships.<br><br>Tabi graduated from Parsons School of Design in May 2026 with a focus on design and technology and is currently pursuing their MFA at NYU's ITP program.";
  aboutTextContainer.appendChild(aboutText);
  aboutTextContainer.appendChild(
    el("a", {
      className: "about-cv-link",
      text: "View CV (PDF)",
      attrs: {
        href: "/resources/pdf/Tabi%20Cass%20-%202026%20CV.pdf",
        target: "_blank",
        rel: "noopener noreferrer"
      }
    })
  );
  aboutContainer.appendChild(aboutTextContainer);
  container.appendChild(aboutContainer);
}

function renderContact(container) {
  container.replaceChildren();

  const wrap = el("div", { className: "contact-container" });

  const list = el("div", { className: "contact-links" });

  list.appendChild(
    el("a", {
      className: "contact-link",
      text: "Email: tabiarchive@gmail.com",
      attrs: { href: "mailto:tabiarchive@gmail.com" }
    })
  );
  list.appendChild(
    el("a", {
      className: "contact-link",
      text: "Instagram: @tabi.sock",
      attrs: { href: "https://instagram.com/tabi.sock", target: "_blank", rel: "noopener noreferrer" }
    })
  );
  list.appendChild(
    el("a", {
      className: "contact-link",
      text: "LinkedIn: Tabi Cass",
      attrs: { href: "https://www.linkedin.com/in/tabi-cass-29a228278/", target: "_blank", rel: "noopener noreferrer" }
    })
  );

  wrap.appendChild(list);
  container.appendChild(wrap);
}

async function renderRoute() {
  const container = document.getElementById("content-container-main");
  if (!container) return;

  const route = matchRoute(window.location.pathname);
  // #region agent log
  fetch('http://127.0.0.1:7760/ingest/dead568a-e924-44e1-a77e-d89ab58e887f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6fc50e'},body:JSON.stringify({sessionId:'6fc50e',runId:'pre-fix-2',hypothesisId:'H2_H4_H5',location:'src/js/app.js:116',message:'renderRoute matched',data:{pathname:window.location.pathname,routeName:route?.name,slug:route?.slug ?? null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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

async function renderRouteAndScrollTop() {
  await renderRoute();
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
  // Let the browser load static assets/pages under /resources (e.g. the namechange game).
  if (href.startsWith("/resources/")) return false;

  // Only intercept same-origin absolute paths like "/about".
  if (!href.startsWith("/")) return false;

  return true;
}

function setupSpaNavigation() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  document.addEventListener("click", (evt) => {
    const a = evt.target?.closest?.("a");
    if (!isInternalLeftClickNavigation(evt, a)) return;

    evt.preventDefault();
    const href = a.getAttribute("href");
    if (href === window.location.pathname) return;

    history.pushState({}, "", href);
    renderRouteAndScrollTop().catch((err) => console.error(err));
  });

  window.addEventListener("popstate", () => {
    renderRouteAndScrollTop().catch((err) => console.error(err));
  });
}

setupSpaNavigation();
renderRoute().catch((err) => console.error(err));

