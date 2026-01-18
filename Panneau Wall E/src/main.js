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

// Ajout : clignotement de BoutonrougeONoffGauche dans l'iframe (change de couleur -> brun avec variation d'opacité)
const iframe =
  document.querySelector('iframe[src="/Panneau.html"]') ||
  document.querySelector("iframe");
if (iframe) {
  iframe.addEventListener("load", () => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const win = iframe.contentWindow || window;

      // --- Boutonrouge existant ---
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
          }
        `;
        doc.head.appendChild(style);
        el.style.fill = computedFill;
      }

      // --- Nouveau : Autolock ---
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

      // Couleurs intermédiaires distinctes pour chaque groupe
      const lettersMid = "#ffeb32"; // couleur pour AUTOLO2CK au milieu du clignotement
      const btn1Mid = "#eb2020"; // couleur pour BoutonAutolock au milieu
      const btn2Mid = "#ff2e2e"; // couleur pour BoutonAutolock2 au milieu

      const styleAuto = doc.createElement("style");
      styleAuto.textContent = `
        @keyframes autolockClignote {
          0%   { fill: var(--orig-fill); opacity: 1; }
          50%  { fill: var(--mid-fill); opacity: 0.7; }
          100% { fill: var(--orig-fill); opacity: 1; }
        }
        /* règle pour mettre en pause rapidement */
        .autolock-paused {
          animation: none !important;
          opacity: 1 !important;
          fill: var(--orig-fill) !important;
          transition: none !important;
        }
        /* Les lettres A U T O L O2 C K partagent la même animation mais leurs propres couleurs */
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

      // appliquer la couleur d'origine en inline et définir la variable mid en inline pour SVG
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

      // Fonction pour mettre en pause un ensemble d'éléments pendant 5s
      const pauseElements = (elements, ms = 5000) => {
        const els = elements.filter(Boolean);
        if (!els.length) return;
        els.forEach((el) => {
          el.classList.add("autolock-paused");
          // forcer la couleur de base immédiatement
          const orig =
            el.dataset.origFill ||
            getComputedStyle(el).getPropertyValue("--orig-fill") ||
            "";
          if (orig) el.style.fill = orig;
        });
        setTimeout(() => {
          els.forEach((el) => {
            el.classList.remove("autolock-paused");
            // restore inline fill to ensure animation picks up the var
            const orig = el.dataset.origFill;
            if (orig) el.style.fill = orig;
          });
        }, ms);
      };

      // --- CHANGEMENT : construire le groupe complet Autolock (lettres + boutons) ---
      const letterElements = autoIds
        .map((i) => doc.getElementById(i))
        .filter(Boolean);
      const autolockGroup = [
        ...letterElements,
        ...(btn1 ? [btn1] : []),
        ...(btn2 ? [btn2] : []),
      ].filter(Boolean);

      // listeners : clic sur une lettre pause tout le groupe AUTOLOCK (maintenant inclut boutons)
      letterElements.forEach((el) => {
        const handler = (ev) => {
          ev.stopPropagation();
          pauseElements(autolockGroup, 5000);
        };
        el.addEventListener("click", handler);
        el.addEventListener("touchstart", handler, { passive: true });
      });

      // listeners : clic sur chaque bouton (ou n'importe quel layer à l'intérieur) pause tout le groupe
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

      // --- Particules : partent de CentreRondCentre, rendues SOUS CentreRondCentre, limitées au bord de RondCentre ---
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

        // BBox en coordonnées SVG (viewBox)
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

        // Clip au cercle de RondCentre (pour ne jamais dépasser)
        const clip = doc.createElementNS(SVG_NS, "clipPath");
        clip.setAttribute("id", "clipParticlesRondCentre");
        clip.setAttribute("clipPathUnits", "userSpaceOnUse");

        const clipCircle = doc.createElementNS(SVG_NS, "circle");
        clipCircle.setAttribute("cx", String(cx));
        clipCircle.setAttribute("cy", String(cy));
        clipCircle.setAttribute("r", String(r));
        clip.appendChild(clipCircle);
        defs.appendChild(clip);

        // Groupe particules inséré JUSTE AVANT CentreRondCentre => donc dessous visuellement
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
            const speed = rand(220, 520); // unités SVG / seconde
            const maxLife = rand(0.55, 1.1); // secondes
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

          // Recalage léger (si la géométrie bouge)
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

            // stop au bord du RondCentre (un peu avant pour éviter "collage" visuel)
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

      // --- BoutonsXGauche : clic => toggle opacité 10% <-> 100% + clignotement aléatoire (toutes les 3s, décalé) ---
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

        // init clignotement une seule fois par groupe
        const initKey = `blinkInit_${groupId}`;
        if (!grp.dataset[initKey]) {
          grp.dataset[initKey] = "1";

          // chaque bouton = enfant direct du groupe
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

      // --- VisualisateurTerreTOURNER : petite rotation sur lui-même ---
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

      // --- AiguilleVisualisateurViolet : petite rotation sur elle-même ---
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

      // --- RondRougePetitsBoutons : base en jaune (plus foncé si rouge d'origine est plus foncé), clic => couleur d'origine ---
      {
        const BASE_YELLOW = "#FFD400";
        const DARK_YELLOW = "#d46911"; // jaune plus foncé
        const MID_YELLOW = "#e6a900"; // jaune intermédiaire

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
            return rgb; // "rgb(r,g,b)" / "rgba(...)"
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
            // sRGB -> approx luminance [0..1]
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
            // rouge sombre => jaune plus sombre
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

          const restoreOrig = (node) => {
            const f = node.dataset.origFill;
            const s = node.dataset.origStroke;
            if (f && f !== "none") node.style.fill = f;
            if (s && s !== "none") node.style.stroke = s;
          };

          // init : tout en jaune (variant)
          buttons.forEach((btn) => {
            allLayers(btn).forEach(cacheOrigAndSetYellow);
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
        }
      }
    } catch (e) {
      /* silencieux */
    }
  });
}
