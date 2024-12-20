// node_modules/@9elt/miniframe/dist/esm/index.js
function createNode(D_props) {
  const node = __createNode(D_props);
  (TMP || (TMP = window.document.createElement("div"))).append(node);
  return node;
}
var __createNode = function(D_props) {
  let node;
  const props = D_props instanceof State ? D_props.sub((curr) => {
    check__pref__tref(node);
    if (node instanceof window.Text && (typeof curr === "string" || typeof curr === "number")) {
      return node.textContent = curr;
    }
    const update = __createNode(curr);
    node.replaceWith(update);
    node = update;
  }) && D_props.value : D_props;
  if (typeof props === "string" || typeof props === "number") {
    return node = window.document.createTextNode(props);
  }
  if (!props) {
    return node = window.document.createTextNode("");
  }
  if (props instanceof window.Node) {
    return node = props;
  }
  node = window.document.createElementNS(props.namespaceURI || "http://www.w3.org/1999/xhtml", props.tagName);
  copyObject(node, props);
  return node;
};
var copyObject = function(on, D_from) {
  const from = D_from instanceof State ? D_from.sub((curr, prev) => {
    for (const key in prev) {
      setPrimitive(on, key, null);
    }
    check__pref__tref(on);
    on.__tref = curr;
    copyObject(on, curr);
  }) && (on.__tref = D_from.value) : D_from;
  for (const key in from)
    if (key === "namespaceURI" || key === "tagName") {
      continue;
    } else if (key === "children") {
      setNodeList(on, from[key]);
    } else if (typeof (from[key] instanceof State ? from[key].value : from[key]) === "object" && !on.__pref) {
      on[key].__pref = on;
      copyObject(on[key], from[key]);
    } else {
      setPrimitive(on, key, from);
    }
};
var setNodeList = function(parent, D_children) {
  parent.append(...createNodeList(D_children instanceof State ? D_children.sub((current) => {
    check__pref__tref(parent);
    parent.replaceChildren(...createNodeList(current));
  }) && D_children.value : D_children));
};
var createNodeList = function(props) {
  const list = new Array(props && props.length || 0);
  for (let i = 0;i < list.length; i++) {
    list[i] = __createNode(props[i]);
  }
  return list;
};
var setPrimitive = function(on, key, from) {
  const D_value = from && from[key];
  const value = D_value instanceof State ? D_value.sub((curr) => {
    check__pref__tref(on, from);
    setPrimitive(on, key, { [key]: curr });
  }) && D_value.value : D_value;
  try {
    on instanceof window.Node && on.namespaceURI !== "http://www.w3.org/1999/xhtml" && (typeof value === "string" || typeof value === "number" || typeof value === "undefined") ? !value && value !== 0 ? on.removeAttribute(key === "className" ? "class" : key) : on.setAttribute(key === "className" ? "class" : key, value) : on[key] = value;
  } catch (err) {
    console.warn(`failed ${on}.${key} = ${D_value}`, err);
  }
};
var check__pref__tref = function(on, from) {
  if (("__pref" in on ? !on.__pref.isConnected : !on.isConnected) || typeof from !== "undefined" && "__tref" in on && on.__tref !== from) {
    throw 1;
  }
};
var TMP;

class State {
  constructor(value) {
    this._v = value;
    this._s = [];
  }
  static use(states) {
    const group = new State({});
    for (const key in states) {
      group.value[key] = states[key].value;
      states[key].sub((current) => group.value = Object.assign(group.value, { [key]: current }));
    }
    return group;
  }
  get value() {
    return this._v;
  }
  set value(value) {
    this._d(value, this._v);
    this._v = value;
  }
  set(f) {
    this.value = f(this._v);
  }
  as(f, collector) {
    const child = new State(f(this._v));
    this.sub((curr) => {
      child.value = f(curr);
    }, collector);
    return child;
  }
  sub(f, collector) {
    this._s.push(f);
    collector && collector.push(f);
    return f;
  }
  unsub(f) {
    this._s = this._s.filter((s) => s !== f);
  }
  _d(curr, prev) {
    const s = new Array(this._s.length);
    let length = 0;
    for (let i = 0;i < this._s.length; i++) {
      try {
        this._s[i](curr, prev);
        s[length++] = this._s[i];
      } catch (_a) {
      }
    }
    s.length = length;
    this._s = s;
  }
}

// src/lib/async.state.ts
class AsyncState extends State {
  constructor(value) {
    super(value);
  }
  static useAsync(states) {
    const group = new AsyncState({});
    for (const key in states) {
      group.value[key] = states[key].value;
      states[key].sub((current) => {
        group.value = Object.assign(group.value, {
          [key]: current
        });
      });
    }
    return group;
  }
  asyncAs(fn, loadingStatus) {
    const child = new State(undefined);
    this.sub((value) => {
      if (loadingStatus !== undefined) {
        child.value = loadingStatus;
      }
      fn(value).then((value2) => child.value = value2);
    })(this.value);
    return child;
  }
}

// src/lib/episode.cache.ts
var load = function() {
  try {
    const raw = localStorage.getItem(LSK_EP_CACHE);
    return raw ? deserialize(raw) : [];
  } catch {
    return [];
  }
};
var dump = function() {
  localStorage.setItem(LSK_EP_CACHE, serialize(episodeCache));
};
var serialize = function(value) {
  let result = SER_VERSION;
  for (const [id, ep] of value) {
    result += id + "\n" + ep + "\n\n";
  }
  return result.slice(0, -2);
};
var deserialize = function(value) {
  if (!value.startsWith(SER_VERSION)) {
    return [];
  }
  const values = value.replace(SER_VERSION, "").split("\n\n");
  const result = new Array(values.length);
  for (let i = 0;i < values.length; i++) {
    const [id, ep] = values[i].split("\n");
    result[i] = [id, Number(ep)];
  }
  return result;
};
var LSK_EP_CACHE = "epcache";
var SER_VERSION = "v1.";
var EPISODE_CACHE_MAX_SIZE = 256;
var episodeCache = load();
episodeCache.get = (id) => {
  return episodeCache.find((item) => item[0] === id)?.[1];
};
episodeCache.add = (id, ep) => {
  for (const item of episodeCache) {
    if (item[0] === id) {
      item[1] = ep;
      dump();
      return;
    }
  }
  if (episodeCache.length > EPISODE_CACHE_MAX_SIZE) {
    episodeCache.shift();
  }
  episodeCache.push([id, ep]);
  dump();
};

// src/lib/cache.ts
var CACHE_MAX_SIZE = 64;
var cache = [];
cache.add = (id, data) => {
  cache.push({ id, data });
  if (cache.length > CACHE_MAX_SIZE) {
    cache.shift();
  }
};
cache.get = (id) => {
  for (let i = cache.length - 1;i >= 0; i--) {
    if (cache[i].id === id) {
      return cache[i].data;
    }
  }
  return null;
};
var PREFETCHER_MAX_SIZE = 8;
var prefetcher = [];
prefetcher.add = (id, data) => {
  prefetcher.push({ id, data });
  if (prefetcher.length > PREFETCHER_MAX_SIZE) {
    prefetcher.shift();
  }
};
prefetcher.get = (id) => {
  for (let i = prefetcher.length - 1;i >= 0; i--) {
    if (prefetcher[i].id === id) {
      return prefetcher[i].data;
    }
  }
  return null;
};

// src/lib/gogo.ts
async function getEpisode(name, episode) {
  const cacheId = "GET episode" + name + episode;
  const cached = cache.get(cacheId);
  if (cached) {
    return cached;
  }
  const raw = await fetch(GOGO_URL + "/" + name + "-episode-" + episode.toString().replace(".", "-"));
  if (!raw.ok) {
    throw new Error("failed to fetch details");
  }
  _TMP.innerHTML = sanitize(await raw.text());
  const _links = _TMP.querySelectorAll(".anime_muti_link li");
  const links = new Array(_links.length);
  for (let i = 0;i < _links.length; i++) {
    const _li = _links[i];
    const _a = _li.querySelector("a[data-video]");
    const server = _li.className.replace("server", "").trim();
    const href = _a?.dataset.video;
    if (!href || !server) {
      console.warn("failed to parse link", _li);
      continue;
    }
    links[i] = {
      server,
      href
    };
  }
  const result = {
    number: episode,
    links
  };
  cache.add(cacheId, result);
  return result;
}
function getDetailsCacheId(urlTitle) {
  return "GET details" + urlTitle;
}
async function getDetails(urlTitle) {
  const cacheId = getDetailsCacheId(urlTitle);
  const cached = prefetcher.get(cacheId) || cache.get(cacheId);
  if (cached) {
    return cached;
  }
  const raw = await fetch(GOGO_URL + "/category/" + urlTitle);
  if (!raw.ok) {
    throw new Error("failed to fetch details");
  }
  _TMP.innerHTML = sanitize(await raw.text());
  const title = _TMP.querySelector(".anime_info_body_bg>h1")?.textContent;
  const episodeListId = _TMP.querySelector("input#movie_id")?.getAttribute("value");
  const _pages = _TMP.querySelectorAll("#episode_page a");
  let lastEpisode = 0;
  for (let i = 0;i < _pages.length; i++) {
    const page = _pages[i];
    const end = page.getAttribute("ep_end");
    if (!end) {
      console.warn("failed to parse page", page);
      continue;
    }
    lastEpisode = Math.max(lastEpisode, Number(end));
  }
  const _items = _TMP.querySelectorAll(".anime_info_body_bg>p.type");
  const data = {};
  for (let i = 0;i < _items.length; i++) {
    const _item = _items[i];
    const _span = _item.querySelector("span");
    if (!_span) {
      continue;
    }
    const key = _span.textContent?.trim() || "";
    _span.remove();
    const text = _item.textContent?.trim() || "";
    switch (key) {
      case "Genre:":
        data.genres = text.split(/,|;/).map((genre) => genre.trim());
        break;
      case "Released:":
        data.release = Number(text);
        break;
      case "Other name:":
        data.alias = text.split(/,|;/).map((alias) => alias.trim());
        break;
      case "Status:":
        data.status = text;
        break;
    }
  }
  const description = _TMP.querySelector(".description")?.textContent || "no description provided.";
  const image = _TMP.querySelector(".anime_info_body_bg>img")?.dataset.src;
  if (!title || !episodeListId || !description || !image) {
    console.error("title", title, "episodeListId", episodeListId, "description", description, "image", image);
    throw new Error("failed to parse details");
  }
  _TMP.innerHTML = "";
  const result = {
    title,
    urlTitle,
    episodes: lastEpisode === 0 ? [] : await getEpisodeList(episodeListId, 0, lastEpisode),
    description,
    image,
    ...data
  };
  cache.add(cacheId, result);
  return result;
}
async function getEpisodeList(id, from = 0, to = 99) {
  const raw = await fetch(GOGO_CDN_URL + "/ajax/load-list-episode?ep_start=" + from + "&ep_end=" + to + "&id=" + id + "&default_ep=0");
  if (!raw.ok) {
    throw new Error("failed to fetch episode list");
  }
  _TMP.innerHTML = sanitize(await raw.text());
  const _lis = _TMP.querySelectorAll("#episode_related>li");
  const result = new Array(_lis.length);
  for (let i = 0;i < _lis.length; i++) {
    const _li = _lis[i];
    const episode = _li.querySelector(".name")?.textContent?.replace("EP ", "");
    if (!episode) {
      console.warn("failed to parse item", _li);
      continue;
    }
    result[i] = Number(episode);
  }
  _TMP.innerHTML = "";
  return result;
}
async function getSearch(search) {
  const cacheId = "GET search" + search;
  const cached = cache.get(cacheId);
  if (cached) {
    return cached;
  }
  const raw = await fetch(GOGO_CDN_URL + "/site/loadAjaxSearch?keyword=" + encodeURI(search) + "&id=-1");
  if (!raw.ok) {
    throw new Error("failed to fetch search result");
  }
  _TMP.innerHTML = sanitize((await raw.json()).content);
  const _divs = _TMP.querySelectorAll("#header_search_autocomplete_body>div");
  const result = new Array(_divs.length);
  for (let i = 0;i < _divs.length; i++) {
    const _div = _divs[i];
    const title = _div?.textContent;
    const urlTitle = _div.querySelector("a")?.href.replace(window.location.origin + window.location.pathname, "").replace("category/", "");
    const image = _div.querySelector(".thumbnail-recent_search")?.style.background.replace('url("', "").replace('")', "");
    if (!title || !urlTitle || !image) {
      console.warn("failed to parse item", _div);
      continue;
    }
    result[i] = {
      title,
      urlTitle,
      image
    };
  }
  _TMP.innerHTML = "";
  cache.add(cacheId, result);
  return result;
}
async function getReleases(page) {
  const cacheId = "GET releases" + page;
  const cached = cache.get(cacheId);
  if (cached) {
    return cached;
  }
  const raw = await fetch(GOGO_CDN_URL + "/ajax/page-recent-release.html?page=" + page + "&type=1");
  if (!raw.ok) {
    throw new Error("failed to fetch recent releases");
  }
  _TMP.innerHTML = sanitize(await raw.text());
  const _lis = _TMP.querySelectorAll(".items>li");
  const result = new Array(_lis.length);
  for (let i = 0;i < _lis.length; i++) {
    const _li = _lis[i];
    const title = _li.querySelector(".name")?.textContent;
    const urlTitle = _li.querySelector("a")?.href.replace(window.location.origin, "").replace(/-episode-\d+/, "").replace("/", "");
    const image = _li.querySelector("img")?.dataset.src;
    const episode = _li.querySelector(".episode")?.textContent?.replace("Episode ", "");
    if (!title || !urlTitle || !image || !episode) {
      console.warn("failed to parse item", _li);
      continue;
    }
    result[i] = {
      title,
      urlTitle,
      image,
      episode: Number(episode)
    };
  }
  _TMP.innerHTML = "";
  cache.add(cacheId, result);
  return result;
}
var sanitize = function(html) {
  return html.replace(/<script.*?>.*?<\/script>/g, "").replace(/<link.*?>/g, "").replace(/<style.*?>.*?<\/style>/g, "").replace(/<head>.*?<\/head>/g, "").replaceAll("src=", "data-src=");
};
var _TMP = document.createElement("div");
var GOGO_URL = "https://anitaku.bz";
var GOGO_CDN_URL = "https://ajax.gogocdn.net";

// src/lib/statusful.ts
function loadStatusful() {
  try {
    const raw = localStorage.getItem(LSK_STATUSFUL);
    return raw ? deserialize2(raw) : [];
  } catch {
    return [];
  }
}
function dumpStatusful(value) {
  localStorage.setItem(LSK_STATUSFUL, serialize2(value));
}
var serialize2 = function(values) {
  let result = SER_VERSION2;
  for (const value of values) {
    result += value.title + "\n" + value.urlTitle + "\n" + value.image + "\n" + value.status + "\n\n";
  }
  return result.slice(0, -2);
};
var deserialize2 = function(value) {
  if (!value.startsWith(SER_VERSION2)) {
    return [];
  }
  const values = value.replace(SER_VERSION2, "").split("\n\n");
  const result = new Array(values.length);
  for (let i = 0;i < values.length; i++) {
    let [title, urlTitle, image, status] = values[i].split("\n");
    if (!title || !urlTitle || !image || !status) {
      console.warn("failed to parse statusful item", values[i]);
      continue;
    }
    result[i] = {
      title,
      urlTitle,
      image,
      status: Number(status)
    };
  }
  return result;
};
var LSK_STATUSFUL = "statusful";
var SER_VERSION2 = "v1.";
var STATUSFUL_MAX_SIZE = 64;
var Status;
(function(Status2) {
  Status2[Status2["Watching"] = 0] = "Watching";
})(Status || (Status = {}));

// src/lib/url.state.ts
class UrlState extends AsyncState {
  constructor(key, as) {
    const query = new URLSearchParams(window.location.search).get(key);
    super(query !== null ? as(query) : null);
    this.sub((value, prevValue) => {
      if (value !== prevValue) {
        const url = window.location.origin + window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        value === null ? params.delete(key) : params.set(key, value.toString());
        const search = params.toString();
        window.history.pushState({}, "", search ? url + "?" + search : url);
      }
    });
    window.addEventListener("popstate", () => {
      const query2 = new URLSearchParams(window.location.search).get(key);
      this.value = query2 !== null ? as(query2) : null;
    });
  }
}

// src/global.ts
var QK_RELEASES_PAGE = "releases";
var QK_WATCHING_PAGE = "watching";
var QK_SEARCH = "search";
var QK_TITLE = "title";
var releasesPage = new UrlState(QK_RELEASES_PAGE, Number);
releasesPage.value ||= 1;
var releases = releasesPage.asyncAs(async (page) => page === null ? [] : await getReleases(page));
var search = new UrlState(QK_SEARCH, String);
var results = search.asyncAs(async (search2) => search2?.trim() ? await getSearch(search2) : null);
var urlTitle = new UrlState(QK_TITLE, String);
var Route;
(function(Route2) {
  Route2[Route2["Home"] = 0] = "Home";
  Route2[Route2["Episode"] = 1] = "Episode";
})(Route || (Route = {}));
var route = urlTitle.as((title) => title === null ? Route.Home : Route.Episode);
var headTitle = document.querySelector("head>title");
var originalTitle = headTitle.textContent;
var details = urlTitle.asyncAs(async (urlTitle2) => {
  const details2 = urlTitle2 === null ? null : await getDetails(urlTitle2);
  headTitle.textContent = details2?.title || originalTitle;
  if (details2 && details2.episodes.length === 0) {
    episodeNumber.value = -1;
  }
  if (details2 && details2.episodes.length > 0 && episodeNumber.value === null) {
    episodeNumber.value = episodeCache.get(urlTitle2) || details2.episodes[details2.episodes.length - 1] || -1;
  }
  return details2;
}, null);
var episodeNumber = new AsyncState(null);
episodeNumber.sub((value) => {
  if (value !== null && value !== -1 && urlTitle.value !== null && (episodeCache.get(urlTitle.value) !== null || value !== 1)) {
    episodeCache.add(urlTitle.value, value);
  }
});
var episode2 = AsyncState.useAsync({ episodeNumber, urlTitle }).asyncAs(async (g) => g.urlTitle && g.episodeNumber !== null && g.episodeNumber !== -1 ? await getEpisode(g.urlTitle, g.episodeNumber) : g.episodeNumber === -1 ? -1 : null);
var statusful2 = new State(loadStatusful());
statusful2.sub(dumpStatusful);
statusful2.add = (value, status) => {
  for (const item of statusful2.value) {
    if (item.urlTitle === value.urlTitle) {
      item.status = status;
      statusful2.value = statusful2.value;
      return;
    }
  }
  statusful2.value.push({ ...value, status });
  if (statusful2.value.length > STATUSFUL_MAX_SIZE) {
    statusful2.value.shift();
  }
  statusful2.value = statusful2.value;
};
statusful2.remove = (value) => {
  statusful2.value = statusful2.value.filter((v) => v.urlTitle !== value.urlTitle);
};
var WATCHING_PAGE_SIZE = 8;
var watchingPage = new UrlState(QK_WATCHING_PAGE, Number);
watchingPage.value ||= 1;
statusful2.sub((_statusful) => {
  const maxPage = Math.ceil(_statusful.length / WATCHING_PAGE_SIZE);
  watchingPage.value = Math.min(watchingPage.value || 0, maxPage);
});
var watching = State.use({
  watchingPage,
  statusful: statusful2
}).as((g) => {
  const maxPage = Math.ceil(g.statusful.length / WATCHING_PAGE_SIZE);
  g.watchingPage ||= 1;
  if (g.watchingPage > maxPage) {
    g.watchingPage = maxPage;
  }
  const data = g.statusful.slice().reverse().slice((g.watchingPage - 1) * WATCHING_PAGE_SIZE, g.watchingPage * WATCHING_PAGE_SIZE);
  return {
    maxPage,
    data
  };
});

// src/lib/state.ref.ts
class StateRef {
  ref;
  refs;
  constructor(ref) {
    this.ref = ref;
    this.refs = [];
  }
  clear() {
    this.refs.forEach((ref) => this.ref.unsub(ref));
    this.refs = [];
  }
  sub(f) {
    this.refs.push(this.ref.sub(f));
    return f;
  }
  as(f) {
    const child = new State(f(this.ref.value));
    this.refs.push(this.ref.sub((value) => {
      child.value = f(value);
    }));
    return child;
  }
}

// src/util.ts
function randomDelay() {
  return (Math.random() * 300).toFixed(0) + "ms";
}
function debounce(f, ms) {
  let timeout = null;
  return function(...args) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      f(...args);
      timeout = null;
    }, ms);
  };
}
var isMobile = matchMedia("(max-width: 768px)").matches;

// src/components/search.result.tsx
function SearchResult({
  result,
  statusful: statusful4
}) {
  const status = statusful4.as((statusful5) => statusful5.find((s) => s.urlTitle === result.urlTitle)?.status);
  let fetched = false;
  let tId = null;
  const prefetch = () => {
    if (!fetched) {
      tId = setTimeout(() => {
        if (!fetched) {
          const id = getDetailsCacheId(result.urlTitle);
          const _result = getDetails(result.urlTitle);
          prefetcher.add(id, _result);
          fetched = true;
        }
      }, 500);
    }
  };
  const cancel = () => {
    tId && clearTimeout(tId);
  };
  const onclick = () => {
    cancel();
    fetched = true;
    episodeNumber.value = null;
    urlTitle.value = result.urlTitle;
    search.value = null;
  };
  return jsx("div", {
    tabIndex: 0,
    className: status.as((status2) => status2 === Status.Watching ? "search-result watching" : "search-result"),
    onmouseenter: prefetch,
    onmouseleave: cancel,
    onfocus: prefetch,
    onblur: cancel,
    onclick,
    onkeydown: (e) => {
      e.key === "Enter" && onclick();
    },
    children: [
      jsx("div", {
        className: "image",
        style: {
          backgroundImage: "url(" + encodeURI(result.image) + ")"
        },
        children: jsx("div", {
          className: "status-bar"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      jsx("p", {
        children: result.title
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// node_modules/@9elt/miniframe/dist/esm/jsx-runtime.js
var jsx = function(key, props) {
  props || (props = {});
  if (props.children) {
    props.children = props.children instanceof State ? Array.isArray(props.children.value) ? props.children : [props.children] : Array.isArray(props.children) ? props.children.flat() : [props.children];
  }
  if (typeof key === "function") {
    return key(props);
  }
  props.tagName = key;
  return props;
};
var Fragment = function(props) {
  return props.children;
};

// src/components/search.tsx
var statusfulRef = new StateRef(statusful2);
var SearchInput = createNode(jsx("input", {
  className: "search-input",
  type: "text",
  placeholder: isMobile ? "Search" : "Type '/' to search",
  value: search.as((search3) => search3 || ""),
  oninput: debounce((e) => {
    search.value = e.target.value.trim() || null;
  }, 1000)
}, undefined, false, undefined, this));
var Search = createNode(jsx("div", {
  className: "search-container",
  children: [
    jsx("div", {
      className: "search-input-container",
      children: [
        SearchInput,
        search.as((_search) => _search !== null && jsx("span", {
          className: "search-input-adornment",
          onclick: () => {
            if (search.value !== null) {
              search.value = null;
            }
          },
          children: "\u2715"
        }, undefined, false, undefined, this))
      ]
    }, undefined, true, undefined, this),
    results.as((results2) => {
      statusfulRef.clear();
      return results2 && jsx("div", {
        tabIndex: -1,
        className: "search-results",
        children: results2.length === 0 ? jsx("p", {
          className: "no-search-results",
          children: "no results"
        }, undefined, false, undefined, this) : results2.map((result) => jsx(SearchResult, {
          result,
          statusful: statusfulRef
        }, undefined, false, undefined, this))
      }, undefined, false, undefined, this);
    })
  ]
}, undefined, true, undefined, this));
window.addEventListener("keydown", (e) => {
  if (document.activeElement?.tagName !== "INPUT" && e.key === "/") {
    e.preventDefault();
    SearchInput.focus();
  }
});
window.addEventListener("keydown", (e) => {
  if (search.value !== null && e.key === "Escape") {
    search.value = null;
  }
});
window.addEventListener("click", (e) => {
  if (search.value !== null && !Search.contains(e.target)) {
    search.value = null;
  }
});

// src/components/arrow.left.tsx
var ArrowLeft = jsx("svg", {
  namespaceURI: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  style: {
    width: "24px",
    height: "24px"
  },
  children: jsx("path", {
    namespaceURI: "http://www.w3.org/2000/svg",
    d: "M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"
  }, undefined, false, undefined, this)
}, undefined, false, undefined, this);

// src/components/arrow.right.tsx
var ArrowRight = jsx("svg", {
  namespaceURI: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  style: {
    width: "24px",
    height: "24px"
  },
  children: jsx("path", {
    namespaceURI: "http://www.w3.org/2000/svg",
    d: "M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
  }, undefined, false, undefined, this)
}, undefined, false, undefined, this);

// src/components/expandable.text.tsx
function ExpandableText({
  text,
  limit
}) {
  if (text.length <= limit) {
    return jsx("span", {
      children: text
    }, undefined, false, undefined, this);
  }
  const isOpen = new State(false);
  const onclick = () => {
    isOpen.value = !isOpen.value;
  };
  return jsx("span", {
    children: [
      isOpen.as((isOpen2) => isOpen2 ? text : text.slice(0, limit)),
      jsx("small", {
        style: {
          color: "#666",
          cursor: "pointer"
        },
        tabIndex: 0,
        onclick,
        onkeydown: (e) => {
          e.key === "Enter" && onclick();
        },
        children: isOpen.as((isOpen2) => isOpen2 ? " close" : "...")
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// src/components/episode.details.tsx
function EpisodeDetails({
  _details,
  _statusful,
  episodeNumber: episodeNumber2
}) {
  const status = _statusful.as((_statusful2) => _statusful2.find((s) => s.urlTitle === _details.urlTitle)?.status);
  const next = episodeNumber2.as((episodeNumber3) => _details.episodes[_details.episodes.indexOf(episodeNumber3 || 0) - 1] || null);
  const previous = episodeNumber2.as((episodeNumber3) => _details.episodes[_details.episodes.indexOf(episodeNumber3 || 0) + 1] || null);
  const scrollToEpisode = _details.episodes.length > 25;
  const buttonsElements = {};
  if (scrollToEpisode) {
    episodeNumber2.sub((episodeNumber3) => {
      episodeNumber3 !== null && buttonsElements[episodeNumber3]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
    });
  }
  return jsx("div", {
    className: status.as((status2) => status2 === Status.Watching ? "episode-header watching" : "episode-header"),
    children: [
      jsx("div", {
        className: "data",
        children: [
          jsx("div", {
            className: "image",
            style: {
              backgroundImage: "url(" + encodeURI(_details.image) + ")"
            },
            children: jsx("div", {
              className: "status-bar"
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          jsx("div", {
            className: "info",
            children: [
              jsx("button", {
                onclick: status.as((status2) => () => {
                  status2 === Status.Watching ? statusful2.remove(_details) : statusful2.add(_details, Status.Watching);
                }),
                children: status.as((status2) => status2 === Status.Watching ? "\u2715 Remove from watchlist" : "\u2605 Add to watchlist")
              }, undefined, false, undefined, this),
              jsx("h2", {
                children: status.as((status2) => status2 === Status.Watching ? "\u2605 " + _details.title : _details.title)
              }, undefined, false, undefined, this),
              (_details.release || _details.status || null) && jsx("small", {
                children: [
                  _details.release || null,
                  _details.status && _details.release && " \u2022 " || null,
                  _details.status || null
                ]
              }, undefined, true, undefined, this),
              _details.genres && jsx("p", {
                className: "genres",
                children: _details.genres.map((genre) => jsx("span", {
                  children: [genre]
                }, undefined, false, undefined, this))
              }, undefined, false, undefined, this),
              jsx("p", {
                className: "description",
                children: jsx(ExpandableText, {
                  text: _details.description,
                  limit: 200
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              _details.alias && jsx("p", {
                className: "aliases",
                children: [
                  jsx("small", {
                    children: "a.k.a. "
                  }, undefined, false, undefined, this),
                  jsx("i", {
                    children: _details.alias.join(" \u2022 ")
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      _details.episodes.length > 0 && jsx("div", {
        className: "episode-controls",
        children: [
          jsx("button", {
            className: previous.as((previous2) => previous2 === null ? "disabled" : undefined),
            onclick: previous.as((previous2) => previous2 === null ? undefined : () => {
              episodeNumber2.ref.value = previous2;
            }),
            children: [
              ArrowLeft,
              " prev"
            ]
          }, undefined, true, undefined, this),
          jsx("div", {
            className: _details.episodes.length < (isMobile ? 10 : 19) ? "episode-list center" : _details.episodes.length < 100 ? "episode-list" : _details.episodes.length < 200 ? "episode-list s" : "episode-list xs",
            children: _details.episodes.map((number) => {
              const button = createNode(jsx("button", {
                className: episodeNumber2.as((_episodeNumber) => _episodeNumber === number && "active" || ""),
                onclick: () => {
                  episodeNumber2.ref.value = number;
                },
                children: number
              }, undefined, false, undefined, this));
              if (scrollToEpisode) {
                buttonsElements[number] = button;
              }
              return button;
            })
          }, undefined, false, undefined, this),
          jsx("button", {
            className: next.as((next2) => next2 === null ? "disabled" : undefined),
            onclick: next.as((next2) => next2 === null ? undefined : () => {
              episodeNumber2.ref.value = next2;
            }),
            children: [
              "next ",
              ArrowRight
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
var EpisodeDetailsLoading = jsx("div", {
  className: "episode-header loading",
  children: [
    jsx("div", {
      className: "data",
      children: [
        jsx("div", {
          className: "image",
          style: { animationDelay: randomDelay() }
        }, undefined, false, undefined, this),
        jsx("div", {
          className: "info",
          style: { animationDelay: randomDelay() }
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this),
    jsx("div", {
      className: "episode-controls",
      children: [
        jsx("button", {
          style: { animationDelay: randomDelay() },
          children: [
            ArrowLeft,
            " prev"
          ]
        }, undefined, true, undefined, this),
        jsx("div", {
          className: "episode-list center",
          children: new Array(7).fill(null).map((_, i) => jsx("button", {
            children: i
          }, undefined, false, undefined, this))
        }, undefined, false, undefined, this),
        jsx("button", {
          style: { animationDelay: randomDelay() },
          children: [
            "next ",
            ArrowRight
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/components/episode.player.tsx
function EpisodePlayer({ _episode }) {
  const lastServer = localStorage.getItem(LSK_SERVER);
  const src = new State(_episode.links.find((item) => item.server === lastServer)?.href || _episode.links[0].href);
  return jsx("div", {
    className: "player",
    children: [
      jsx("iframe", {
        className: "player-iframe",
        src,
        allowFullscreen: true,
        frameBorder: "0",
        marginWidth: "0",
        marginHeight: "0",
        scrolling: "no"
      }, undefined, false, undefined, this),
      jsx("div", {
        className: "player-server-list",
        children: [
          jsx("small", {
            children: "servers"
          }, undefined, false, undefined, this),
          _episode.links.map((item) => jsx("button", {
            className: src.as((src2) => src2 === item.href && "active" || ""),
            onclick: () => {
              src.value = item.href;
              localStorage.setItem(LSK_SERVER, item.server);
            },
            children: item.server
          }, undefined, false, undefined, this))
        ]
      }, undefined, true, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
var LSK_SERVER = "server";
var EpisodePlayerLoading = jsx("div", {
  className: "player loading",
  children: [
    jsx("div", {
      className: "player-iframe"
    }, undefined, false, undefined, this),
    jsx("div", {
      className: "player-server-list",
      children: [
        jsx("small", {
          children: "servers"
        }, undefined, false, undefined, this),
        jsx("button", {
          children: "vidcdn"
        }, undefined, false, undefined, this),
        jsx("button", {
          children: "streamwish"
        }, undefined, false, undefined, this),
        jsx("button", {
          children: "hydrax"
        }, undefined, false, undefined, this),
        jsx("button", {
          children: "mp4upload"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/components/episode.tsx
var statusfulRef2 = new StateRef(statusful2);
var episodeNumberRef = new StateRef(episodeNumber);
var Episode = jsx(Fragment, {
  children: [
    details.as((_details) => {
      statusfulRef2.clear();
      episodeNumberRef.clear();
      return _details ? jsx(EpisodeDetails, {
        _details,
        _statusful: statusfulRef2,
        episodeNumber: episodeNumberRef
      }, undefined, false, undefined, this) : EpisodeDetailsLoading;
    }),
    episode2.as((_episode) => _episode === -1 ? null : _episode ? jsx(EpisodePlayer, {
      _episode
    }, undefined, false, undefined, this) : EpisodePlayerLoading)
  ]
}, undefined, true, undefined, this);

// src/components/card.tsx
function Card({
  entry,
  statusful: statusful6
}) {
  const status = statusful6.as((_statusful) => _statusful.find((s) => s.urlTitle === entry.urlTitle)?.status);
  let fetched = false;
  let tId = null;
  const prefetch = () => {
    if (!fetched) {
      tId = setTimeout(() => {
        if (!fetched) {
          const id = getDetailsCacheId(entry.urlTitle);
          const result = getDetails(entry.urlTitle);
          prefetcher.add(id, result);
          fetched = true;
        }
      }, 500);
    }
  };
  const cancel = () => {
    tId && clearTimeout(tId);
  };
  const onclick = () => {
    cancel();
    fetched = true;
    urlTitle.value = entry.urlTitle;
    if (entry.episode !== undefined) {
      episodeNumber.value = entry.episode;
    }
  };
  return jsx("div", {
    tabIndex: 0,
    className: status.as((status2) => status2 === Status.Watching ? "card watching" : "card"),
    onmouseenter: prefetch,
    onmouseleave: cancel,
    onfocus: prefetch,
    onblur: cancel,
    onclick,
    onkeydown: (e) => {
      e.key === "Enter" && onclick();
    },
    children: [
      jsx("div", {
        className: "image",
        style: {
          backgroundImage: entry.image && "url(" + encodeURI(entry.image) + ")"
        }
      }, undefined, false, undefined, this),
      jsx("p", {
        children: entry.title
      }, undefined, false, undefined, this),
      entry.episode !== undefined && jsx("small", {
        children: [
          "ep ",
          entry.episode
        ]
      }, undefined, true, undefined, this),
      status.as((status2) => status2 === Status.Watching && jsx("div", {
        className: "status",
        children: jsx("span", {
          children: "\u2605"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this)),
      jsx("div", {
        className: "status-bar"
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}

// src/components/list.pagination.tsx
function ListPagination({
  page,
  max,
  onclick
}) {
  if (page === null) {
    return null;
  }
  const size = 6;
  const left = 1;
  const right = size - left;
  const jump = right - 1;
  let start = Math.min(page < size ? 1 : Math.ceil((page - right) / jump) * jump - jump + right, max + 1 - size);
  const values = new Array(start < 1 ? size - 1 + start : size);
  if (start < 1) {
    start = 1;
  }
  for (let i = 0;i < values.length; i++) {
    values[i] = start + i;
  }
  return jsx("div", {
    className: "list-pagination",
    children: values.map((value) => jsx("button", {
      children: value,
      disabled: value === page,
      className: value === page && "active" || undefined,
      onclick: () => {
        onclick(value);
      }
    }, undefined, false, undefined, this))
  }, undefined, false, undefined, this);
}

// src/components/releases.list.tsx
function ReleasesList(_releases) {
  statusfulRef3.clear();
  return jsx("div", {
    className: "releases-list",
    children: [
      jsx("div", {
        className: "list-header",
        children: [
          jsx("h3", {
            children: "Recent Releases"
          }, undefined, false, undefined, this),
          ReleasesPagination
        ]
      }, undefined, true, undefined, this),
      jsx("div", {
        className: "card-list",
        children: _releases.map((_entry) => jsx(Card, {
          entry: _entry,
          statusful: statusfulRef3
        }, undefined, false, undefined, this))
      }, undefined, false, undefined, this),
      jsx("div", {
        className: "list-footer",
        children: ReleasesPagination
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
var statusfulRef3 = new StateRef(statusful2);
var ReleasesPagination = releasesPage.as((_page) => jsx(ListPagination, {
  page: _page,
  max: 99,
  onclick: (page) => {
    releasesPage.value = page;
  }
}, undefined, false, undefined, this));
var LoadingPagination = jsx(ListPagination, {
  page: 1,
  max: 6,
  onclick: () => {
  }
}, undefined, false, undefined, this);
var ReleasesLoading = jsx("div", {
  className: "loading",
  children: [
    jsx("div", {
      className: "list-header",
      children: [
        jsx("h3", {
          children: "Recent Releases"
        }, undefined, false, undefined, this),
        LoadingPagination
      ]
    }, undefined, true, undefined, this),
    jsx("div", {
      className: "card-list",
      children: new Array(8).fill(0).map(() => jsx("div", {
        className: "card loading",
        style: {
          animationDelay: randomDelay()
        }
      }, undefined, false, undefined, this))
    }, undefined, false, undefined, this),
    jsx("div", {
      className: "list-footer",
      children: LoadingPagination
    }, undefined, false, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/components/watching.list.tsx
function WatchingList(_watching) {
  statusfulRef4.clear();
  return jsx("div", {
    className: "watching-list",
    children: [
      jsx("div", {
        className: "list-header",
        children: [
          jsx("h3", {
            children: "Your Watchlist"
          }, undefined, false, undefined, this),
          WatchingPagination
        ]
      }, undefined, true, undefined, this),
      jsx("div", {
        className: "card-list",
        children: _watching.data.map((_entry) => jsx(Card, {
          entry: _entry,
          statusful: statusfulRef4
        }, undefined, false, undefined, this))
      }, undefined, false, undefined, this),
      jsx("div", {
        className: "list-footer",
        children: WatchingPagination
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
var statusfulRef4 = new StateRef(statusful2);
var WatchingPagination = State.use({
  watchingPage,
  watching
}).as((g) => jsx(ListPagination, {
  page: g.watchingPage,
  max: g.watching.maxPage,
  onclick: (page) => {
    watchingPage.value = page;
  }
}, undefined, false, undefined, this));

// src/components/home.tsx
var Home = jsx(Fragment, {
  children: [
    watching.as((watching3) => watching3.data.length > 0 && WatchingList(watching3)),
    releases.as((_releases) => _releases ? ReleasesList(_releases) : ReleasesLoading)
  ]
}, undefined, true, undefined, this);

// src/components/logo.tsx
var Logo = jsx("svg", {
  namespaceURI: "http://www.w3.org/2000/svg",
  viewBox: "0 0 304 90",
  children: [
    jsx("path", {
      namespaceURI: "http://www.w3.org/2000/svg",
      d: "M48.1689 13.0291C47.5022 8.86247 47.6689 0.429137 53.6689 0.0291371C61.1689 -0.470863 62.6689 5.52914 62.1689 13.0291C61.6689 20.5291 60.1689 26.5291 55.1689 26.5291C53.5509 26.5291 52.487 25.9888 51.4901 25.4826C49.4062 24.4243 47.6151 23.5147 41.6689 28C30.4002 36.5 7.1134 66.5981 17.6689 75.0291C28.9002 84 55.1689 84.5 56.1689 76.5291C57.5396 65.6034 47.1689 68.0291 41.6689 71.5291C36.1689 75.0291 32.1689 77.0291 34.6689 71.5291C37.1689 66.0291 45.1689 54.0291 52.6689 55.0291C60.1689 56.0291 64.1689 65.0291 63.1689 76.5291C62.1689 88.0291 59.1689 89.5291 49.6689 89.0291C40.1689 88.5291 20.1689 87.5291 9.16888 89.0291C-1.83112 90.5291 -1.05702 77.7301 1.90022 70C9.16888 51 25.6689 25.0291 48.1689 13.0291Z"
    }, undefined, false, undefined, this),
    jsx("path", {
      namespaceURI: "http://www.w3.org/2000/svg",
      "fill-rule": "evenodd",
      "clip-rule": "evenodd",
      d: "M109.9 2.5C106.4 2.5 97.5002 5.1 89.9002 15.5C80.4002 28.5 63.9002 62.5 73.9002 78.5C79.1002 86.1 90.0669 88.3333 94.9002 88.5H124.4C128.067 88.5 136.8 87.2 142.4 82C158.016 67.5 139.4 30 129.9 15.5C122.3 3.9 113.4 2 109.9 2.5ZM109.814 13C104.314 13 93.8142 29 89.3142 38C84.8142 47 75.8142 74 90.3142 75.5C104.814 77 120.927 77.9517 129.814 75.5C144.314 71.5 135.356 49 130.314 38C124.814 26 115.314 13 109.814 13Z"
    }, undefined, false, undefined, this),
    jsx("path", {
      namespaceURI: "http://www.w3.org/2000/svg",
      d: "M203.169 13.0291C202.502 8.86247 202.669 0.429137 208.669 0.0291371C216.169 -0.470863 217.669 5.52914 217.169 13.0291C216.669 20.5291 215.169 26.5291 210.169 26.5291C208.551 26.5291 207.487 25.9888 206.49 25.4826C204.406 24.4243 202.615 23.5147 196.669 28C185.4 36.5 162.113 66.5981 172.669 75.0291C183.9 84 210.169 84.5 211.169 76.5291C212.54 65.6034 202.169 68.0291 196.669 71.5291C191.169 75.0291 187.169 77.0291 189.669 71.5291C192.169 66.0291 200.169 54.0291 207.669 55.0291C215.169 56.0291 219.169 65.0291 218.169 76.5291C217.169 88.0291 214.169 89.5291 204.669 89.0291C195.169 88.5291 175.169 87.5291 164.169 89.0291C153.169 90.5291 153.943 77.7301 156.9 70C164.169 51 180.669 25.0291 203.169 13.0291Z"
    }, undefined, false, undefined, this),
    jsx("path", {
      namespaceURI: "http://www.w3.org/2000/svg",
      "fill-rule": "evenodd",
      "clip-rule": "evenodd",
      d: "M264.9 2.5C261.4 2.5 252.5 5.1 244.9 15.5C235.4 28.5 218.9 62.5 228.9 78.5C234.1 86.1 245.067 88.3333 249.9 88.5H279.4C283.067 88.5 291.8 87.2 297.4 82C313.016 67.5 294.4 30 284.9 15.5C277.3 3.9 268.4 2 264.9 2.5ZM264.814 13C259.314 13 248.814 29 244.314 38C239.814 47 230.814 74 245.314 75.5C259.814 77 275.927 77.9517 284.814 75.5C299.314 71.5 290.356 49 285.314 38C279.814 26 270.314 13 264.814 13Z"
    }, undefined, false, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/components/root.tsx
var Root = jsx("div", {
  id: "root",
  children: [
    jsx("header", {
      children: jsx("div", {
        children: [
          jsx("button", {
            className: "logo",
            onclick: () => {
              if (route.value !== Route.Home) {
                urlTitle.value = null;
                episodeNumber.value = null;
              }
            },
            children: Logo
          }, undefined, false, undefined, this),
          Search
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this),
    jsx("main", {
      children: route.as((route2) => {
        route2 === Route.Episode && setTimeout(() => scrollTo({
          top: 0,
          behavior: "smooth"
        }), 50);
        return route2 === Route.Home ? Home : Episode;
      })
    }, undefined, false, undefined, this),
    jsx("footer", {
      children: jsx("small", {
        children: [
          "This is an alternative client for",
          " ",
          jsx("a", {
            href: GOGO_URL,
            children: "gogoanime"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this)
  ]
}, undefined, true, undefined, this);

// src/index.ts
document.body.appendChild(createNode(Root));
