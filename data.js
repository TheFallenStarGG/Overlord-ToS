// Shared helpers for the changelog and leaderboard pages.
(function () {
  // The bot keeps these files up to date on the "data" branch of this repo
  const DATA_BASE = 'https://raw.githubusercontent.com/TheFallenStarGG/Overlord-ToS/data/';

  async function fetchData(file) {
    const res = await fetch(DATA_BASE + file, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Could not load ' + file + ' (' + res.status + ')');
    return res.json();
  }

  const fmt = (n) => Number(n).toLocaleString('en-US');

  // Builds an element. Strings are always added as plain text, never as HTML.
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else node.setAttribute(key, value);
    }
    for (const child of children.flat()) if (child != null && child !== false) node.append(child);
    return node;
  }

  // The bot's text uses `code` and **bold**; everything else stays plain text
  function rich(text) {
    const frag = document.createDocumentFragment();
    String(text).split(/(`[^`]+`|\*\*[^*]+\*\*)/).forEach((part) => {
      if (!part) return;
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) frag.append(el('code', { text: part.slice(1, -1) }));
      else if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) frag.append(el('strong', { text: part.slice(2, -2) }));
      else frag.append(part);
    });
    return frag;
  }

  function timeAgo(iso) {
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hours = Math.round(mins / 60);
    return hours < 48 ? hours + ' h ago' : Math.round(hours / 24) + ' days ago';
  }

  window.Overlord = { fetchData, fmt, el, rich, timeAgo };
})();
