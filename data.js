// Shared helpers, plus the header and footer for every page of the site.
(function () {
  // The bot keeps these files up to date on the "data" branch of this repo
  const DATA_BASE = 'https://raw.githubusercontent.com/TheFallenStarGG/Overlord-Website/data/';
  const INVITE = 'https://discord.com/api/oauth2/authorize?client_id=1555446743515144232&permissions=268438528&scope=bot%20applications.commands';
  const SUPPORT = 'https://discord.gg/vZrsPCMHys';
  const GITHUB = 'https://github.com/TheFallenStarGG/OverLord-Bot';
  const EMAIL = 'mailto:DarkstarGaming2326@proton.me';
  const ONLINE_WITHIN_MIN = 25; // the bot checks in about every 10 minutes

  // Pages that don't exist yet stay out of the menu. Delete a name from this list once you've added that page.
  const PENDING = [];
  
  // [file, label, icon, short description]
  const NAV = [
    ['commands.html', 'Commands', '📖', 'Every command, searchable'],
    ['wiki.html', 'Wiki', '📚', 'Items, recipes, pets and more'],
    ['leaderboards.html', 'Leaderboards', '🏆', 'Richest, strongest, best'],
    ['servers.html', 'Servers', '🌐', 'Browse listed servers'],
    ['wars.html', 'Wars', '⚔️', 'Weekly server vs server'],
    ['status.html', 'Status', '📡', 'Is the bot online?'],
    ['changelog.html', 'Changelog', '📜', 'What changed lately'],
    ['setup.html', 'Setup', '⚙️', 'Admin setup guide'],
  ];
  const pages = () => NAV.filter(([href]) => !PENDING.includes(href)).map(([href, label, icon, desc]) => ({ href, label, icon, desc }));

  // ---------- Helpers ----------

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

  function duration(mins) {
    mins = Math.max(0, Math.round(mins));
    if (mins < 60) return mins + ' min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h < 48) return h + ' h' + (m ? ' ' + m + ' min' : '');
    return Math.floor(h / 24) + ' d ' + (h % 24) + ' h';
  }

  const dateText = (iso) =>
    new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  // Is the bot alive? It re-publishes status.json every ~10 minutes.
  function botState(status) {
    const ageMin = (Date.now() - new Date(status.checkedAt).getTime()) / 60000;
    return { online: ageMin < ONLINE_WITHIN_MIN, ageMin };
  }

  let toastTimer;
  function toast(message) {
    let box = document.getElementById('toast');
    if (!box) {
      box = el('div', { id: 'toast', class: 'toast', role: 'status' });
      document.body.append(box);
    }
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 1800);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const area = el('textarea', { style: 'position:fixed;opacity:0' });
        area.value = text;
        document.body.append(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  // ---------- Header & footer ----------

  const brandMark = () => el('span', { class: 'brand-mark', 'aria-hidden': 'true', text: '♛' });

  function buildHeader() {
    const here = location.pathname.split('/').pop() || 'index.html';
    let header;
    const setOpen = (open) => {
      header.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    };

    const links = pages().map((p) =>
      el('a', { href: p.href, class: p.href === here ? 'active' : null, 'aria-current': p.href === here ? 'page' : null },
        el('span', { class: 'nav-icon', 'aria-hidden': 'true', text: p.icon }), p.label)
    );
    const nav = el('nav', { class: 'nav', id: 'site-nav', 'aria-label': 'Main' }, links);
    const menuBtn = el('button', { class: 'menu-btn', type: 'button', 'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'site-nav' },
      el('span'), el('span'), el('span'));

    header = el('header', { class: 'site-header' },
      el('div', { class: 'wrap' },
        el('a', { class: 'brand', href: 'index.html' }, brandMark(), el('span', { class: 'brand-text', text: 'The Overlord' })),
        nav,
        el('a', { class: 'btn btn-sm', href: INVITE, text: 'Invite' }),
        menuBtn));

    menuBtn.addEventListener('click', () => setOpen(!header.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', (e) => { if (!header.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1000) setOpen(false); });
    return header;
  }

  function buildFooter() {
    const live = new Set(pages().map((p) => p.href));
    const inFooter = (files) => NAV.filter(([href]) => files.includes(href) && live.has(href)).map(([href, label]) => [label, href]);
    const col = (title, links) =>
      el('div', { class: 'foot-col' }, el('h3', { text: title }),
        links.map(([label, href, external]) =>
          el('a', { href, target: external ? '_blank' : null, rel: external ? 'noopener' : null, text: label })));

    return el('footer', { class: 'site-footer' },
      el('div', { class: 'wrap' },
        el('div', { class: 'foot-grid' },
          el('div', { class: 'foot-brand' },
            el('a', { class: 'brand', href: 'index.html' }, brandMark(), el('span', { class: 'brand-text', text: 'The Overlord' })),
            el('p', { class: 'foot-blurb', text: 'A Discord bot with a server economy, a living realm, duels, bosses and a stock market.' })),
          col('Explore', inFooter(['commands.html', 'wiki.html', 'leaderboards.html', 'servers.html', 'wars.html'])),
          col('More', inFooter(['status.html', 'changelog.html', 'setup.html'])),
          col('Help', [
            ['Support server', SUPPORT, true],
            ['Source code', GITHUB, true],
            ['Email', EMAIL],
            ['Terms', 'terms.html'],
            ['Privacy', 'privacy.html'],
          ])),
        el('p', { class: 'foot-legal', text: '© 2026 The Overlord · Not affiliated with Discord Inc.' })));
  }

  function mountLayout() {
    if (!document.querySelector('link[rel~="icon"]')) {
      document.head.append(el('link', {
        rel: 'icon',
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23e0b84a'/%3E%3Ctext x='32' y='47' font-size='40' text-anchor='middle' fill='%231a1205'%3E%26%239819%3B%3C/text%3E%3C/svg%3E",
      }));
    }

    const header = buildHeader();
    const oldHeader = document.querySelector('header.site-header');
    if (oldHeader) oldHeader.replaceWith(header);
    else document.body.prepend(header);

    const placeFooter = () => {
      const footer = buildFooter();
      const oldFooter = document.querySelector('footer.site-footer');
      if (oldFooter) oldFooter.replaceWith(footer);
      else document.body.append(footer);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', placeFooter);
    else placeFooter();
  }

  const medal = (i) => ['🥇', '🥈', '🥉'][i] || String(i + 1);

  // A round server icon (shows the first letter until the picture loads, or if there is none)
  function avatar(server, size = 40) {
    const letter = (Array.from((server.name || '').trim())[0] || '?').toUpperCase();
    const box = el('span', {
      class: 'avatar',
      style: 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.45) + 'px',
      'aria-hidden': 'true',
      text: letter,
    });
    if (server.icon) {
      const img = new Image();
      img.alt = '';
      img.width = size;
      img.height = size;
      img.addEventListener('load', () => box.replaceChildren(img));
      img.src = server.icon;
    }
    return box;
  }

  window.Overlord = { fetchData, fmt, el, rich, timeAgo, duration, dateText, botState, toast, copy, pages, avatar, medal, INVITE, SUPPORT };
  mountLayout();
})();
