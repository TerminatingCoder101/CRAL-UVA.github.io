/*
 * publications.js
 *
 * Fetches a BibTeX file, discards junk entries, deduplicates, derives links,
 * and renders a scrolling year timeline into #publicationsList.
 * The bib URL comes from the data-bib attribute on that element.
 *
 * Designed so you can dump a raw Google Scholar export straight into the bib
 * without cleaning it by hand. Set CONFIG.logDropped to see, in the browser
 * console, every entry that was filtered out and why.
 */
(function () {
  "use strict";

  var CONFIG = {
    /* Entries that do not list this person as an author are dropped. */
    owner: "Rohan Chandra",

    /* Bib keys to hide regardless. Use for same name authors and any
       entry that survives the filters but is not yours. */
    drop: ["chopra2018small", "chandra2024exploring"],

    /* Entry types to keep. Add "phdthesis" to show your dissertation. */
    types: ["article", "inproceedings", "incollection", "inbook",
            "book", "conference", "proceedings"],

    /* Drop entries with no year. Turn off to show them under "Under Review". */
    requireYear: true,

    /* Log dropped entries to the console. */
    logDropped: true,

    /* Distance in px from the top of the viewport where the year pins.
       Raise it if your theme has a tall fixed header. */
    stickyOffset: 112
  };

  /* Titles matching any of these are mangled Scholar records, not papers. */
  var JUNK_TITLE = [
    /^proceedings of/i,
    /arxiv\s*(e-?prints|abs)/i,
    /\.\s*preprint\s*$/i,
    /,\s*(19|20)\d{2}\.?\s*$/,
    /\.\s+in\s+/i,
    /\.\s*(19|20)\d{2}\.\s/,
    /\bet\s+al\b/i
  ];

  var ACCENTS = {
    "\\&": "&",
    "\\'a": "\u00e1", "\\'e": "\u00e9", "\\'i": "\u00ed",
    "\\'o": "\u00f3", "\\'u": "\u00fa", "\\'n": "\u0144",
    "\\`a": "\u00e0", "\\`e": "\u00e8", "\\`o": "\u00f2",
    '\\"a': "\u00e4", '\\"o': "\u00f6", '\\"u': "\u00fc",
    "\\~n": "\u00f1", "\\~a": "\u00e3", "\\^e": "\u00ea",
    "\\c c": "\u00e7", "\\ss": "\u00df"
  };

  var SKIP_TYPES = { string: 1, comment: 1, preamble: 1 };

  /* ------------------------------ parsing ------------------------------ */

  function clean(value) {
    Object.keys(ACCENTS).forEach(function (key) {
      value = value.split(key).join(ACCENTS[key]);
    });
    return value
      .replace(/[{}]/g, "")
      .replace(/\\/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* Split an entry body on commas that sit outside braces and quotes. */
  function splitTopLevel(body) {
    var parts = [], depth = 0, quoted = false, buf = "";
    for (var i = 0; i < body.length; i++) {
      var ch = body[i];
      if (ch === "{") { depth++; }
      else if (ch === "}") { depth--; }
      else if (ch === '"' && depth === 0) { quoted = !quoted; }

      if (ch === "," && depth === 0 && !quoted) {
        parts.push(buf);
        buf = "";
      } else {
        buf += ch;
      }
    }
    parts.push(buf);
    return parts;
  }

  function parseBib(text) {
    text = text.replace(/^\s*%.*$/gm, "");
    var entries = [], re = /@(\w+)\s*\{/g, match;

    while ((match = re.exec(text)) !== null) {
      var start = match.index + match[0].length;
      var depth = 1, i = start;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") { depth++; }
        else if (text[i] === "}") { depth--; }
        i++;
      }
      re.lastIndex = i;

      var type = match[1].toLowerCase();
      if (SKIP_TYPES[type]) { continue; }

      var chunks = splitTopLevel(text.slice(start, i - 1));
      var entry = { entrytype: type, key: chunks[0].trim() };
      for (var c = 1; c < chunks.length; c++) {
        var eq = chunks[c].indexOf("=");
        if (eq === -1) { continue; }
        var name = chunks[c].slice(0, eq).trim().toLowerCase();
        entry[name] = clean(chunks[c].slice(eq + 1).trim().replace(/,$/, ""));
      }
      entries.push(entry);
    }
    return entries;
  }

  /* ------------------------------ filtering ------------------------------ */

  function tokens(name) {
    return name.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)
      .filter(Boolean);
  }

  function authorList(entry) {
    return (entry.author || "").split(/\s+and\s+/)
      .map(function (n) { return n.trim(); })
      .filter(Boolean);
  }

  /* True when one of the authors is the owner, in any name order. */
  function hasOwner(entry) {
    var want = tokens(CONFIG.owner);
    return authorList(entry).some(function (name) {
      var got = tokens(name);
      return want.every(function (part) { return got.indexOf(part) !== -1; });
    });
  }

  function venueString(entry) {
    return entry.booktitle || entry.journal || entry.school || "";
  }

  /* A journal field that is really a URL is not a venue. */
  function venueIsJunk(venue) {
    return !venue || /^url\b/i.test(venue) || /https?:\/\//i.test(venue);
  }

  function isPreprintVenue(venue) {
    return /arxiv|preprint/i.test(venue);
  }

  /* Pull an arXiv id out of eprint, journal, note, or url. */
  function arxivId(entry) {
    var hay = [entry.eprint, entry.journal, entry.note,
               entry.howpublished, entry.url].filter(Boolean).join(" ");
    if (!/arxiv/i.test(hay) && !entry.eprint) { return null; }
    var match = hay.match(/(\d{4}\.\d{4,5})/);
    return match ? match[1] : null;
  }

  /* Returns a reason string when the entry should be dropped, else null. */
  function rejectReason(entry) {
    if (CONFIG.drop.indexOf(entry.key) !== -1) { return "on drop list"; }
    if (CONFIG.types.indexOf(entry.entrytype) === -1) {
      return "entry type " + entry.entrytype;
    }
    if (!entry.title) { return "no title"; }
    if (/patent/i.test(entry.note || "") || /patent/i.test(entry.title)) {
      return "patent";
    }
    if (!hasOwner(entry)) { return "author list omits " + CONFIG.owner; }

    var ownerInTitle = tokens(CONFIG.owner).every(function (part) {
      return tokens(entry.title).indexOf(part) !== -1;
    });
    if (ownerInTitle) { return "author name inside the title"; }

    for (var i = 0; i < JUNK_TITLE.length; i++) {
      if (JUNK_TITLE[i].test(entry.title)) { return "mangled title"; }
    }

    var venue = venueString(entry);
    if (venueIsJunk(venue) && !arxivId(entry)) { return "no venue"; }
    if (CONFIG.requireYear && !entry.year) { return "no year"; }

    return null;
  }

  /* ------------------------------ dedup ------------------------------ */

  function normTitle(title) {
    return title.toLowerCase()
      .replace(/\.\s*preprint\s*$/, "")
      .replace(/,\s*(19|20)\d{2}\.?\s*$/, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  /* Higher wins: a real venue beats a preprint, a link beats no link,
     a full author list beats a truncated one. */
  function score(entry) {
    var venue = venueString(entry);
    var points = 0;
    if (!venueIsJunk(venue) && !isPreprintVenue(venue)) { points += 40; }
    if (entry.url) { points += 20; }
    if (entry.doi) { points += 10; }
    if (arxivId(entry)) { points += 5; }
    points += authorList(entry).length;
    points += (parseInt(entry.year, 10) || 0) / 10000;
    return points;
  }

  function dedupe(entries, dropped) {
    var best = {};
    entries.forEach(function (entry) {
      var norm = normTitle(entry.title);
      if (!best[norm] || score(entry) > score(best[norm])) {
        best[norm] = entry;
      }
    });
    return entries.filter(function (entry) {
      if (best[normTitle(entry.title)] === entry) { return true; }
      dropped.push({ key: entry.key, reason: "duplicate", title: entry.title });
      return false;
    });
  }

  /* ------------------------------ rendering ------------------------------ */

  function formatAuthors(raw) {
    if (!raw) { return ""; }
    return raw.split(/\s+and\s+/).map(function (name) {
      name = name.trim();
      var comma = name.indexOf(",");
      if (comma !== -1) {
        name = (name.slice(comma + 1).trim() + " " + name.slice(0, comma).trim()).trim();
      }
      return name;
    }).join(", ");
  }

  function displayVenue(entry) {
    var place = venueString(entry) || entry.publisher || entry.note || "";
    var year = entry.year || "";
    if (place && year) { return place + ", " + year; }
    return place || year;
  }

  function filterVenue(entry) {
    return entry.venue || venueString(entry);
  }

  function doiUrl(entry) {
    if (!entry.doi) { return null; }
    var doi = entry.doi.replace(/^\s*(doi:|https?:\/\/(dx\.)?doi\.org\/)\s*/i, "").trim();
    return doi ? "https://doi.org/" + doi : null;
  }

  function buildLinks(entry) {
    var links = [], seen = {};

    function add(label, href) {
      if (!href || seen[href]) { return; }
      seen[href] = true;
      links.push({ label: label, href: href });
    }

    var arxiv = arxivId(entry);
    var arxivHref = arxiv ? "https://arxiv.org/pdf/" + arxiv : null;

    if (entry.url) {
      add("PDF", entry.url);
      add("arXiv", arxivHref);
    } else if (arxivHref) {
      add("PDF", arxivHref);
    }

    add("DOI", doiUrl(entry));
    add("Project", entry.project);
    add("Code", entry.code);
    add("Video", entry.video);

    if (!links.length) {
      add("Search", "https://scholar.google.com/scholar?q=" +
        encodeURIComponent(entry.title || ""));
    }
    return links;
  }

  function renderLinks(entry) {
    return buildLinks(entry).map(function (link) {
      return '<a href="' + escapeHtml(link.href) + '">' + link.label + "</a>";
    }).join(", ");
  }

  function renderEntry(entry) {
    var authors = formatAuthors(entry.author);
    return [
      '<div class="publication-item" data-year="' + escapeHtml(entry.year || "") +
        '" data-authors="' + escapeHtml(authors) +
        '" data-venue="' + escapeHtml(filterVenue(entry)) + '">',
      '<p class="title">' + escapeHtml(entry.title || "") + "</p>",
      '<p class="authors">' + escapeHtml(authors) + "</p>",
      '<p class="venue">' + escapeHtml(displayVenue(entry)) + "</p>",
      '<p class="links">' + renderLinks(entry) + "</p>",
      "</div>"
    ].join("\n");
  }

  function paperCount(n) {
    return n + (n === 1 ? " paper" : " papers");
  }

  function renderYear(year, items) {
    var label = year || "Under Review";
    return [
      '<section class="pub-year" data-year="' + escapeHtml(year) +
        '" data-total="' + items.length + '">',
      '<div class="pub-year-rail">',
      '<h4 class="pub-year-label">' + escapeHtml(label) + "</h4>",
      '<span class="pub-year-count">' + paperCount(items.length) + "</span>",
      '<span class="pub-year-node" aria-hidden="true"></span>',
      "</div>",
      '<div class="pub-year-items">',
      items.map(renderEntry).join("\n"),
      "</div>",
      "</section>"
    ].join("\n");
  }

  function renderAll(entries) {
    var groups = {};
    entries.forEach(function (entry) {
      var year = entry.year || "";
      if (!groups[year]) { groups[year] = []; }
      groups[year].push(entry);
    });

    var years = Object.keys(groups).sort(function (a, b) {
      var av = /^\d+$/.test(a) ? parseInt(a, 10) : 1e6;
      var bv = /^\d+$/.test(b) ? parseInt(b, 10) : 1e6;
      return bv - av;
    });

    return '<div class="pub-timeline">\n' +
      years.map(function (year) { return renderYear(year, groups[year]); }).join("\n") +
      "\n</div>";
  }

  /* -------------------------- scroll behaviour -------------------------- */

  function reducedMotion() {
    return window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Pins the year rail, tracks which year the reader is inside, and grows
     the progress trace down the line. */
  function enhance(container) {
    var timeline = container.querySelector && container.querySelector(".pub-timeline");
    if (!timeline) { return; }

    var sections = [].slice.call(timeline.querySelectorAll(".pub-year"));
    if (!sections.length) { return; }

    timeline.style.setProperty("--pub-stick", CONFIG.stickyOffset + "px");

    var empty = document.createElement("p");
    empty.className = "pub-empty hidden";
    empty.textContent = "No papers match that search.";
    timeline.appendChild(empty);

    /* Recount every year against whatever the search box has left visible. */
    function syncCounts() {
      var filtering = false, anyVisible = false;

      sections.forEach(function (section) {
        var label = section.querySelector(".pub-year-count");
        var total = parseInt(section.getAttribute("data-total"), 10) || 0;
        var shown = section.querySelectorAll(
          ".publication-item:not(.hidden)").length;

        if (shown !== total) { filtering = true; }
        if (shown > 0) { anyVisible = true; }
        if (label) {
          label.textContent = shown === total
            ? paperCount(total)
            : shown + " of " + total;
        }
      });

      timeline.classList.toggle("is-filtering", filtering);
      empty.classList.toggle("hidden", anyVisible);
    }

    if (window.IntersectionObserver && !reducedMotion()) {
      timeline.classList.add("reveal-on");
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          entry.target.classList.add("is-revealed");
          reveal.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

      [].forEach.call(timeline.querySelectorAll(".publication-item"),
        function (item) { reveal.observe(item); });
    }

    /* The scanline is the y where the rail pins, so the active year is always
       the one whose label is currently on screen. */
    function scanline() {
      var rail = sections[0].querySelector(".pub-year-rail");
      var top = parseFloat(window.getComputedStyle(rail).top);
      return (isNaN(top) ? CONFIG.stickyOffset : top) + 4;
    }

    var active = null;

    function update() {
      var line = scanline();
      var current = sections[0];

      sections.forEach(function (section) {
        if (section.classList.contains("hidden")) { return; }
        if (section.getBoundingClientRect().top <= line) { current = section; }
      });

      if (current !== active) {
        if (active) { active.classList.remove("is-active"); }
        current.classList.add("is-active");
        active = current;
      }

      var box = timeline.getBoundingClientRect();
      var grown = Math.min(Math.max(line - box.top, 0), box.height);
      timeline.style.setProperty("--pub-progress", grown + "px");
    }

    var queued = false;
    function onScroll() {
      if (queued) { return; }
      queued = true;
      var raf = window.requestAnimationFrame ||
        function (fn) { return setTimeout(fn, 16); };
      raf(function () { update(); queued = false; });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    syncCounts();
    update();

    /* The search box calls this after it hides entries. */
    window.refreshPublicationTimeline = function () {
      syncCounts();
      update();
    };
  }

  /* ------------------------------ pipeline ------------------------------ */

  function process(text) {
    var parsed = parseBib(text);
    var dropped = [];

    var kept = parsed.filter(function (entry) {
      var reason = rejectReason(entry);
      if (reason) {
        dropped.push({ key: entry.key, reason: reason, title: entry.title || "" });
        return false;
      }
      return true;
    });

    kept = dedupe(kept, dropped);

    if (CONFIG.logDropped && dropped.length && window.console) {
      console.groupCollapsed("publications.js: kept " + kept.length +
        " of " + parsed.length + ", dropped " + dropped.length);
      if (console.table) { console.table(dropped); }
      else { dropped.forEach(function (d) { console.log(d.key, d.reason); }); }
      console.groupEnd();
    }
    return kept;
  }

  function init() {
    var container = document.getElementById("publicationsList");
    if (!container) { return; }

    var url = container.getAttribute("data-bib");
    if (!url) { return; }

    fetch(url)
      .then(function (response) {
        if (!response.ok) { throw new Error("HTTP " + response.status); }
        return response.text();
      })
      .then(function (text) {
        var entries = process(text);
        if (!entries.length) { throw new Error("no entries survived filtering"); }
        container.innerHTML = renderAll(entries);
        enhance(container);
      })
      .catch(function (err) {
        container.innerHTML = "<p>Publication list unavailable. " +
          'See <a href="https://scholar.google.com/citations?user=uOIgTt8AAAAJ">' +
          "Google Scholar</a>.</p>";
        console.error("publications.js:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();