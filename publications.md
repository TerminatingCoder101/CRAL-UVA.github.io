---
title: Publication
permalink: /publication/
---

<center> 
  <h2> <span style="color:#232D4B;">Towards <span style="color:#E57200;">Human-Like</span> Mobility and Autonomy for Robots in the Real World</span></h2> 
</center>
<br>
<center><p>I work on human-like autonomy for robots. Human-like autonomy for me means three things: the robot should be able to generalize in open worlds, they should be able to reason about human intent, and they should be able to perform agile control in underactuated regimes. My current work focuses on HLA for multi-robot and human-robot systems.</p></center>

<!-- For those interested in numbers, see Rohan's [google scholar citations profile](https://scholar.google.com/citations?user=uOIgTt8AAAAJ&hl=). -->
<!-- <hr> -->

<div class="search-container">
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="Search papers..." onkeyup="filterPublications()">
    <select id="searchType" onchange="filterPublications()">
      <option value="all">All</option>
      <option value="year">Year</option>
      <option value="author">Author</option>
      <option value="venue">Venue</option>
      <option value="keyword">Keyword</option>
    </select>
  </div>
</div>

<div id="publicationsList"
     data-bib="{{ '/documents/references.bib' | relative_url }}?v={{ site.time | date: '%s' }}">
</div>

<script src="{{ '/js/publications.js' | relative_url }}"></script>

<style>
/* ---------------------------------------------------------------- search */

.search-container {
  margin: 20px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 5px;
}

.search-box {
  display: flex;
  gap: 10px;
}

#searchInput {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

#searchType {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background: white;
}

/* -------------------------------------------------------------- timeline */

.pub-timeline {
  --rail: 7.5rem;          /* width of the year column                   */
  --gap: 2.25rem;          /* space between the line and the cards        */
  --stick: var(--pub-stick, 7rem);
  --navy: 35, 45, 75;
  --accent: 229, 114, 0;

  position: relative;
  margin-top: 2.5rem;
}

/* the hairline */
.pub-timeline::before,
.pub-timeline::after {
  content: "";
  position: absolute;
  left: calc(var(--rail) - 1px);
  width: 2px;
  border-radius: 2px;
  pointer-events: none;
}

.pub-timeline::before {
  top: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(var(--navy), 0) 0,
    rgba(var(--navy), 0.13) 5rem,
    rgba(var(--navy), 0.13) calc(100% - 5rem),
    rgba(var(--navy), 0) 100%
  );
}

/* the progress trace that grows behind you */
.pub-timeline::after {
  top: 0;
  height: var(--pub-progress, 0px);
  background: linear-gradient(
    to bottom,
    rgba(var(--navy), 0) 0,
    rgba(var(--navy), 0.1) 4rem,
    rgba(var(--navy), 0.42) 100%
  );
}

.pub-year {
  position: relative;
  display: grid;
  grid-template-columns: var(--rail) minmax(0, 1fr);
  column-gap: var(--gap);
  padding-bottom: 2.5rem;
}

.pub-year.hidden { display: none; }

/* ------------------------------------------------------------- year rail */

.pub-year-rail {
  position: sticky;
  top: var(--stick);
  align-self: start;
  text-align: right;
  padding-right: 0.9rem;
}

.pub-year .pub-year-label {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: clamp(2rem, 4.6vw, 3.1rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  color: rgba(var(--navy), 0.24);
  transition: color 420ms ease, transform 420ms ease,
              -webkit-text-stroke-color 420ms ease;
}

/* outline numerals that fill in as the year becomes current */
@supports (-webkit-text-stroke: 1px #000) {
  .pub-year .pub-year-label {
    color: transparent;
    -webkit-text-stroke: 1.25px rgba(var(--navy), 0.32);
  }
  .pub-year.is-active .pub-year-label {
    color: rgba(var(--navy), 0.92);
    -webkit-text-stroke-color: transparent;
  }
}

.pub-year.is-active .pub-year-label {
  color: rgba(var(--navy), 0.92);
  transform: translateX(-2px);
}

.pub-year-count {
  display: block;
  margin-top: 0.45rem;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(var(--navy), 0.5);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 420ms ease, transform 420ms ease;
}

.pub-year.is-active .pub-year-count {
  opacity: 1;
  transform: none;
}

/* while a search is running, every year shows its live match count */
.pub-timeline.is-filtering .pub-year-count {
  opacity: 1;
  transform: none;
  color: rgba(var(--accent), 0.9);
}

.pub-empty {
  margin: 1.5rem 0 3rem;
  padding-left: calc(var(--rail) + var(--gap));
  color: rgba(var(--navy), 0.55);
  font-style: italic;
}

/* the node that rides the line with the pinned year */
.pub-year-node {
  position: absolute;
  left: 100%;
  top: 0.62em;
  transform: translate(calc(-50% - 1px), -50%);
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(var(--navy), 0.28);
  transition: border-color 420ms ease, background 420ms ease,
              box-shadow 420ms ease;
}

.pub-year.is-active .pub-year-node {
  background: rgb(var(--accent));
  border-color: rgb(var(--accent));
  box-shadow: 0 0 0 5px rgba(var(--accent), 0.15);
}

/* ----------------------------------------------------------------- cards */

.publication-item {
  margin-bottom: 1.5rem;
  padding: 1.15em 1.25em;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 260ms ease, transform 260ms ease;
}

.publication-item:hover {
  box-shadow: 0 6px 18px rgba(var(--navy), 0.12);
  transform: translateY(-2px);
}

.reveal-on .publication-item {
  opacity: 0;
  transform: translateY(14px);
}

.reveal-on .publication-item.is-revealed {
  opacity: 1;
  transform: none;
  transition: opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 620ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 260ms ease;
}

.publication-item .title {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0 0 0.5em 0;
  color: #2c3e50;
}

.publication-item .authors {
  margin: 0 0 0.3em 0;
  color: #34495e;
}

.publication-item .venue {
  margin: 0 0 0.3em 0;
  color: #7f8c8d;
  font-style: italic;
}

.publication-item .links {
  margin: 0.5em 0 0 0;
}

.publication-item .links a {
  color: #3498db;
  text-decoration: none;
}

.publication-item .links a:hover {
  text-decoration: underline;
}

.hidden { display: none; }

/* ---------------------------------------------------------------- mobile */

@media (max-width: 720px) {
  .pub-timeline::before,
  .pub-timeline::after { display: none; }

  .pub-year {
    display: block;
    padding-bottom: 1.5rem;
  }

  .pub-year-rail {
    top: 0;
    z-index: 2;
    text-align: left;
    padding: 0.4rem 0 0.5rem;
    margin-bottom: 0.75rem;
    background: linear-gradient(to bottom,
      rgba(255, 255, 255, 0.96) 65%, rgba(255, 255, 255, 0));
    border-bottom: 1px solid rgba(var(--navy), 0.1);
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  .pub-year .pub-year-label { font-size: 1.6rem; }

  .pub-year-count {
    margin-top: 0;
    opacity: 1;
    transform: none;
  }

  .pub-year-node { display: none; }

  .pub-empty { padding-left: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .publication-item,
  .pub-year-label,
  .pub-year-count,
  .pub-year-node { transition: none !important; }

  .publication-item:hover { transform: none; }
  .reveal-on .publication-item { opacity: 1; transform: none; }
}
</style>

<script>
function filterPublications() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const searchType = document.getElementById('searchType').value;
  const publications = document.getElementsByClassName('publication-item');

  Array.from(publications).forEach(pub => {
    let match = false;
    const text = pub.textContent.toLowerCase();

    switch(searchType) {
      case 'year':
        match = pub.getAttribute('data-year').includes(searchInput);
        break;
      case 'author':
        match = pub.getAttribute('data-authors').toLowerCase().includes(searchInput);
        break;
      case 'venue':
        match = pub.getAttribute('data-venue').toLowerCase().includes(searchInput);
        break;
      case 'keyword':
        match = text.includes(searchInput);
        break;
      case 'all':
        match = text.includes(searchInput);
        break;
    }

    pub.classList.toggle('hidden', !match);
  });

  // collapse a year on the timeline when every paper in it is filtered out
  document.querySelectorAll('.pub-year').forEach(section => {
    const visible = section.querySelector('.publication-item:not(.hidden)');
    section.classList.toggle('hidden', !visible);
  });

  if (window.refreshPublicationTimeline) {
    window.refreshPublicationTimeline();
  }
}
</script>