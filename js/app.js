/* IntrinsIQ interface enhancements. Data and authentication remain in the existing Supabase application script. */
(function () {
  var KEY = 'intrinsiq_module_layout';
  var modules = [
    { key: 'overview', name: 'Overview' }, { key: 'ase', name: 'Auto Strategy Engine' },
    { key: 'cc', name: 'Community Forum' }, { key: 'tj', name: 'Trade Journal' },
    { key: 'notif', name: 'Notifications & News' }, { key: 'future', name: 'Future Modules' }, { key: 'settings', name: 'Settings' }
  ];
  var layout = { active: modules.map(function (m) { return m.key; }), hidden: [] };
  function valid(data) {
    if (!data || !Array.isArray(data.active) || !Array.isArray(data.hidden)) return false;
    var all = data.active.concat(data.hidden);
    return all.length === modules.length && all.every(function (k) { return modules.some(function (m) { return m.key === k; }); }) && new Set(all).size === modules.length;
  }
  function load() { try { var saved = JSON.parse(localStorage.getItem(KEY)); if (valid(saved)) layout = saved; } catch (e) { } }
  function save() { localStorage.setItem(KEY, JSON.stringify(layout)); applySidebar(); renderModal(); }
  function label(key) { return modules.filter(function (m) { return m.key === key; })[0].name; }
  function applySidebar() {
    layout.active.concat(layout.hidden).forEach(function (key, index) {
      var node = document.querySelector('.nav-item[data-page="' + key + '"]');
      if (!node) return;
      node.style.display = layout.active.indexOf(key) > -1 ? '' : 'none';
      node.style.order = String(index + 1);
    });
    var active = document.querySelector('.nav-item.active');
    if (active && layout.hidden.indexOf(active.dataset.page) > -1 && layout.active.length && window.navigateTo) window.navigateTo(layout.active[0]);
  }
  function item(key, zone) {
    var row = document.createElement('div'); row.className = 'module-row'; row.dataset.key = key;
    var handle = document.createElement('span'); handle.className = 'module-handle'; handle.textContent = '☷'; handle.draggable = true; handle.setAttribute('aria-label', 'Drag ' + label(key));
    handle.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', key); e.dataTransfer.effectAllowed = 'move'; });
    row.addEventListener('dragover', function (e) { e.preventDefault(); row.parentElement.classList.add('drag-over'); });
    row.addEventListener('drop', function (e) { e.preventDefault(); var dragged = e.dataTransfer.getData('text/plain'); var from = layout.active.indexOf(dragged) > -1 ? 'active' : 'hidden'; if (from !== zone) { transfer(dragged, from); return; } var list = layout[zone], old = list.indexOf(dragged), target = list.indexOf(key); if (old !== target) { list.splice(old, 1); list.splice(target, 0, dragged); save(); } });
    row.appendChild(handle); var name = document.createElement('span'); name.textContent = label(key); row.appendChild(name);
    [['↑', 'Move up', function () { move(key, zone, -1) }], ['↓', 'Move down', function () { move(key, zone, 1) }], [zone === 'active' ? '−' : '+', zone === 'active' ? 'Move to hidden' : 'Move to active', function () { transfer(key, zone) }]].forEach(function (x) { var b = document.createElement('button'); b.textContent = x[0]; b.title = x[1]; b.setAttribute('aria-label', x[1] + ' ' + label(key)); b.onclick = x[2]; row.appendChild(b); });
    return row;
  }
  function renderModal() { var a = document.getElementById('activeModuleList'), h = document.getElementById('hiddenModuleList'); if (!a || !h) return; a.innerHTML = ''; h.innerHTML = ''; layout.active.forEach(function (k) { a.appendChild(item(k, 'active')); }); if (layout.hidden.length) layout.hidden.forEach(function (k) { h.appendChild(item(k, 'hidden')); }); else { var hint = document.createElement('span'); hint.className = 'drop-hint'; hint.textContent = 'Drop modules here'; h.appendChild(hint); } }
  function transfer(key, from) { var src = layout[from], dest = layout[from === 'active' ? 'hidden' : 'active']; src.splice(src.indexOf(key), 1); dest.push(key); save(); }
  function move(key, zone, by) { var a = layout[zone], i = a.indexOf(key), to = i + by; if (to < 0 || to >= a.length) return;[a[i], a[to]] = [a[to], a[i]]; save(); }
  function drop(zone, e) { e.preventDefault(); var key = e.dataTransfer.getData('text/plain'); if (!key) return; var from = layout.active.indexOf(key) > -1 ? 'active' : 'hidden'; if (from !== zone) transfer(key, from); }
  window.openAuth = function (tab) {
  var landingPage = document.getElementById('landingPage');
  var loginScreen = document.getElementById('loginScreen');
  var resetScreen = document.getElementById('resetScreen');

  if (landingPage) {
    landingPage.style.display = 'none';
  }

  if (resetScreen) {
    resetScreen.style.display = 'none';
    resetScreen.classList.remove('auth-open');
  }

  if (loginScreen) {
    loginScreen.style.display = 'flex';
    loginScreen.classList.add('auth-open');
  }

  if (window.switchAuthTab) {
    window.switchAuthTab(tab || 'login');
  }

  window.scrollTo(0, 0);
};
  window.openWorkspaceModal = function () { var m = document.getElementById('workspaceModal'); m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); renderModal(); };
  window.closeWorkspaceModal = function () { var m = document.getElementById('workspaceModal'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); };
  window.restoreDefaultModules = function () { layout = { active: modules.map(function (m) { return m.key; }), hidden: [] }; save(); };
  document.addEventListener('DOMContentLoaded', function () { load(); applySidebar();['active', 'hidden'].forEach(function (zone) { var el = document.getElementById(zone + 'ModuleList'); if (!el) return; el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('drag-over'); }); el.addEventListener('dragleave', function () { el.classList.remove('drag-over'); }); el.addEventListener('drop', function (e) { el.classList.remove('drag-over'); drop(zone, e); }); }); document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.closeWorkspaceModal(); }); var app = document.getElementById('appRoot'), landing = document.getElementById('landingPage'); new MutationObserver(function () { if (app.style.display === 'flex' || app.classList.contains('active')) landing.style.display = 'none'; }).observe(app, { attributes: true, attributeFilter: ['style', 'class'] }); });
  document.addEventListener('DOMContentLoaded', function () { var nav = document.querySelector('.landing-nav'); if (!nav) return; var sync = function () { nav.classList.toggle('scrolled', window.scrollY > 8); }; sync(); window.addEventListener('scroll', sync, { passive: true }); });
})();


/* Overview panel arrangement: presentation-only; data sources and DOM IDs remain unchanged. */
(function () {
  var OVERVIEW_KEY = 'intrinsiq_overview_layout';
  var panelNames = { market: 'Market Snapshot', portfolio: 'Portfolio Overview', strategies: 'Strategy Breakdown', trades: 'Live Trade Monitor', alerts: 'Alerts & Notifications' };
  var overview = { active: Object.keys(panelNames), hidden: [] };
  function overviewValid(v) { var all = v && [].concat(v.active || [], v.hidden || []); return v && Array.isArray(v.active) && Array.isArray(v.hidden) && all.length === Object.keys(panelNames).length && new Set(all).size === all.length && all.every(function (k) { return panelNames[k]; }); }
  function loadOverview() { try { var saved = JSON.parse(localStorage.getItem(OVERVIEW_KEY)); if (overviewValid(saved)) overview = saved; } catch (e) { } }
  function applyOverview() { var host = document.getElementById('overviewPanels'); if (!host) return; overview.active.concat(overview.hidden).forEach(function (key) { var panel = host.querySelector('[data-overview-panel="' + key + '"]'); if (!panel) return; panel.style.display = overview.active.indexOf(key) > -1 ? '' : 'none'; host.appendChild(panel); bindOverviewPanel(panel, key); }); renderOverviewDock(host); }
  function bindOverviewPanel(panel, key) { if (panel.dataset.overviewDragBound) return; var title = panel.querySelector('h2'); if (title) { var handle = document.createElement('button'); handle.className = 'overview-drag-handle'; handle.type = 'button'; handle.textContent = '☷'; handle.draggable = true; handle.title = 'Drag to reorder or hide this panel'; handle.setAttribute('aria-label', 'Drag ' + panelNames[key]); handle.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/intrinsiq-overview', key); e.dataTransfer.effectAllowed = 'move'; }); title.insertBefore(handle, title.firstChild); } panel.addEventListener('dragover', function (e) { if (Array.from(e.dataTransfer.types).indexOf('text/intrinsiq-overview') > -1) { e.preventDefault(); panel.classList.add('overview-drop-target'); } }); panel.addEventListener('dragleave', function () { panel.classList.remove('overview-drop-target'); }); panel.addEventListener('drop', function (e) { panel.classList.remove('overview-drop-target'); var dragged = e.dataTransfer.getData('text/intrinsiq-overview'); if (!dragged || dragged === key) return; e.preventDefault(); var from = overview.active.indexOf(dragged) > -1 ? 'active' : 'hidden'; if (from !== 'active') { transferOverview(dragged, from); return; } var old = overview.active.indexOf(dragged), target = overview.active.indexOf(key); overview.active.splice(old, 1); overview.active.splice(target, 0, dragged); saveOverview(); }); panel.dataset.overviewDragBound = '1'; }
  function renderOverviewDock(host) { var dock = document.getElementById('overviewHiddenDock'); if (!dock) { dock = document.createElement('div'); dock.id = 'overviewHiddenDock'; dock.className = 'overview-hidden-dock'; host.parentNode.insertBefore(dock, host.nextSibling); } dock.innerHTML = ''; var label = document.createElement('span'); label.className = 'overview-dock-label'; label.textContent = overview.hidden.length ? 'HIDDEN PANELS' : 'DROP A PANEL HERE TO HIDE IT'; dock.appendChild(label); overview.hidden.forEach(function (key) { var restore = document.createElement('button'); restore.type = 'button'; restore.textContent = '+ Restore ' + panelNames[key]; restore.onclick = function () { transferOverview(key, 'hidden'); }; dock.appendChild(restore); }); if (!dock.dataset.overviewDockBound) { dock.addEventListener('dragover', function (e) { if (Array.from(e.dataTransfer.types).indexOf('text/intrinsiq-overview') > -1) { e.preventDefault(); dock.classList.add('drag-over'); } }); dock.addEventListener('dragleave', function () { dock.classList.remove('drag-over'); }); dock.addEventListener('drop', function (e) { dock.classList.remove('drag-over'); var dragged = e.dataTransfer.getData('text/intrinsiq-overview'); if (!dragged) return; e.preventDefault(); var from = overview.active.indexOf(dragged) > -1 ? 'active' : 'hidden'; if (from === 'active') transferOverview(dragged, from); }); dock.dataset.overviewDockBound = '1'; } }
  function saveOverview() { localStorage.setItem(OVERVIEW_KEY, JSON.stringify(overview)); applyOverview(); renderOverviewModal(); }
  function moveOverview(key, zone, by) { var list = overview[zone], at = list.indexOf(key), next = at + by; if (next < 0 || next >= list.length) return;[list[at], list[next]] = [list[next], list[at]]; saveOverview(); }
  function transferOverview(key, from) { var source = overview[from], destination = overview[from === 'active' ? 'hidden' : 'active']; source.splice(source.indexOf(key), 1); destination.push(key); saveOverview(); }
  function overviewRow(key, zone) { var row = document.createElement('div'); row.className = 'module-row'; row.dataset.key = key; var handle = document.createElement('span'); handle.className = 'module-handle'; handle.textContent = '☷'; handle.draggable = true; handle.setAttribute('aria-label', 'Drag ' + panelNames[key]); handle.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/intrinsiq-overview', key); e.dataTransfer.effectAllowed = 'move'; }); row.addEventListener('dragover', function (e) { if (Array.from(e.dataTransfer.types).indexOf('text/intrinsiq-overview') > -1) e.preventDefault(); }); row.addEventListener('drop', function (e) { var dragged = e.dataTransfer.getData('text/intrinsiq-overview'); if (!dragged) return; e.preventDefault(); var from = overview.active.indexOf(dragged) > -1 ? 'active' : 'hidden'; if (from !== zone) { transferOverview(dragged, from); return; } var list = overview[zone], old = list.indexOf(dragged), target = list.indexOf(key); if (old !== target) { list.splice(old, 1); list.splice(target, 0, dragged); saveOverview(); } }); row.appendChild(handle); var name = document.createElement('span'); name.textContent = panelNames[key]; row.appendChild(name);[['↑', 'Move up', function () { moveOverview(key, zone, -1) }], ['↓', 'Move down', function () { moveOverview(key, zone, 1) }], [zone === 'active' ? '−' : '+', zone === 'active' ? 'Move to hidden' : 'Move to visible', function () { transferOverview(key, zone) }]].forEach(function (x) { var button = document.createElement('button'); button.textContent = x[0]; button.title = x[1]; button.setAttribute('aria-label', x[1] + ' ' + panelNames[key]); button.onclick = x[2]; row.appendChild(button); }); return row; }
  function renderOverviewModal() { var active = document.getElementById('overviewActiveList'), hidden = document.getElementById('overviewHiddenList'); if (!active || !hidden) return; active.innerHTML = ''; hidden.innerHTML = ''; overview.active.forEach(function (key) { active.appendChild(overviewRow(key, 'active')); }); if (overview.hidden.length) overview.hidden.forEach(function (key) { hidden.appendChild(overviewRow(key, 'hidden')); }); else { var hint = document.createElement('span'); hint.className = 'drop-hint'; hint.textContent = 'Drop panels here'; hidden.appendChild(hint); } }
  function overviewZone(zone, event) { event.preventDefault(); var key = event.dataTransfer.getData('text/intrinsiq-overview'); if (!key) return; var from = overview.active.indexOf(key) > -1 ? 'active' : 'hidden'; if (from !== zone) transferOverview(key, from); }
  window.openOverviewCustomize = function () { var modal = document.getElementById('overviewCustomizeModal'); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); renderOverviewModal(); };
  window.closeOverviewCustomize = function () { var modal = document.getElementById('overviewCustomizeModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
  window.restoreOverviewDefaults = function () { overview = { active: Object.keys(panelNames), hidden: [] }; saveOverview(); };
  document.addEventListener('DOMContentLoaded', function () { loadOverview(); applyOverview();['active', 'hidden'].forEach(function (zone) { var el = document.getElementById(zone === 'active' ? 'overviewActiveList' : 'overviewHiddenList'); if (!el) return; el.addEventListener('dragover', function (e) { if (Array.from(e.dataTransfer.types).indexOf('text/intrinsiq-overview') > -1) { e.preventDefault(); el.classList.add('drag-over'); } }); el.addEventListener('dragleave', function () { el.classList.remove('drag-over'); }); el.addEventListener('drop', function (e) { el.classList.remove('drag-over'); overviewZone(zone, e); }); }); document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.closeOverviewCustomize(); }); });
})();
