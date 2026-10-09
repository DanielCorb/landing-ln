/**
 * Lumea Nouă tracking SDK (generated).
 * Set LN_INGEST_KEY, LN_DATA_KEY (≥8), optional LN_API_BASE
 * via import.meta.env, process.env, or window.__LN_TRACKING__.
 */
function lnDeriveKey(passphrase, salt) {
  var enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']).then(function (baseKey) {
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 120000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  });
}
function lnBytesToB64(bytes) {
  var binary = '';
  for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function lnEncryptPayloadJson(json, passphrase) {
  var salt = crypto.getRandomValues(new Uint8Array(16));
  var iv = crypto.getRandomValues(new Uint8Array(12));
  return lnDeriveKey(passphrase, salt).then(function (key) {
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(json));
  }).then(function (cipher) {
    var c = new Uint8Array(cipher);
    var packed = new Uint8Array(16 + 12 + c.length);
    packed.set(salt, 0);
    packed.set(iv, 16);
    packed.set(c, 28);
    return 'ln1:' + lnBytesToB64(packed);
  });
}
function lnEncryptPropertiesMandatory(payload) {
  var key = lnResolveDataKey();
  if (!key || key.length < 8) {
    return Promise.reject(new Error('Set LN_DATA_KEY — events are not sent without encryption'));
  }
  return lnEncryptPayloadJson(JSON.stringify(payload), key).then(function (blob) {
    return { __ln_enc: 1, v: 1, blob: blob };
  });
}

var LnEvents = [{"eventKey":"article_visits","variables":[{"name":"slug","type":"string"},{"name":"article_path","type":"string"},{"name":"active_ms","type":"number"},{"name":"total_ms","type":"number"},{"name":"scroll_depth_pct","type":"number"},{"name":"milestone","type":"string"},{"name":"sessionId","type":"string"}],"trigger":{"kind":"article","path":"/postare/*"},"telemetryFields":["session_id","session_start","session_duration_ms"]},{"eventKey":"contact","variables":[],"trigger":{"kind":"click","selector":"#nav-contact"},"telemetryFields":["session_id"]},{"eventKey":"despre_noi","variables":[],"trigger":{"kind":"click","selector":"#nav-despre-noi"},"telemetryFields":["session_id"]},{"eventKey":"email","variables":[],"trigger":{"kind":"click","selector":"#contact-email"},"telemetryFields":["session_id"]},{"eventKey":"facebook","variables":[],"trigger":{"kind":"click","selector":"#contact-facebook, #footer-facebook"},"telemetryFields":["session_id"]},{"eventKey":"instagram","variables":[],"trigger":{"kind":"click","selector":"#contact-instagram, #footer-instagram"},"telemetryFields":["session_id"]},{"eventKey":"kofi","variables":[],"trigger":{"kind":"click","selector":"a.flex.items-center.gap-2, a.inline-flex.items-center.gap-2, a.inline-flex.items-center.justify-center"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_card","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_chatgpt","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_facebook","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_instagram","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_paid","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_telegram","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_tiktok","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"ln_tag_youtube","variables":[{"name":"ln_tag","type":"string"},{"name":"visit_channel","type":"string"},{"name":"visit_intent","type":"string"},{"name":"tag_query_param","type":"string"},{"name":"tag_query_value","type":"string"}],"trigger":{"kind":"manual"},"telemetryFields":["session_id"]},{"eventKey":"message","variables":[],"trigger":{"kind":"click","selector":"#contact-submit"},"telemetryFields":["session_id"]},{"eventKey":"newsletter_click","variables":[],"trigger":{"kind":"click","selector":"#newsletter-subscribe-button"},"telemetryFields":["session_id"]},{"eventKey":"politica_de_confidentialitate_cookies","variables":[],"trigger":{"kind":"click","selector":"a.text-teal.hover\\:underline.ln-embed-highlight, #footer-politica-de-confidentialitate"},"telemetryFields":["session_id"]},{"eventKey":"session","variables":[],"trigger":{"kind":"page_view"},"telemetryFields":["session_id"]},{"eventKey":"telegram","variables":[],"trigger":{"kind":"click","selector":"#contact-telegram, #footer-telegram"},"telemetryFields":["session_id"]},{"eventKey":"tiktok","variables":[],"trigger":{"kind":"click","selector":"#contact-tiktok, #footer-tiktok"},"telemetryFields":["session_id"]}];
var LnUrlTags = [{"tagKey":"card","queryParam":"source","queryValue":"card","channelType":"referral","intent":"conversion"},{"tagKey":"chatgpt","queryParam":"utm_source","queryValue":"chatgpt.com","channelType":"organic","intent":"conversion"},{"tagKey":"facebook","queryParam":"source","queryValue":"facebook","channelType":"social","intent":"conversion"},{"tagKey":"instagram","queryParam":"source","queryValue":"instagram","channelType":"social","intent":"conversion"},{"tagKey":"paid","queryParam":"source","queryValue":"paid","channelType":"paid","intent":"conversion"},{"tagKey":"telegram","queryParam":"source","queryValue":"telegram","channelType":"social","intent":"conversion"},{"tagKey":"tiktok","queryParam":"source","queryValue":"tiktok","channelType":"social","intent":"conversion"},{"tagKey":"youtube","queryParam":"source","queryValue":"youtube","channelType":"social","intent":"conversion"}];
var LnArticleDefs = [{"eventKey":"article_visits","path":"/postare/*","all":true}];
var LnApiBaseDefault = "https://dashboard-ln.netlify.app";

function lnResolveEnv(name) {
  try {
    if (typeof window !== 'undefined' && window.__LN_TRACKING__ && window.__LN_TRACKING__[name] != null) {
      return String(window.__LN_TRACKING__[name]);
    }
  } catch (e) {}
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name] != null) {
      return String(import.meta.env[name]);
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name] != null) {
      return String(process.env[name]);
    }
  } catch (e) {}
  return '';
}

function lnResolveIngestKey() {
  return lnResolveEnv('LN_INGEST_KEY') || lnResolveEnv('NEXT_PUBLIC_LN_INGEST_KEY') || lnResolveEnv('ingestKey') || '';
}
function lnResolveDataKey() {
  return lnResolveEnv('LN_DATA_KEY') || lnResolveEnv('NEXT_PUBLIC_LN_DATA_KEY') || lnResolveEnv('dataKey') || '';
}
function lnResolveApiBase() {
  var fromEnv = lnResolveEnv('LN_API_BASE') || lnResolveEnv('NEXT_PUBLIC_LN_API_BASE') || lnResolveEnv('apiBase');
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (LnApiBaseDefault) return LnApiBaseDefault;
  try { return window.location.origin; } catch (e) { return ''; }
}

function lnUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Consent gate:
 * - Essential (always, minimal page+country): session, visits (page_view), URL tags, article open
 * - Optional: time/scroll engagement, clicks, section/element interactions, rich props
 * - When optional is off: non-essential events do not fire (no buffer)
 */
var LnConsent = { optional: false, decided: false };
var __lnEphemeralVisitorId = null;
var __lnArticleOpenMem = {};
var LnEssentialPageViewKeys = ["session"];
var LnEssentialTagKeys = ["ln_tag_card","ln_tag_chatgpt","ln_tag_facebook","ln_tag_instagram","ln_tag_paid","ln_tag_telegram","ln_tag_tiktok","ln_tag_youtube"];

function lnSyncConsentFromWindow() {
  try {
    var t = window.__LN_TRACKING__;
    if (!t) return;
    if (typeof t.consentOptional === 'boolean') LnConsent.optional = !!t.consentOptional;
    if (typeof t.consentDecided === 'boolean') LnConsent.decided = !!t.consentDecided;
  } catch (e) {}
}

function lnCanSendOptional() {
  lnSyncConsentFromWindow();
  return !!LnConsent.optional;
}

/** @deprecated use lnCanSendOptional — kept for call sites that mean behavioral analytics */
function lnCanSendAnalytics() {
  return lnCanSendOptional();
}

function lnShouldBufferOptional() {
  // Optional events are not buffered — they only fire after explicit opt-in.
  return false;
}

function lnReadEssentialCountry() {
  try {
    var m = document.cookie.match(/(?:^|;\s*)ln_essential_country=([^;]+)/);
    if (m) {
      var c = decodeURIComponent(m[1]).toUpperCase();
      if (/^[A-Z]{2}$/.test(c)) return c;
    }
  } catch (e) {}
  return null;
}

function lnSetEssentialCountryCookie(code) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return;
  try {
    document.cookie = 'ln_essential_country=' + encodeURIComponent(code) + ';path=/;max-age=' + (60 * 60 * 24 * 365) + ';SameSite=Lax';
  } catch (e) {}
}

function lnIsEssentialEvent(eventKey, options) {
  var opts = options && typeof options === 'object' ? options : {};
  if (opts.essential === true) return true;
  var milestone = (opts.engagement && opts.engagement.milestone) || opts._propsMilestone;
  // Article open is essential; time/scroll heartbeats are optional.
  if (milestone === 'open') return true;
  if (LnEssentialPageViewKeys && LnEssentialPageViewKeys.indexOf(eventKey) !== -1) return true;
  if (LnEssentialTagKeys && LnEssentialTagKeys.indexOf(eventKey) !== -1) return true;
  if (typeof eventKey === 'string' && eventKey.indexOf('ln_tag_') === 0) return true;
  return false;
}

var LN_OUTBOX_KEY = 'ln_analytics_outbox_v1';
var LnOutbox = {
  memory: [],
  MAX: 120,
  push: function (item) {
    if (!item) return;
    this.memory.push(item);
    while (this.memory.length > this.MAX) this.memory.shift();
    if (lnCanSendOptional()) this.persistDurable();
  },
  persistDurable: function () {
    try {
      sessionStorage.setItem(LN_OUTBOX_KEY, JSON.stringify(this.memory.slice(-this.MAX)));
    } catch (e) {}
  },
  loadDurable: function () {
    try {
      var raw = sessionStorage.getItem(LN_OUTBOX_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        this.memory = parsed.concat(this.memory).slice(-this.MAX);
      }
    } catch (e) {}
  },
  clear: function () {
    this.memory = [];
    try { sessionStorage.removeItem(LN_OUTBOX_KEY); } catch (e) {}
  },
  flush: function () {
    var self = this;
    if (!lnCanSendOptional()) return Promise.resolve({ flushed: 0 });
    self.loadDurable();
    var items = self.memory.slice();
    self.memory = [];
    try { sessionStorage.removeItem(LN_OUTBOX_KEY); } catch (e) {}
    var chain = Promise.resolve();
    var flushed = 0;
    items.forEach(function (item) {
      chain = chain.then(function () {
        return self._sendItem(item).then(function (ok) {
          if (ok) flushed += 1;
          else self.push(item);
        });
      });
    });
    return chain.then(function () { return { flushed: flushed }; });
  },
  _sendItem: function (item) {
    var ingestKey = lnResolveIngestKey();
    var apiBase = lnResolveApiBase();
    if (!ingestKey || !apiBase || !item || !item.url || !item.body) return Promise.resolve(false);
    return fetch(apiBase + item.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + ingestKey
      },
      body: JSON.stringify(item.body),
      keepalive: !!item.keepalive
    }).then(function (res) { return !!res.ok; }).catch(function () { return false; });
  }
};

function lnClearOptionalBuffers() {
  LnOutbox.clear();
  __lnEphemeralVisitorId = null;
  try { localStorage.removeItem('ln_visitor_id'); } catch (e) {}
  try { sessionStorage.removeItem('ln_geo_v1'); } catch (e) {}
}

function lnOnConsentGranted() {
  LnConsent.optional = true;
  LnConsent.decided = true;
  try {
    if (__lnEphemeralVisitorId) {
      localStorage.setItem('ln_visitor_id', __lnEphemeralVisitorId);
    }
  } catch (e) {}
  try {
    if (LnLocalSession._session) {
      sessionStorage.setItem('ln_session', JSON.stringify(LnLocalSession._session));
    }
  } catch (e) {}
  LnOutbox.persistDurable();
  return LnOutbox.flush();
}

function lnOnConsentRefused() {
  LnConsent.optional = false;
  LnConsent.decided = true;
  // Keep essential session + article-open; drop optional behavioral queue only.
  lnClearOptionalBuffers();
  try { LnArticleTracker.stop(false); } catch (e) {}
  try { lnSyncArticleFromLocation(); } catch (e) {}
  // Presence heartbeats are essential — leave the timer running.
}

function getOrCreateVisitorId() {
  // Essential path: reuse essential session cookie when optional visitor id is off.
  if (!lnCanSendOptional()) {
    try {
      var m = document.cookie.match(/(?:^|;\s*)ln_essential_session=([^;]+)/);
      if (m && decodeURIComponent(m[1]).length >= 8) return decodeURIComponent(m[1]);
    } catch (e) {}
    if (!__lnEphemeralVisitorId) __lnEphemeralVisitorId = lnUuid();
    return __lnEphemeralVisitorId;
  }
  try {
    var key = 'ln_visitor_id';
    var existing = localStorage.getItem(key);
    if (existing && existing.length >= 8) return existing;
    var id = __lnEphemeralVisitorId || lnUuid();
    __lnEphemeralVisitorId = id;
    localStorage.setItem(key, id);
    return id;
  } catch (e) {
    if (!__lnEphemeralVisitorId) __lnEphemeralVisitorId = lnUuid();
    return __lnEphemeralVisitorId;
  }
}

export var LnLocalSession = {
  _session: null,
  _clickCount: 0,
  _startQueued: false,
  getOrCreate: function () {
    if (this._session) return this._session;
    try {
      var raw = sessionStorage.getItem('ln_session');
      if (raw) {
        this._session = JSON.parse(raw);
        return this._session;
      }
    } catch (e) {}
    this._session = { sessionId: lnUuid(), sessionStartedAt: new Date().toISOString(), clickCount: 0 };
    try { sessionStorage.setItem('ln_session', JSON.stringify(this._session)); } catch (e) {}
    this._postSession('start');
    return this._session;
  },
  bumpClick: function () {
    var s = this.getOrCreate();
    s.clickCount = (s.clickCount || 0) + 1;
    this._clickCount = s.clickCount;
    try { sessionStorage.setItem('ln_session', JSON.stringify(s)); } catch (e) {}
  },
  durationMsSoFar: function () {
    var s = this.getOrCreate();
    var start = Date.parse(s.sessionStartedAt || '');
    if (!Number.isFinite(start)) return 0;
    return Math.max(0, Date.now() - start);
  },
  end: function () {
    if (!this._session) return;
    var s = this.getOrCreate();
    this._postSession('end');
    try { sessionStorage.removeItem('ln_session'); } catch (e) {}
    this._session = null;
    this._startQueued = false;
  },
  _postSession: function (kind) {
    var s = this._session;
    if (!s) return;
    var ingestKey = lnResolveIngestKey();
    var apiBase = lnResolveApiBase();
    if (!ingestKey || !apiBase) return;
    var endedAt = new Date().toISOString();
    var startMs = Date.parse(s.sessionStartedAt || '');
    var durationMs = Number.isFinite(startMs) ? Math.max(0, Date.parse(endedAt) - startMs) : 0;
    var path = '/';
    try { path = window.location.pathname || '/'; } catch (e) {}
    var country = lnReadEssentialCountry();
    var full = lnCanSendOptional();
    var body;
    if (kind === 'start') {
      body = {
        kind: 'start',
        sessionId: s.sessionId,
        sessionStartedAt: s.sessionStartedAt,
        currentPath: path,
        country: country,
        consentScope: full ? 'full' : 'essential'
      };
    } else if (kind === 'heartbeat') {
      body = {
        kind: 'heartbeat',
        sessionId: s.sessionId,
        sessionStartedAt: s.sessionStartedAt,
        currentPath: path,
        country: country,
        consentScope: full ? 'full' : 'essential'
      };
      if (full) body.clickCount = s.clickCount || 0;
    } else {
      body = {
        kind: 'end',
        sessionId: s.sessionId,
        sessionStartedAt: s.sessionStartedAt,
        sessionEndedAt: endedAt,
        currentPath: path,
        country: country,
        consentScope: full ? 'full' : 'essential'
      };
      if (full) {
        body.durationMs = durationMs;
        body.clickCount = s.clickCount || 0;
      }
    }
    // Session lifecycle is essential — always send (never gated on optional).
    try {
      fetch(apiBase + '/api/ingest/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ingestKey },
        body: JSON.stringify(body),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  },
  heartbeat: function () {
    if (!this._session) this.getOrCreate();
    this._postSession('heartbeat');
  }
};

export function lnPageContext() {
  var path = '/';
  var href = '';
  var language = '';
  var timezone = '';
  var screenW = 0;
  var screenH = 0;
  try {
    path = window.location.pathname || '/';
    href = window.location.href || '';
    language = (navigator.language || navigator.userLanguage || '').toString();
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e2) {}
    screenW = (window.screen && window.screen.width) || window.innerWidth || 0;
    screenH = (window.screen && window.screen.height) || window.innerHeight || 0;
  } catch (e) {}
  return {
    page_path: path,
    location_href: href,
    language: language,
    timezone: timezone,
    screen_w: screenW,
    screen_h: screenH,
    referrer: (typeof document !== 'undefined' && document.referrer) ? document.referrer : ''
  };
}

function lnIsEmbedPreview() {
  try {
    if (window.__LN_EMBED_PICKER__) return true;
    var params = new URLSearchParams(window.location.search || '');
    if (params.get('ln_embed_picker') === '1') return true;
    if (window.self !== window.top && params.get('ln_dashboard')) return true;
  } catch (e) {
    try { if (window.self !== window.top) return true; } catch (e2) {}
  }
  return false;
}

var __lnGeoPromise = null;
function lnResolveGeo() {
  // Country is essential (content locale / visit stats). Never use browser language
  // region (en-US → US). Prefer essential cookie, then IP lookup.
  if (__lnGeoPromise) return __lnGeoPromise;
  __lnGeoPromise = Promise.resolve().then(function () {
    var geo = { country: null, region: null, city: null };
    var cookieCountry = lnReadEssentialCountry();
    if (cookieCountry && cookieCountry !== 'US' && cookieCountry !== 'GB') {
      geo.country = cookieCountry;
    }
    try {
      var cached = sessionStorage.getItem('ln_geo_v1');
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.country && parsed.country !== 'US' && parsed.country !== 'GB') {
          if (!geo.country) geo.country = parsed.country;
          if (lnCanSendOptional()) {
            if (parsed.region) geo.region = parsed.region;
            if (parsed.city) geo.city = parsed.city;
          }
          if (geo.country) return geo;
        }
      }
    } catch (e) {}
    return fetch('https://ipwho.is/', { method: 'GET' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success !== false) {
          var code = data.country_code ? String(data.country_code).toUpperCase() : null;
          if (code && /^[A-Z]{2}$/.test(code)) {
            geo.country = code;
            lnSetEssentialCountryCookie(code);
          }
          if (lnCanSendOptional()) {
            if (data.region) geo.region = data.region;
            if (data.city) geo.city = data.city;
          }
        }
        if (!geo.country) geo.country = cookieCountry || 'RO';
        try { sessionStorage.setItem('ln_geo_v1', JSON.stringify(geo)); } catch (e) {}
        return geo;
      })
      .catch(function () {
        if (!geo.country) geo.country = cookieCountry || 'RO';
        try { sessionStorage.setItem('ln_geo_v1', JSON.stringify(geo)); } catch (e) {}
        return geo;
      });
  });
  return __lnGeoPromise;
}

function lnBuildSelector(el) {
  if (!el || !el.tagName) return '';
  if (el.id) return '#' + CSS.escape(el.id);
  var parts = [];
  var node = el;
  var depth = 0;
  while (node && node.nodeType === 1 && depth < 5) {
    var part = node.tagName.toLowerCase();
    if (node.id) {
      parts.unshift('#' + CSS.escape(node.id));
      break;
    }
    if (node.classList && node.classList.length) {
      var cls = Array.prototype.slice.call(node.classList, 0, 2).map(function (c) {
        return '.' + CSS.escape(c);
      }).join('');
      part += cls;
    }
    parts.unshift(part);
    node = node.parentElement;
    depth++;
  }
  return parts.join(' > ');
}

export function lnClickTelemetry(ev, el) {
  var doc = document.documentElement;
  var body = document.body;
  var vw = window.innerWidth || 0;
  var vh = window.innerHeight || 0;
  var docW = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0, doc.clientWidth);
  var docH = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0, doc.clientHeight);
  return Object.assign({}, lnPageContext(), {
    click_x: ev.clientX,
    click_y: ev.clientY,
    click_page_x: ev.pageX,
    click_page_y: ev.pageY,
    viewport_w: vw,
    viewport_h: vh,
    doc_w: docW,
    doc_h: docH,
    selector: lnBuildSelector(el)
  });
}

function lnMergeTelemetry(eventKey, payload) {
  var def = null;
  for (var i = 0; i < LnEvents.length; i++) {
    if (LnEvents[i].eventKey === eventKey) { def = LnEvents[i]; break; }
  }
  var fields = (def && def.telemetryFields) || ['session_id'];
  var s = LnLocalSession.getOrCreate();
  var out = Object.assign({}, payload);
  for (var j = 0; j < fields.length; j++) {
    var f = fields[j];
    if (f === 'session_id' && out.session_id == null && out.sessionId == null) out.session_id = s.sessionId;
    if (f === 'session_start' && out.session_start == null) out.session_start = s.sessionStartedAt;
    if (f === 'session_end' && out.session_end == null) out.session_end = new Date().toISOString();
    if (f === 'session_duration_ms' && out.session_duration_ms == null) out.session_duration_ms = LnLocalSession.durationMsSoFar();
    if (f === 'click_count' && out.click_count == null) out.click_count = s.clickCount || 0;
  }
  return out;
}

export async function postLnEvent(event, properties, options) {
  if (lnIsEmbedPreview()) return { ok: true, skipped: 'embed' };
  lnSyncConsentFromWindow();

  var opts = options && typeof options === 'object' ? options : {};
  var payload = properties != null && typeof properties === 'object' ? Object.assign({}, properties) : {};
  var engagement = opts.engagement && typeof opts.engagement === 'object' ? opts.engagement : null;
  var essential = lnIsEssentialEvent(event, {
    engagement: engagement,
    essential: opts.essential,
    _propsMilestone: payload.milestone
  });

  // Non-essential events only fire with optional cookies on (no pre-consent buffer).
  if (!essential && !LnConsent.optional) {
    return { ok: true, skipped: 'no-consent' };
  }

  var ingestKey = lnResolveIngestKey();
  var apiBase = lnResolveApiBase();
  if (!ingestKey) throw new Error('Missing LN_INGEST_KEY');
  if (!apiBase) throw new Error('Missing LN_API_BASE');

  var pageCtx = lnPageContext();
  var geo = await lnResolveGeo();
  var country = geo.country || lnReadEssentialCountry() || null;
  var essentialOnly = essential && !lnCanSendOptional();

  // Essential-only: page + country (+ article identity). No UA/device/time/dimensions.
  if (essentialOnly) {
    var pagePath = typeof payload.page_path === 'string' && payload.page_path
      ? payload.page_path
      : (pageCtx.page_path || '/');
    var isArticleOpen = payload.milestone === 'open' || (engagement && engagement.milestone === 'open');
    var minimal = {
      page_path: pagePath,
      country: country
    };
    if (isArticleOpen) {
      var articlePath = typeof payload.article_path === 'string' && payload.article_path
        ? payload.article_path
        : pagePath;
      if (articlePath) minimal.article_path = articlePath;
      if (typeof payload.slug === 'string' && payload.slug) minimal.slug = payload.slug;
      minimal.milestone = 'open';
    }
    if (typeof payload.ln_tag === 'string' && payload.ln_tag) minimal.ln_tag = payload.ln_tag;
    var wireMinimal = await lnEncryptPropertiesMandatory(minimal);
    var sEssential = LnLocalSession.getOrCreate();
    var essentialBody = {
      event: event,
      properties: wireMinimal,
      sessionId: sEssential.sessionId,
      visitorId: getOrCreateVisitorId(),
      country: country,
      consentScope: 'essential'
    };
    if (isArticleOpen) {
      essentialBody.engagement = {
        articleSlug: minimal.slug || null,
        articlePath: minimal.article_path || null,
        milestone: 'open',
        isFinal: false
      };
    }
    try {
      var essentialRes = await fetch(apiBase + '/api/ingest/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + ingestKey
        },
        body: JSON.stringify(essentialBody),
        keepalive: !!opts.keepalive
      });
      if (!essentialRes.ok) {
        var essentialMsg = essentialRes.statusText;
        try {
          var essentialErr = await essentialRes.json();
          if (essentialErr && essentialErr.message) essentialMsg = essentialErr.message;
        } catch (e) {}
        throw new Error(essentialMsg);
      }
      return { ok: true, consentScope: 'essential' };
    } catch (err) {
      throw err;
    }
  }

  if (payload.page_path == null) payload.page_path = pageCtx.page_path;
  if (payload.location_href == null) payload.location_href = pageCtx.location_href;
  if (payload.language == null) payload.language = pageCtx.language;
  if (payload.timezone == null) payload.timezone = pageCtx.timezone;
  if (payload.screen_w == null) payload.screen_w = pageCtx.screen_w;
  if (payload.screen_h == null) payload.screen_h = pageCtx.screen_h;
  if (payload.referrer == null) payload.referrer = pageCtx.referrer;
  payload = lnMergeTelemetry(event, payload);
  if (payload.country == null && country) payload.country = country;
  if (payload.region == null && geo.region) payload.region = geo.region;
  if (payload.city == null && geo.city) payload.city = geo.city;

  var wirePayload = await lnEncryptPropertiesMandatory(payload);
  var s = LnLocalSession.getOrCreate();
  var requestBody = {
    event: event,
    properties: wirePayload,
    sessionId: s.sessionId,
    visitorId: getOrCreateVisitorId(),
    language: pageCtx.language || null,
    timezone: pageCtx.timezone || null,
    screenW: pageCtx.screen_w,
    screenH: pageCtx.screen_h,
    country: country,
    region: geo.region || null,
    city: geo.city || null,
    consentScope: 'full',
    engagement: engagement
  };
  var queueItem = { url: '/api/ingest/events', body: requestBody, keepalive: !!opts.keepalive };

  try {
    var response = await fetch(apiBase + '/api/ingest/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + ingestKey
      },
      body: JSON.stringify(requestBody),
      keepalive: !!opts.keepalive
    });
    if (!response.ok) {
      LnOutbox.push(queueItem);
      var msg = response.statusText;
      try {
        var body = await response.json();
        if (body && body.message) msg = body.message;
      } catch (e) {}
      throw new Error(msg);
    }
    return { ok: true };
  } catch (err) {
    LnOutbox.push(queueItem);
    throw err;
  }
}

export function trackArticleVisits(properties) { return postLnEvent("article_visits", properties); }
export function trackContact(properties) { return postLnEvent("contact", properties); }
export function trackDespreNoi(properties) { return postLnEvent("despre_noi", properties); }
export function trackEmail(properties) { return postLnEvent("email", properties); }
export function trackFacebook(properties) { return postLnEvent("facebook", properties); }
export function trackInstagram(properties) { return postLnEvent("instagram", properties); }
export function trackKofi(properties) { return postLnEvent("kofi", properties); }
export function trackLnTagCard(properties) { return postLnEvent("ln_tag_card", properties); }
export function trackLnTagChatgpt(properties) { return postLnEvent("ln_tag_chatgpt", properties); }
export function trackLnTagFacebook(properties) { return postLnEvent("ln_tag_facebook", properties); }
export function trackLnTagInstagram(properties) { return postLnEvent("ln_tag_instagram", properties); }
export function trackLnTagPaid(properties) { return postLnEvent("ln_tag_paid", properties); }
export function trackLnTagTelegram(properties) { return postLnEvent("ln_tag_telegram", properties); }
export function trackLnTagTiktok(properties) { return postLnEvent("ln_tag_tiktok", properties); }
export function trackLnTagYoutube(properties) { return postLnEvent("ln_tag_youtube", properties); }
export function trackMessage(properties) { return postLnEvent("message", properties); }
export function trackNewsletterClick(properties) { return postLnEvent("newsletter_click", properties); }
export function trackPoliticaDeConfidentialitateCookies(properties) { return postLnEvent("politica_de_confidentialitate_cookies", properties); }
export function trackSession(properties) { return postLnEvent("session", properties); }
export function trackTelegram(properties) { return postLnEvent("telegram", properties); }
export function trackTiktok(properties) { return postLnEvent("tiktok", properties); }

function lnCaptureUrlTags() {
  if (!LnUrlTags || !LnUrlTags.length) return;
  var params = new URLSearchParams(location.search);
  for (var i = 0; i < LnUrlTags.length; i++) {
    var t = LnUrlTags[i];
    var val = params.get(t.queryParam);
    if (val == null) continue;
    if (String(val) !== String(t.queryValue) && String(val) !== String(t.tagKey)) continue;
    // Essential path strips to page+country; keep ln_tag when optional is on.
    var payload = lnCanSendOptional()
      ? Object.assign({}, lnPageContext(), {
          ln_tag: t.tagKey,
          visit_channel: t.channelType,
          visit_intent: t.intent,
          tag_query_param: t.queryParam,
          tag_query_value: String(val)
        })
      : { ln_tag: t.tagKey };
    void postLnEvent('ln_tag_' + t.tagKey, payload, { essential: true });
    break;
  }
}

var __lnPageLoadId = 0;
function lnRunPageViewTracking() {
  lnCaptureUrlTags();
  var loadId = ++__lnPageLoadId;
  var keys = ["session"];
  for (var i = 0; i < keys.length; i++) {
    (function (eventKey, id) {
      void postLnEvent(eventKey, lnCanSendOptional() ? { load_id: id } : {}, { essential: true });
    })(keys[i], loadId);
  }
}

function lnWireClicks() {
  var clickDefs = [{"eventKey":"politica_de_confidentialitate_cookies","selector":"a.text-teal.hover\\:underline.ln-embed-highlight, #footer-politica-de-confidentialitate","score":196},{"eventKey":"instagram","selector":"#contact-instagram, #footer-instagram","score":137},{"eventKey":"facebook","selector":"#contact-facebook, #footer-facebook","score":135},{"eventKey":"telegram","selector":"#contact-telegram, #footer-telegram","score":135},{"eventKey":"tiktok","selector":"#contact-tiktok, #footer-tiktok","score":131},{"eventKey":"newsletter_click","selector":"#newsletter-subscribe-button","score":128},{"eventKey":"despre_noi","selector":"#nav-despre-noi","score":115},{"eventKey":"message","selector":"#contact-submit","score":115},{"eventKey":"email","selector":"#contact-email","score":114},{"eventKey":"contact","selector":"#nav-contact","score":112},{"eventKey":"kofi","selector":"a.flex.items-center.gap-2, a.inline-flex.items-center.gap-2, a.inline-flex.items-center.justify-center","score":112}];
  var docClickKeys = [];

  document.addEventListener('click', function (ev) {
    var target = ev.target;
    if (!target || !target.closest) return;
    LnLocalSession.bumpClick();

    for (var d = 0; d < docClickKeys.length; d++) {
      void postLnEvent(docClickKeys[d], lnClickTelemetry(ev, target));
    }

    for (var i = 0; i < clickDefs.length; i++) {
      var def = clickDefs[i];
      if (!def.selector) continue;
      try {
        var el = target.closest(def.selector);
        if (el) {
          // If the click is inside a form, only record when the form is valid.
          // This matches common cases like "Aboneaza-te" / "Trimite mesaj"
          // where the click happens but JS/HTML validation may block submit.
          try {
            var form = el.closest('form');
            if (form && typeof form.checkValidity === 'function' && !form.noValidate) {
              if (!form.checkValidity()) return;
            }
          } catch (e2) {}

          void postLnEvent(def.eventKey, lnClickTelemetry(ev, el));
          break;
        }
      } catch (e) {}
    }
  }, true);
}

function lnWireElementOthers() {
  var others = [];

  others.forEach(function (def) {
    if (!def.selector) return;
    if (def.interaction === 'scroll_into_view') {
      try {
        var nodes = document.querySelectorAll(def.selector);
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              void postLnEvent(def.eventKey, Object.assign({}, lnPageContext(), {
                selector: lnBuildSelector(entry.target)
              }));
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.4 });
        nodes.forEach(function (n) { io.observe(n); });
      } catch (e) {}
      return;
    }
    var type = def.interaction === 'hover' ? 'mouseenter' : def.interaction;
    document.addEventListener(type, function (ev) {
      var target = ev.target;
      if (!target || !target.closest) return;
      try {
        var el = target.closest(def.selector);
        if (el) void postLnEvent(def.eventKey, Object.assign({}, lnPageContext(), {
          selector: lnBuildSelector(el)
        }));
      } catch (e) {}
    }, true);
  });
}

function lnWireSectionText() {
  var sections = [];
  var timers = {};

  function collect(section) {
    var data = {};
    var fields = section.querySelectorAll('input, textarea, select');
    fields.forEach(function (f) {
      var name = f.name || f.id || f.getAttribute('aria-label') || 'field';
      data[name] = f.value;
    });
    return data;
  }

  sections.forEach(function (def, idx) {
    if (!def.selector) return;
    if (def.captureOn === 'blur') {
      document.addEventListener('focusout', function (ev) {
        var target = ev.target;
        if (!target || !target.closest) return;
        var section = target.closest(def.selector);
        if (!section) return;
        clearTimeout(timers[idx]);
        timers[idx] = setTimeout(function () {
          void postLnEvent(def.eventKey, Object.assign({}, lnPageContext(), collect(section)));
        }, 2000);
      }, true);
    } else {
      // "submit_click" semantics: send only if form submit is valid and not prevented.
      document.addEventListener('submit', function (ev) {
        var form = ev.target;
        if (!form || !form.closest) return;
        try {
          if (ev && ev.defaultPrevented) return;
        } catch (e0) {}
        try {
          if (form.noValidate) {
            // If the page explicitly disables HTML5 validation, keep the event.
          } else if (typeof form.checkValidity === 'function') {
            if (!form.checkValidity()) return;
          }
        } catch (e1) {}

        var section = form.closest(def.selector) || document.querySelector(def.selector);
        if (!section) return;
        clearTimeout(timers[idx]);
        timers[idx] = setTimeout(function () {
          void postLnEvent(def.eventKey, Object.assign({}, lnPageContext(), collect(section)));
        }, 2000);
      }, true);
    }
  });
}

export function initLnAutoTracking() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (lnIsEmbedPreview()) return;
  lnSyncConsentFromWindow();

  if (lnCanSendOptional()) LnOutbox.loadDurable();

  // Essential: session, visits, tags, article open, presence — always.
  LnLocalSession.getOrCreate();
  lnRunPageViewTracking();
  lnInitArticleTracking();
  lnWatchSpaNavigations();
  try { LnLocalSession.heartbeat(); } catch (e) {}
  if (!window.__lnPresenceTimer) {
    window.__lnPresenceTimer = setInterval(function () {
      try { LnLocalSession.heartbeat(); } catch (e) {}
    }, 20000);
  }

  // Optional behavioral wiring only after opt-in.
  if (lnCanSendOptional()) {
    lnWireOptionalBehaviors();
  }

  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) {
      lnRunPageViewTracking();
      lnSyncArticleFromLocation();
    }
  });
  window.addEventListener('pagehide', function () {
    try { LnArticleTracker.flush('leave', true); } catch (e) {}
    LnLocalSession.end();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      try { LnArticleTracker.flush('heartbeat', false); } catch (e) {}
    } else if (document.visibilityState === 'visible') {
      try { LnLocalSession.heartbeat(); } catch (e) {}
    }
  });
  window.addEventListener('ln-consent-changed', function (ev) {
    try {
      var detail = (ev && ev.detail) || {};
      if (detail.optional === true) {
        void lnOnConsentGranted().then(function () {
          try { lnWireOptionalBehaviors(); } catch (e) {}
          try { LnLocalSession.heartbeat(); } catch (e) {}
          try { lnSyncArticleFromLocation(); } catch (e) {}
          if (!window.__lnPresenceTimer) {
            window.__lnPresenceTimer = setInterval(function () {
              try { LnLocalSession.heartbeat(); } catch (e) {}
            }, 20000);
          }
        });
      } else if (detail.decided === true && detail.optional === false) {
        lnOnConsentRefused();
      } else {
        lnSyncConsentFromWindow();
        if (LnConsent.optional) {
          void lnOnConsentGranted().then(function () {
            try { lnWireOptionalBehaviors(); } catch (e) {}
          });
        } else if (LnConsent.decided) lnOnConsentRefused();
      }
    } catch (e) {}
  });
}

var __lnOptionalWired = false;
function lnWireOptionalBehaviors() {
  if (__lnOptionalWired) return;
  if (!lnCanSendOptional()) return;
  __lnOptionalWired = true;
  lnWireClicks();
  lnWireElementOthers();
  lnWireSectionText();
}

/**
 * Article engagement: dashboard-defined triggers (kind article + path).
 * path /postare/* = one event for every /postare/slug (URL, time, scroll per article).
 */
var LnArticleTracker = {
  state: null,
  heartbeatTimer: null,
  tickTimer: null,
  normalizePath: function (pathname) {
    var path = String(pathname || '/');
    if (path.length > 1 && path.charAt(path.length - 1) === '/') {
      path = path.slice(0, -1);
    }
    return path || '/';
  },
  isArticlePage: function (pathname) {
    var path = this.normalizePath(pathname);
    if (path.indexOf('/postare/') !== 0) return false;
    var slug = path.slice('/postare/'.length);
    return slug.length > 0 && slug.indexOf('/') === -1;
  },
  findDef: function (pathname) {
    var path = this.normalizePath(pathname);
    var globalDef = null;
    for (var i = 0; i < LnArticleDefs.length; i++) {
      var def = LnArticleDefs[i];
      if (!def) continue;
      if (def.all) {
        globalDef = def;
        continue;
      }
      if (!def.path) continue;
      var defPath = this.normalizePath(def.path);
      if (path === defPath) return def;
    }
    if (globalDef && this.isArticlePage(path)) return globalDef;
    return null;
  },
  slugFromPath: function (pathname) {
    var m = String(pathname || '').match(/^\/postare\/([^\/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  },
  measureScrollPct: function () {
    try {
      var doc = document.documentElement;
      var body = document.body;
      var scrollTop = window.scrollY || doc.scrollTop || 0;
      var docH = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0, doc.clientHeight);
      var viewH = window.innerHeight || doc.clientHeight || 0;
      if (docH <= viewH) return 100;
      var pct = ((scrollTop + viewH) / docH) * 100;
      return Math.max(0, Math.min(100, Math.round(pct)));
    } catch (e) {
      return 0;
    }
  },
  accumulateActive: function () {
    var st = this.state;
    if (!st) return;
    var now = Date.now();
    if (st.visible && st.lastActiveAt) {
      st.activeMs += Math.max(0, now - st.lastActiveAt);
    }
    st.lastActiveAt = now;
  },
  snapshot: function (milestone, isFinal) {
    this.accumulateActive();
    var st = this.state;
    if (!st) return null;
    var totalMs = Math.max(0, Date.now() - st.openedAt);
    var scroll = Math.max(st.maxScrollPct, this.measureScrollPct());
    st.maxScrollPct = scroll;
    return {
      eventKey: st.eventKey,
      props: {
        slug: st.slug,
        article_path: st.path,
        active_ms: Math.round(st.activeMs),
        total_ms: Math.round(totalMs),
        scroll_depth_pct: scroll,
        milestone: milestone,
        is_final: !!isFinal,
        sessionId: LnLocalSession.getOrCreate().sessionId
      },
      engagement: {
        articleSlug: st.slug,
        articlePath: st.path,
        activeMs: Math.round(st.activeMs),
        totalMs: Math.round(totalMs),
        scrollDepthPct: scroll,
        milestone: milestone,
        isFinal: !!isFinal
      }
    };
  },
  flush: function (milestone, isFinal) {
    // Time/scroll engagement is optional-only.
    if (milestone !== 'open' && !lnCanSendOptional()) return;
    var snap = this.snapshot(milestone, isFinal);
    if (!snap) return;
    void postLnEvent(snap.eventKey, snap.props, {
      engagement: snap.engagement,
      keepalive: !!isFinal
    });
  },
  stop: function (sendFinal) {
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; }
    if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
    if (this._onScroll) {
      try { window.removeEventListener('scroll', this._onScroll); } catch (e) {}
      this._onScroll = null;
    }
    if (this._onVisibility) {
      try { document.removeEventListener('visibilitychange', this._onVisibility); } catch (e) {}
      this._onVisibility = null;
    }
    if (sendFinal && this.state) this.flush('leave', true);
    this.state = null;
  },
  start: function (def, path) {
    var self = this;
    if (!def || !def.eventKey) return;
    var slug = this.slugFromPath(path) || def.path.replace(/^\/postare\//, '') || def.eventKey;
    if (this.state && this.state.eventKey === def.eventKey && this.state.path === path) return;
    this.stop(true);
    var sessionId = LnLocalSession.getOrCreate().sessionId;
    this.state = {
      eventKey: def.eventKey,
      slug: slug,
      path: path,
      openedAt: Date.now(),
      activeMs: 0,
      lastActiveAt: Date.now(),
      visible: document.visibilityState !== 'hidden',
      maxScrollPct: this.measureScrollPct(),
      openSent: false
    };
    var openKey = 'ln_article_open_' + sessionId + '_' + def.eventKey + '_' + path;
    var already = false;
    try { already = sessionStorage.getItem(openKey) === '1'; } catch (e) {}
    if (!already) already = !!__lnArticleOpenMem[openKey];
    if (!already) {
      try { sessionStorage.setItem(openKey, '1'); } catch (e) {}
      __lnArticleOpenMem[openKey] = 1;
      void postLnEvent(def.eventKey, {
        slug: slug,
        article_path: path,
        active_ms: 0,
        total_ms: 0,
        scroll_depth_pct: 0,
        milestone: 'open',
        sessionId: sessionId
      }, {
        engagement: {
          articleSlug: slug,
          articlePath: path,
          activeMs: 0,
          totalMs: 0,
          scrollDepthPct: 0,
          milestone: 'open',
          isFinal: false
        }
      });
      this.state.openSent = true;
    }
    // Engagement timers (time + scroll) only with optional cookies.
    if (!lnCanSendOptional()) return;
    this._onScroll = function () {
      if (!self.state) return;
      var pct = self.measureScrollPct();
      if (pct > self.state.maxScrollPct) self.state.maxScrollPct = pct;
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._onVisibility = function () {
      if (!self.state) return;
      self.accumulateActive();
      self.state.visible = document.visibilityState !== 'hidden';
      self.state.lastActiveAt = Date.now();
    };
    document.addEventListener('visibilitychange', this._onVisibility);
    this.tickTimer = setInterval(function () { self.accumulateActive(); }, 1000);
    this.heartbeatTimer = setInterval(function () { self.flush('heartbeat', false); }, 15000);
  }
};

function lnSyncArticleFromLocation() {
  if (!LnArticleDefs || !LnArticleDefs.length) {
    LnArticleTracker.stop(false);
    return;
  }
  var path = '/';
  try { path = window.location.pathname || '/'; } catch (e) {}
  var def = LnArticleTracker.findDef(path);
  if (def) LnArticleTracker.start(def, path);
  else LnArticleTracker.stop(true);
}

function lnInitArticleTracking() {
  lnSyncArticleFromLocation();
}

function lnWatchSpaNavigations() {
  var lastPath = '';
  try { lastPath = window.location.pathname || ''; } catch (e) {}
  var check = function () {
    var next = '';
    try { next = window.location.pathname || ''; } catch (e) {}
    if (next === lastPath) return;
    lastPath = next;
    lnRunPageViewTracking();
    lnSyncArticleFromLocation();
    try { LnLocalSession.heartbeat(); } catch (e) {}
  };
  window.addEventListener('popstate', check);
  try {
    var wrap = function (type) {
      var orig = history[type];
      if (typeof orig !== 'function') return;
      history[type] = function () {
        var ret = orig.apply(this, arguments);
        try { check(); } catch (e) {}
        return ret;
      };
    };
    wrap('pushState');
    wrap('replaceState');
  } catch (e) {}
  setInterval(check, 1200);
}

try { initLnAutoTracking(); } catch (e) {}
