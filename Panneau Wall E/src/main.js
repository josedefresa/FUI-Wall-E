import "./style.css";

const canvas = document.createElement("canvas");
canvas.width = 5760;
canvas.height = 1080;
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "1";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

// Clignotement de BoutonrougeONoffGauche
const iframe =
  document.querySelector('iframe[src="/Panneau.html"]') ||
  document.querySelector("iframe");

if (iframe) {
  iframe.addEventListener("load", () => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const win = iframe.contentWindow || window;

      // Bouton rouge
      const id = "BoutonrougeONoffGauche";
      const el = doc.getElementById(id);
      if (el) {
        const computedFill =
          el.getAttribute("fill") ||
          (win.getComputedStyle ? win.getComputedStyle(el).fill : "") ||
          "#ff0000";

        const style = doc.createElement("style");
        style.textContent = `
          @keyframes boutonClignote {
            0%   { fill: var(--orig-fill); opacity: 1; }
            50%  { fill: #6e0b0b; opacity: 0.35; }
            100% { fill: var(--orig-fill); opacity: 1; }
          }
          #${id} {
            --orig-fill: ${computedFill};
            animation: boutonClignote 1.2s linear infinite;
            transition: fill .3s, opacity .3s;
            cursor: pointer;
          }
          
          #${id}.pressed {
            filter: opacity(0.6);
          }
        `;
        doc.head.appendChild(style);
        el.style.fill = computedFill;

        if (!el.dataset.pressInit) {
          el.dataset.pressInit = "1";

          const pressOn = () => el.classList.add("pressed");
          const pressOff = () => el.classList.remove("pressed");

          el.addEventListener("pointerdown", (ev) => {
            ev.preventDefault();
            pressOn();
          });

          el.addEventListener("pointerup", pressOff);
          el.addEventListener("pointercancel", pressOff);
          el.addEventListener("pointerleave", pressOff);

          win.addEventListener("pointerup", pressOff);
          win.addEventListener("blur", pressOff);
        }
      }

      // Autolock
      const autoIds = ["A", "U", "T", "O", "L", "O2", "C", "K"];
      const firstLetterEl = autoIds
        .map((i) => doc.getElementById(i))
        .find(Boolean);

      const lettersFill =
        (firstLetterEl &&
          (firstLetterEl.getAttribute("fill") ||
            (win.getComputedStyle
              ? win.getComputedStyle(firstLetterEl).fill
              : ""))) ||
        "#00ff00";

      const btn1 = doc.getElementById("BoutonAutolock");
      const btn2 = doc.getElementById("BoutonAutolock2");
      const btn1Fill =
        (btn1 &&
          (btn1.getAttribute("fill") ||
            (win.getComputedStyle ? win.getComputedStyle(btn1).fill : ""))) ||
        "#ffff00";
      const btn2Fill =
        (btn2 &&
          (btn2.getAttribute("fill") ||
            (win.getComputedStyle ? win.getComputedStyle(btn2).fill : ""))) ||
        "#ff00ff";

      const lettersMid = "#ffeb32";
      const btn1Mid = "#eb2020";
      const btn2Mid = "#ff2e2e";

      const styleAuto = doc.createElement("style");
      styleAuto.textContent = `
        @keyframes autolockClignote {
          0%   { fill: var(--orig-fill); opacity: 1; }
          50%  { fill: var(--mid-fill); opacity: 0.7; }
          100% { fill: var(--orig-fill); opacity: 1; }
        }
        .autolock-paused {
          animation: none !important;
          opacity: 1 !important;
          fill: var(--orig-fill) !important;
          transition: none !important;
        }
        ${autoIds.map((id) => `#${id}`).join(",")} {
          --orig-fill: ${lettersFill};
          --mid-fill: ${lettersMid};
          animation: autolockClignote 1.1s linear infinite;
          transition: fill .3s, opacity .3s;
          cursor: pointer;
        }
        ${btn1 ? `#${btn1.id} { --orig-fill: ${btn1Fill}; --mid-fill: ${btn1Mid}; animation: autolockClignote 1.1s linear infinite; cursor: pointer; }` : ""}
        ${btn2 ? `#${btn2.id} { --orig-fill: ${btn2Fill}; --mid-fill: ${btn2Mid}; animation: autolockClignote 1.1s linear infinite; cursor: pointer; }` : ""}
      `;
      doc.head.appendChild(styleAuto);

      autoIds.forEach((i) => {
        const e = doc.getElementById(i);
        if (e) {
          e.style.fill = lettersFill;
          e.style.setProperty("--orig-fill", lettersFill);
          e.style.setProperty("--mid-fill", lettersMid);
          e.dataset.origFill = lettersFill;
        }
      });
      if (btn1) {
        btn1.style.fill = btn1Fill;
        btn1.style.setProperty("--orig-fill", btn1Fill);
        btn1.style.setProperty("--mid-fill", btn1Mid);
        btn1.dataset.origFill = btn1Fill;
      }
      if (btn2) {
        btn2.style.fill = btn2Fill;
        btn2.style.setProperty("--orig-fill", btn2Fill);
        btn2.style.setProperty("--mid-fill", btn2Mid);
        btn2.dataset.origFill = btn2Fill;
      }

      const pauseElements = (elements, ms = 5000) => {
        const els = elements.filter(Boolean);
        if (!els.length) return;
        els.forEach((el) => {
          el.classList.add("autolock-paused");
          const orig =
            el.dataset.origFill ||
            getComputedStyle(el).getPropertyValue("--orig-fill") ||
            "";
          if (orig) el.style.fill = orig;
        });
        setTimeout(() => {
          els.forEach((el) => {
            el.classList.remove("autolock-paused");
            const orig = el.dataset.origFill;
            if (orig) el.style.fill = orig;
          });
        }, ms);
      };

      const letterElements = autoIds
        .map((i) => doc.getElementById(i))
        .filter(Boolean);
      const autolockGroup = [
        ...letterElements,
        ...(btn1 ? [btn1] : []),
        ...(btn2 ? [btn2] : []),
      ].filter(Boolean);

      letterElements.forEach((el) => {
        const handler = (ev) => {
          ev.stopPropagation();
          pauseElements(autolockGroup, 5000);
        };
        el.addEventListener("click", handler);
        el.addEventListener("touchstart", handler, { passive: true });
      });

      const addGroupListeners = (groupEl) => {
        if (!groupEl) return;
        const layers = [groupEl].concat(
          Array.from(groupEl.querySelectorAll("*")),
        );
        layers.forEach((layer) => {
          layer.style.cursor = "pointer";
          const handler = (ev) => {
            ev.stopPropagation();
            pauseElements(autolockGroup, 5000);
          };
          layer.addEventListener("click", handler);
          layer.addEventListener("touchstart", handler, { passive: true });
        });
      };

      addGroupListeners(btn1);
      addGroupListeners(btn2);

      // Particules RondCentre
      (function setupRondCentreParticlesSVG() {
        const SVG_NS = "http://www.w3.org/2000/svg";

        const svg = doc.getElementById("Panneau");
        if (!svg) return;

        const rond = doc.getElementById("RondCentre");
        const centre = doc.getElementById("CentreRondCentre");
        if (!rond || !centre) return;

        // Nettoyage si rechargement
        doc.getElementById("ParticlesRondCentre")?.remove();
        doc.getElementById("clipParticlesRondCentre")?.remove();

        const defs =
          svg.querySelector("defs") ||
          svg.insertBefore(doc.createElementNS(SVG_NS, "defs"), svg.firstChild);

        let rondBox = rond.getBBox();
        let centreBox = centre.getBBox();

        const getRondGeom = () => {
          rondBox = rond.getBBox();
          const cx = rondBox.x + rondBox.width / 2;
          const cy = rondBox.y + rondBox.height / 2;
          const r = Math.min(rondBox.width, rondBox.height) / 2;
          return { cx, cy, r };
        };

        const getCentrePoint = () => {
          centreBox = centre.getBBox();
          const x = centreBox.x + centreBox.width / 2;
          const y = centreBox.y + centreBox.height / 2;
          return { x, y };
        };

        const { cx, cy, r } = getRondGeom();

        const clip = doc.createElementNS(SVG_NS, "clipPath");
        clip.setAttribute("id", "clipParticlesRondCentre");
        clip.setAttribute("clipPathUnits", "userSpaceOnUse");

        const clipCircle = doc.createElementNS(SVG_NS, "circle");
        clipCircle.setAttribute("cx", String(cx));
        clipCircle.setAttribute("cy", String(cy));
        clipCircle.setAttribute("r", String(r));
        clip.appendChild(clipCircle);
        defs.appendChild(clip);

        const g = doc.createElementNS(SVG_NS, "g");
        g.setAttribute("id", "ParticlesRondCentre");
        g.setAttribute("clip-path", "url(#clipParticlesRondCentre)");
        g.setAttribute("pointer-events", "none");

        const parent = centre.parentNode || rond;
        parent.insertBefore(g, centre);

        // Particules (SVG circles)
        const particles = [];
        const pool = [];

        const rand = (a, b) => a + Math.random() * (b - a);

        const spawn = (n) => {
          const origin = getCentrePoint();
          for (let i = 0; i < n; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = rand(220, 520);
            const maxLife = rand(0.55, 1.1);
            const size = rand(0.9, 2.2);

            const node = pool.pop() || doc.createElementNS(SVG_NS, "circle");
            node.setAttribute("fill", "white");
            node.setAttribute("r", String(size));
            node.setAttribute("cx", String(origin.x));
            node.setAttribute("cy", String(origin.y));
            node.setAttribute("opacity", "0.9");
            if (!node.parentNode) g.appendChild(node);

            particles.push({
              node,
              x: origin.x,
              y: origin.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              t: 0,
              maxLife,
              size,
            });
          }
        };

        let last = win.performance.now();
        const tick = (now) => {
          const dt = Math.min(0.033, (now - last) / 1000);
          last = now;

          if (Math.random() < 0.02) {
            const gg = getRondGeom();
            clipCircle.setAttribute("cx", String(gg.cx));
            clipCircle.setAttribute("cy", String(gg.cy));
            clipCircle.setAttribute("r", String(gg.r));
          }

          // émission (≈ 70 particules / sec)
          const rate = 70;
          const toSpawn = Math.random() < dt * rate ? 1 : 0;
          if (toSpawn) spawn(1);

          const gg = getRondGeom();
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.t += dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            const dx = p.x - gg.cx;
            const dy = p.y - gg.cy;
            const dist2 = dx * dx + dy * dy;

            if (p.t >= p.maxLife || dist2 >= (gg.r - 1.5) * (gg.r - 1.5)) {
              p.node.remove();
              pool.push(p.node);
              particles.splice(i, 1);
              continue;
            }

            const a = Math.max(0, 1 - p.t / p.maxLife);
            p.node.setAttribute("cx", String(p.x));
            p.node.setAttribute("cy", String(p.y));
            p.node.setAttribute("opacity", String(0.85 * a));
          }

          win.requestAnimationFrame(tick);
        };

        win.requestAnimationFrame(tick);
      })();

      // BoutonsXGauche
      const setupGaucheButtons = (groupId) => {
        const grp = doc.getElementById(groupId);
        if (!grp) return;

        const LOCK_MS = 10_000;

        const isLocked = (btn) => {
          const until = Number(btn?.dataset?.lockUntil || 0);
          return until > Date.now();
        };

        const lockFor = (btn, ms) => {
          if (!btn) return;
          btn.dataset.lockUntil = String(Date.now() + ms);
        };

        const toggleOpacity = (btn) => {
          if (!btn) return;
          const current = parseFloat(
            btn.style.opacity || win.getComputedStyle(btn).opacity || "1",
          );
          btn.style.opacity = current <= 0.11 ? "1" : "0.1";
        };

        const getClickedButton = (target) => {
          if (!target || target === grp) return null;
          let btn = target;
          while (btn && btn.parentNode && btn.parentNode !== grp)
            btn = btn.parentNode;
          if (!btn || btn === grp) return null;
          return btn;
        };

        const onClick = (ev) => {
          const btn = getClickedButton(ev.target);
          if (!btn) return;
          toggleOpacity(btn);
          lockFor(btn, LOCK_MS);
        };

        grp.style.cursor = "pointer";
        grp.addEventListener("click", onClick);
        grp.addEventListener("touchstart", onClick, { passive: true });

        const initKey = `blinkInit_${groupId}`;
        if (!grp.dataset[initKey]) {
          grp.dataset[initKey] = "1";

          const buttons = Array.from(grp.children);

          buttons.forEach((btn) => {
            const initialDelay = Math.floor(Math.random() * 3000);
            const loop = () => {
              if (!isLocked(btn)) toggleOpacity(btn);
              win.setTimeout(loop, 3000);
            };
            win.setTimeout(loop, initialDelay);
          });
        }
      };

      setupGaucheButtons("Boutons9Gauche");
      setupGaucheButtons("Boutons8Gauche1");
      setupGaucheButtons("Boutons8Gauche2");
      setupGaucheButtons("Boutons8Gauche3");

      // VisualisateurTerreTOURNER
      {
        const terre = doc.getElementById("VisualisateurTerreTOURNER");
        if (terre) {
          const styleTerre = doc.createElement("style");
          styleTerre.textContent = `
            @keyframes terrePivot {
              0%   { transform: rotate(0deg); opacity: 0.85; }
              100% { transform: rotate(360deg); opacity: 0.85; }
            }
            #VisualisateurTerreTOURNER {
              transform-box: fill-box;
              transform-origin: 50% 50%;
              animation: terrePivot 3.6s linear infinite;
              will-change: transform, opacity;
              opacity: 0.85;
            }
          `;
          doc.head.appendChild(styleTerre);
        }
      }

      // AiguilleVisualisateurViolet
      {
        const aiguille = doc.getElementById("AiguilleVisualisateurViolet");
        if (aiguille) {
          doc.getElementById("styleAiguilleVisualisateurViolet")?.remove();

          const styleAig = doc.createElement("style");
          styleAig.id = "styleAiguilleVisualisateurViolet";
          styleAig.textContent = `
            @keyframes aiguilleVioletWiggle {
              0%   { transform: rotate(-2deg); }
              50%  { transform: rotate(2deg); }
              100% { transform: rotate(-2deg); }
            }
            #AiguilleVisualisateurViolet {
              transform-box: fill-box;
              transform-origin: 75% 50%;
              animation: aiguilleVioletWiggle 2.2s ease-in-out infinite;
              will-change: transform;
            }
          `;
          doc.head.appendChild(styleAig);
        }
      }

      // RondRougePetitsBoutons
      {
        const BASE_YELLOW = "#FFD400";
        const DARK_YELLOW = "#d46911";
        const MID_YELLOW = "#e6a900";

        const grp = doc.getElementById("RondRougePetitsBoutons");
        if (grp) {
          const buttons = Array.from(grp.children);
          const allLayers = (root) => [
            root,
            ...Array.from(root.querySelectorAll("*")),
          ];

          const resolveToRgb = (cssColor) => {
            const tmp = doc.createElement("div");
            tmp.style.color = cssColor;
            tmp.style.position = "absolute";
            tmp.style.left = "-9999px";
            doc.body.appendChild(tmp);
            const rgb = win.getComputedStyle(tmp).color || "";
            tmp.remove();
            return rgb;
          };

          const parseRgbString = (s) => {
            const m = String(s).match(
              /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
            );
            if (!m) return null;
            return {
              r: Math.max(0, Math.min(255, Number(m[1]))),
              g: Math.max(0, Math.min(255, Number(m[2]))),
              b: Math.max(0, Math.min(255, Number(m[3]))),
            };
          };

          const luminance01 = ({ r, g, b }) => {
            const sr = r / 255,
              sg = g / 255,
              sb = b / 255;
            return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
          };

          const pickYellowForRed = (origCss) => {
            const rgbStr = resolveToRgb(origCss);
            const rgb = parseRgbString(rgbStr);
            if (!rgb) return BASE_YELLOW;

            const lum = luminance01(rgb);
            if (lum < 0.35) return DARK_YELLOW;
            if (lum < 0.55) return MID_YELLOW;
            return BASE_YELLOW;
          };

          const cacheOrigAndSetYellow = (node) => {
            const cs = win.getComputedStyle(node);
            const origFill = node.getAttribute("fill") || cs.fill || "";
            const origStroke = node.getAttribute("stroke") || cs.stroke || "";

            if (!node.dataset.origFill) node.dataset.origFill = origFill;
            if (!node.dataset.origStroke) node.dataset.origStroke = origStroke;

            if (origFill && origFill !== "none") {
              if (!node.dataset.yellowFill)
                node.dataset.yellowFill = pickYellowForRed(origFill);
              node.style.fill = node.dataset.yellowFill;
            }
            if (origStroke && origStroke !== "none") {
              if (!node.dataset.yellowStroke)
                node.dataset.yellowStroke = pickYellowForRed(origStroke);
              node.style.stroke = node.dataset.yellowStroke;
            }
          };

          const applyYellowVariant = (node) => {
            const f = node.dataset.origFill;
            const s = node.dataset.origStroke;
            if (f && f !== "none")
              node.style.fill = node.dataset.yellowFill || f;
            if (s && s !== "none")
              node.style.stroke = node.dataset.yellowStroke || s;
          };

          const restoreOrig = (node) => {
            const f = node.dataset.origFill;
            const s = node.dataset.origStroke;
            if (f && f !== "none") node.style.fill = f;
            if (s && s !== "none") node.style.stroke = s;
          };

          const rrpbNodes = new Set();

          buttons.forEach((btn) => {
            allLayers(btn).forEach((n) => {
              cacheOrigAndSetYellow(n);
              rrpbNodes.add(n);
            });
            btn.style.cursor = "pointer";
          });

          const findButtonRoot = (target) => {
            let n = target;
            while (n && n !== grp && n.parentNode !== grp) n = n.parentNode;
            return n && n.parentNode === grp ? n : null;
          };

          grp.addEventListener("click", (ev) => {
            const btn = findButtonRoot(ev.target);
            if (!btn) return;
            allLayers(btn).forEach(restoreOrig);
          });

          grp.addEventListener(
            "touchstart",
            (ev) => {
              const btn = findButtonRoot(ev.target);
              if (!btn) return;
              allLayers(btn).forEach(restoreOrig);
            },
            { passive: true },
          );

          // expose pour le timer 30s (passage à 20s)
          win.__rrpb = {
            nodes: rrpbNodes,
            applyYellow: () => rrpbNodes.forEach(applyYellowVariant),
            restoreOrig: () => rrpbNodes.forEach(restoreOrig),
          };
        }
      }

      // Boutons13Gauche / Boutons13GauchePASCHANGER
      {
        const RED_FILL_LIGHT = "#FF3B30";
        const RED_FILL_MID = "#7A0000";
        const RED_FILL_DARK = "#D0021B";

        const RED_STROKE_LIGHT = "#FF3B30";
        const RED_STROKE_MID = "#D0021B";
        const RED_STROKE_DARK = "#7A0000";

        const grpMain = doc.getElementById("Boutons13Gauche");
        const grpNoChange = doc.getElementById("Boutons13GauchePASCHANGER");
        if (grpMain && grpNoChange) {
          const allLayers = (root) => [
            root,
            ...Array.from(root.querySelectorAll("*")),
          ];

          const resolveToRgb = (cssColor) => {
            const tmp = doc.createElement("div");
            tmp.style.color = cssColor;
            tmp.style.position = "absolute";
            tmp.style.left = "-9999px";
            doc.body.appendChild(tmp);
            const rgb = win.getComputedStyle(tmp).color || "";
            tmp.remove();
            return rgb;
          };

          const parseRgbString = (s) => {
            const m = String(s).match(
              /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
            );
            if (!m) return null;
            return {
              r: Math.max(0, Math.min(255, Number(m[1]))),
              g: Math.max(0, Math.min(255, Number(m[2]))),
              b: Math.max(0, Math.min(255, Number(m[3]))),
            };
          };

          const luminance01 = ({ r, g, b }) => {
            const sr = r / 255,
              sg = g / 255,
              sb = b / 255;
            return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
          };

          const pickRedForOrig = (origCss, which = "fill") => {
            const rgbStr = resolveToRgb(origCss);
            const rgb = parseRgbString(rgbStr);
            if (!rgb) return which === "stroke" ? RED_STROKE_MID : RED_FILL_MID;

            const lum = luminance01(rgb);
            if (lum < 0.35)
              return which === "stroke" ? RED_STROKE_DARK : RED_FILL_DARK;
            if (lum < 0.55)
              return which === "stroke" ? RED_STROKE_MID : RED_FILL_MID;
            return which === "stroke" ? RED_STROKE_LIGHT : RED_FILL_LIGHT;
          };

          const cacheOrigAndCacheRed = (node) => {
            const cs = win.getComputedStyle(node);
            const origFill = node.getAttribute("fill") || cs.fill || "";
            const origStroke = node.getAttribute("stroke") || cs.stroke || "";

            if (!node.dataset.origFill) node.dataset.origFill = origFill;
            if (!node.dataset.origStroke) node.dataset.origStroke = origStroke;

            if (!node.dataset.redFill && origFill && origFill !== "none") {
              node.dataset.redFill = pickRedForOrig(origFill, "fill");
            }
            if (
              !node.dataset.redStroke &&
              origStroke &&
              origStroke !== "none"
            ) {
              node.dataset.redStroke = pickRedForOrig(origStroke, "stroke");
            }
          };

          const applyRed = (node) => {
            const f = node.dataset.origFill;
            const s = node.dataset.origStroke;
            if (f && f !== "none")
              node.style.fill = node.dataset.redFill || RED_FILL_MID;
            if (s && s !== "none")
              node.style.stroke = node.dataset.redStroke || RED_STROKE_MID;
          };

          const restoreOrig = (node) => {
            const f = node.dataset.origFill;
            const s = node.dataset.origStroke;
            if (f && f !== "none") node.style.fill = f;
            if (s && s !== "none") node.style.stroke = s;
          };

          allLayers(grpMain).forEach(cacheOrigAndCacheRed);

          const setMainRedState = (on) => {
            grpMain.dataset.isRed = on ? "1" : "0";
            const fn = on ? applyRed : restoreOrig;
            allLayers(grpMain).forEach(fn);
          };

          const toggleMainRedState = () => {
            const isOn = grpMain.dataset.isRed === "1";
            setMainRedState(!isOn);
          };

          const bindToggle = (grp) => {
            grp.style.cursor = "pointer";
            grp.addEventListener("click", (ev) => {
              ev.stopPropagation();
              toggleMainRedState();
            });
            grp.addEventListener(
              "touchstart",
              (ev) => {
                ev.stopPropagation();
                toggleMainRedState();
              },
              { passive: true },
            );
          };

          bindToggle(grpMain);
          bindToggle(grpNoChange);
        }
      }

      // PetitsBoutonsGauche
      {
        const grp = doc.getElementById("PetitsBoutonsGauche");
        if (grp) {
          const getClickedButton = (target) => {
            if (!target || target === grp) return null;
            let btn = target;
            while (btn && btn.parentNode && btn.parentNode !== grp)
              btn = btn.parentNode;
            if (!btn || btn === grp) return null;
            return btn;
          };

          const toggleOpacity = (btn) => {
            if (!btn) return;
            const current = parseFloat(
              btn.style.opacity || win.getComputedStyle(btn).opacity || "1",
            );
            btn.style.opacity = current <= 0.11 ? "1" : "0.1";
          };

          const handler = (ev) => {
            const btn = getClickedButton(ev.target);
            if (!btn) return;
            toggleOpacity(btn);
          };

          grp.style.cursor = "pointer";
          grp.addEventListener("click", handler);
          grp.addEventListener("touchstart", handler, { passive: true });
        }
      }

      {
        const SVG_NS = "http://www.w3.org/2000/svg";

        const fond30 = doc.getElementById("Fond30");
        const chargement = doc.getElementById("Chargement30");

        const text30 =
          doc.getElementById("Texte30") ||
          Array.from(doc.querySelectorAll("text")).find((t) => {
            const tr = t.getAttribute("transform") || "";
            return tr.includes("1854.41 839.24");
          }) ||
          null;

        if (text30 && !text30.id) text30.id = "Compteur30";

        if (fond30) {
          const b = fond30.getBBox();
          const cx = b.x + b.width / 2;
          const cy = b.y + b.height / 2;

          const COUNT_Y_OFFSET = 8;

          if (text30) {
            text30.setAttribute("text-anchor", "middle");
            text30.setAttribute("dominant-baseline", "middle");
            text30.setAttribute("x", String(cx));
            text30.setAttribute("y", String(cy + COUNT_Y_OFFSET));
            if (!text30.dataset.keepTransform30) {
              text30.dataset.keepTransform30 = "1";
              text30.dataset.origTransform30 =
                text30.getAttribute("transform") || "";
              text30.removeAttribute("transform");
            }
          }

          if (chargement) {
            doc.getElementById("styleChargement30")?.remove();
            chargement.querySelector("#animChargement30")?.remove();

            const anim = doc.createElementNS(SVG_NS, "animateTransform");
            anim.setAttribute("id", "animChargement30");
            anim.setAttribute("attributeName", "transform");
            anim.setAttribute("attributeType", "XML");
            anim.setAttribute("type", "rotate");
            anim.setAttribute("from", `0 ${cx} ${cy}`);
            anim.setAttribute("to", `360 ${cx} ${cy}`);
            anim.setAttribute("dur", "1s");
            anim.setAttribute("repeatCount", "indefinite");
            anim.setAttribute("additive", "sum");
            chargement.appendChild(anim);
          }
        }

        const YELLOW_TYPES = {
          BASE: "#FFD400",
          MID: "#E6A900",
          DARK: "#D46911",
        };

        const YELLOW_TYPE_BY_ID = {
          RondRougeGauche: "MID",
          RondRougeGauche2: "BASE",
          FondRondRougeGauche: "DARK",

          RondRougeDroite: "MID",
          RondRougeDroite2: "BASE",
          FondRondRougeDroite: "DARK",

          Chargement30: "MID",
          Fond30: "DARK",
          Compteur30: "BASE",

          SelfDestructContour: "MID",
          TexteGauche: "BASE",

          PetitsTriangles: "DARK",
          PetitsTriangles2: "DARK",
        };

        const TARGET_IDS = [
          "RondRougeGauche",
          "RondRougeGauche2",
          "FondRondRougeGauche",
          "Chargement30",
          "Fond30",
          "Compteur30",
          "RondRougeDroite2",
          "RondRougeDroite",
          "FondRondRougeDroite",
          "SelfDestructContour",
          "TexteGauche",

          // AJOUT
          "PetitsTriangles",
          "PetitsTriangles2",
        ];

        const allLayers = (root) =>
          root ? [root, ...Array.from(root.querySelectorAll("*"))] : [];

        const cacheOrigAndCacheYellow = (node, yellowHex) => {
          const cs = win.getComputedStyle(node);
          const origFill = node.getAttribute("fill") || cs.fill || "";
          const origStroke = node.getAttribute("stroke") || cs.stroke || "";

          if (!node.dataset.origFill) node.dataset.origFill = origFill;
          if (!node.dataset.origStroke) node.dataset.origStroke = origStroke;

          if (!node.dataset.yellowFill && origFill && origFill !== "none") {
            node.dataset.yellowFill = yellowHex;
          }
          if (
            !node.dataset.yellowStroke &&
            origStroke &&
            origStroke !== "none"
          ) {
            node.dataset.yellowStroke = yellowHex;
          }

          if (!node.dataset.morphInit30) {
            node.dataset.morphInit30 = "1";
            node.dataset.origTransition30 = node.style.transition || "";
            node.style.transition =
              "fill 600ms ease, stroke 600ms ease, opacity 600ms ease";
          }
        };

        const applyYellow = (node) => {
          const f = node.dataset.origFill;
          const s = node.dataset.origStroke;
          if (f && f !== "none")
            node.style.fill = node.dataset.yellowFill || "";
          if (s && s !== "none")
            node.style.stroke = node.dataset.yellowStroke || "";
        };

        const restoreOrig = (node) => {
          const f = node.dataset.origFill;
          const s = node.dataset.origStroke;
          if (f && f !== "none") node.style.fill = f;
          if (s && s !== "none") node.style.stroke = s;
        };

        const morphNodes = [];
        TARGET_IDS.forEach((id) => {
          const root = doc.getElementById(id);
          if (!root) return;

          const type = YELLOW_TYPE_BY_ID[id] || "BASE";
          const yellowHex = YELLOW_TYPES[type] || YELLOW_TYPES.BASE;

          allLayers(root).forEach((n) => {
            cacheOrigAndCacheYellow(n, yellowHex);
            morphNodes.push(n);
          });
        });

        // clignotement de TexteGauche en dessous de 25s
        const texteGauche = doc.getElementById("TexteGauche");
        if (texteGauche) {
          doc.getElementById("styleTexteGaucheBlink")?.remove();
          const st = doc.createElement("style");
          st.id = "styleTexteGaucheBlink";
          st.textContent = `
            @keyframes texteGaucheBlinkOpacity {
              0%   { opacity: 1; }
              25%  { opacity: 0.82; }
              50%  { opacity: 0.65; }
              75%  { opacity: 0.82; }
              100% { opacity: 1; }
            }
            .texte-gauche-blink {
              animation: texteGaucheBlinkOpacity 1.3s ease-in-out infinite;
              will-change: opacity;
            }
          `;
          doc.head.appendChild(st);
        }

        const setTexteGaucheBlink = (seconds) => {
          if (!texteGauche) return;
          const shouldBlink = seconds < 25;
          if (shouldBlink) {
            texteGauche.classList.add("texte-gauche-blink");
          } else {
            texteGauche.classList.remove("texte-gauche-blink");
            texteGauche.style.opacity = "1";
          }
        };

        const HOLD_IDS = [
          "Chargement30",
          "Fond30",
          "PetitsTriangles2",
          "PetitsTriangles",
          "Compteur30",
          "RondRougeDroite2",
          "RondRougeDroite",
          "FondRondRougeDroite",
        ];

        const holdNodes = [];
        HOLD_IDS.forEach((id) => {
          const root = doc.getElementById(id);
          if (!root) return;
          allLayers(root).forEach((n) => holdNodes.push(n));
        });

        const NORMAL_TRANSITION =
          "fill 600ms ease, stroke 600ms ease, opacity 600ms ease";
        const HOLD_TRANSITION =
          "fill 160ms ease, stroke 160ms ease, opacity 160ms ease";

        const setTransition = (nodes, t) => {
          nodes.forEach((n) => {
            if (!n) return;
            n.style.transition = t;
          });
        };

        let currentSeconds30 = 30;
        let isHoldingBefore20 = false;

        const RRBP_EXTRA_YELLOW_MS = 450;
        let __rrpbDelayTimeout = null;

        const setHoldState = (holding) => {
          isHoldingBefore20 = holding;
          if (currentSeconds30 > 20) {
            setTransition(holdNodes, HOLD_TRANSITION);
            holdNodes.forEach(holding ? restoreOrig : applyYellow);
          }
        };

        const bindHold = (root) => {
          if (!root || root.dataset.holdInit20 === "1") return;
          root.dataset.holdInit20 = "1";
          root.style.cursor = "pointer";

          const onDown = (ev) => {
            if (currentSeconds30 <= 20) return;
            if (ev && ev.isPrimary === false) return;
            ev?.preventDefault?.();
            setHoldState(true);
          };

          const onUp = () => {
            if (!isHoldingBefore20) return;
            setHoldState(false);
          };

          root.addEventListener("pointerdown", onDown);
          root.addEventListener("pointerup", onUp);
          root.addEventListener("pointercancel", onUp);
          root.addEventListener("pointerleave", onUp);
        };

        HOLD_IDS.forEach((id) => bindHold(doc.getElementById(id)));
        win.addEventListener("pointerup", () => {
          if (!isHoldingBefore20) return;
          setHoldState(false);
        });
        win.addEventListener("blur", () => {
          if (!isHoldingBefore20) return;
          setHoldState(false);
        });

        const setPhase = (seconds) => {
          currentSeconds30 = seconds;

          const yellowPhase = seconds > 20;

          morphNodes.forEach((n) =>
            yellowPhase ? applyYellow(n) : restoreOrig(n),
          );
          setTexteGaucheBlink(seconds);

          if (win.__rrpb) {
            if (yellowPhase) {
              if (__rrpbDelayTimeout) win.clearTimeout(__rrpbDelayTimeout);
              __rrpbDelayTimeout = null;
              win.__rrpb.applyYellow();
            } else {
              win.__rrpb.restoreOrig();
            }
          }

          if (yellowPhase) {
            setTransition(holdNodes, HOLD_TRANSITION);
            if (isHoldingBefore20) holdNodes.forEach(restoreOrig);
            else holdNodes.forEach(applyYellow);
          } else {
            setTransition(holdNodes, NORMAL_TRANSITION);
            isHoldingBefore20 = false;
          }
        };

        let __flashTimeouts30 = [];

        const MORPH_TRANSITION = NORMAL_TRANSITION;
        const FLASH_TRANSITION =
          "fill 140ms ease-in-out, stroke 140ms ease-in-out, opacity 140ms ease-in-out";

        const setFlashTransitions = (mode) => {
          const t = mode === "flash" ? FLASH_TRANSITION : MORPH_TRANSITION;
          morphNodes.forEach((n) => {
            if (!n) return;
            n.style.transition = t;
          });
        };

        const flashAt20 = () => {
          __flashTimeouts30.forEach((t) => win.clearTimeout(t));
          __flashTimeouts30 = [];

          setFlashTransitions("flash");

          morphNodes.forEach(restoreOrig);

          const STEP = 160;

          __flashTimeouts30.push(
            win.setTimeout(() => {
              morphNodes.forEach(applyYellow);
            }, STEP),
          );

          __flashTimeouts30.push(
            win.setTimeout(() => {
              morphNodes.forEach(restoreOrig);
            }, STEP * 2),
          );

          __flashTimeouts30.push(
            win.setTimeout(
              () => {
                setFlashTransitions("morph");
                morphNodes.forEach(restoreOrig);
              },
              STEP * 2 + 120,
            ),
          );
        };

        // Beep à partir de 20 -> 0 (1 par seconde)
        const BEEP_SRC = "/Beep.mp3";
        let __beepUnlocked = false;

        // tentative "unlock" au premier geste utilisateur (sinon Safari/Chrome peuvent bloquer play())
        if (!window.__beepUnlockInit) {
          window.__beepUnlockInit = true;
          window.addEventListener(
            "pointerdown",
            () => {
              const a = new Audio(BEEP_SRC);
              a.volume = 0;
              const p = a.play();
              if (p && typeof p.then === "function") {
                p.then(() => {
                  a.pause();
                  a.currentTime = 0;
                  __beepUnlocked = true;
                }).catch(() => {
                  // restera bloqué tant qu'il n'y a pas un geste valide
                });
              }
            },
            { once: true },
          );
        }

        const playBeep = () => {
          if (win.__audioState?.muted) return;
          const a = new Audio(BEEP_SRC);
          a.volume = 0.2;
          a.play().catch(() => {});
        };

        if (text30) {
          if (win.__walleTimer30) {
            win.clearInterval(win.__walleTimer30);
            win.__walleTimer30 = null;
          }

          let n = 30;
          text30.textContent = String(n);
          setPhase(n);

          win.__walleTimer30 = win.setInterval(() => {
            const prev = n;
            n = n === 0 ? 30 : n - 1;

            text30.textContent = String(n);

            // beep quand on vient d'atteindre 20, puis à chaque seconde jusqu'à 0
            if (prev !== n && n <= 20) {
              playBeep();
            }

            if (prev > 20 && n === 20) {
              if (win.__rrpb) {
                win.__rrpb.applyYellow();
                if (__rrpbDelayTimeout) win.clearTimeout(__rrpbDelayTimeout);
                __rrpbDelayTimeout = win.setTimeout(() => {
                  win.__rrpb?.restoreOrig();
                  __rrpbDelayTimeout = null;
                }, RRBP_EXTRA_YELLOW_MS);
              }
              flashAt20();
            } else {
              setPhase(n);
            }
          }, 1000);
        }
      }

      // Bouton6Centre : clignotement aléatoire
      {
        const grp = doc.getElementById("Bouton6Centre");
        if (grp && !grp.dataset.randomBlinkInit) {
          grp.dataset.randomBlinkInit = "1";

          const MIN_OPACITY = 0.5; // <-- plus élevé (avant: 0.12)
          const MAX_OPACITY = 1;
          const MIN_INTERVAL_MS = 700;
          const MAX_INTERVAL_MS = 2600;
          const TRANSITION = "opacity 260ms ease-in-out";

          const buttons = Array.from(grp.children);

          const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));

          const toggle = (btn) => {
            const current = parseFloat(
              btn.style.opacity || win.getComputedStyle(btn).opacity || "1",
            );
            btn.style.opacity =
              current <= MIN_OPACITY + 0.02
                ? String(MAX_OPACITY)
                : String(MIN_OPACITY);
          };

          buttons.forEach((btn) => {
            btn.style.transition = TRANSITION;

            const loop = () => {
              toggle(btn);
              win.setTimeout(loop, randInt(MIN_INTERVAL_MS, MAX_INTERVAL_MS));
            };

            win.setTimeout(loop, randInt(0, MAX_INTERVAL_MS));
          });
        }
      }

      // Mute / ON-OFF via Bouton3CentreMUTE (agit sur tous les sons gérés par ce script)
      {
        if (!win.__audioState) win.__audioState = { muted: false };

        const muteBtn = doc.getElementById("Bouton3CentreMUTE");
        if (muteBtn && !muteBtn.dataset.muteInit) {
          muteBtn.dataset.muteInit = "1";
          muteBtn.style.cursor = "pointer";

          doc.getElementById("styleMuteBtn")?.remove();
          const st = doc.createElement("style");
          st.id = "styleMuteBtn";
          st.textContent = `
            #Bouton3CentreMUTE.muted {
              opacity: 0.35;
            }
          `;
          doc.head.appendChild(st);

          const syncUI = () => {
            muteBtn.classList.toggle("muted", !!win.__audioState.muted);
          };
          syncUI();

          const toggleMute = () => {
            win.__audioState.muted = !win.__audioState.muted;
            syncUI();
          };

          muteBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            toggleMute();
          });
          muteBtn.addEventListener(
            "touchstart",
            (ev) => {
              ev.stopPropagation();
              toggleMute();
            },
            { passive: true },
          );
        }
      }

      // ...existing code...
    } catch (e) {}
  });
}
