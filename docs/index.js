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
    if (node instanceof window.Text && (typeof curr === "string" || typeof curr === "number"))
      return node.textContent = curr;
    const update = __createNode(curr);
    node.replaceWith(update);
    node = update;
  }) && D_props.value : D_props;
  if (typeof props === "string" || typeof props === "number")
    return node = window.document.createTextNode(props);
  if (!props)
    return node = window.document.createTextNode("");
  if (props instanceof window.Node)
    return node = props;
  node = window.document.createElementNS(props.namespaceURI || "http://www.w3.org/1999/xhtml", props.tagName);
  copyObject(node, props);
  return node;
};
var copyObject = function(on, D_from) {
  const from = D_from instanceof State ? D_from.sub((curr, prev) => {
    for (const key in prev)
      setPrimitive(on, key, null);
    check__pref__tref(on);
    on.__tref = curr;
    copyObject(on, curr);
  }) && (on.__tref = D_from.value) : D_from;
  for (const key in from)
    if (key === "namespaceURI" || key === "tagName")
      continue;
    else if (key === "children")
      setNodeList(on, from[key]);
    else if (typeof (from[key] instanceof State ? from[key].value : from[key]) === "object" && !on.__pref) {
      on[key].__pref = on;
      copyObject(on[key], from[key]);
    } else
      setPrimitive(on, key, from);
};
var setNodeList = function(parent, D_children) {
  parent.append(...createNodeList(D_children instanceof State ? D_children.sub((current) => {
    check__pref__tref(parent);
    parent.replaceChildren(...createNodeList(current));
  }) && D_children.value : D_children));
};
var createNodeList = function(props) {
  const list = new Array(props && props.length || 0);
  for (let i = 0;i < list.length; i++)
    list[i] = __createNode(props[i]);
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
  if (("__pref" in on ? !on.__pref.isConnected : !on.isConnected) || typeof from !== "undefined" && "__tref" in on && on.__tref !== from)
    throw 1;
};
var TMP;

class State {
  constructor(value) {
    this._v = value;
    this._s = [];
  }
  static use(states) {
    const w = new State({});
    for (const key in states) {
      w.value[key] = states[key].value;
      states[key].sub((current) => w.value = Object.assign(w.value, { [key]: current }));
    }
    return w;
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
  as(f) {
    const _ = new State(f(this._v));
    this.sub((curr) => _.value = f(curr));
    return _;
  }
  sub(f) {
    this._s.push(f);
    return f;
  }
  unsub(f) {
    this._s = this._s.filter((s) => s !== f);
  }
  _d(curr, prev) {
    const s = new Array(this._s.length);
    let len = 0;
    for (let i = 0;i < this._s.length; i++)
      try {
        this._s[i](curr, prev);
        s[len++] = this._s[i];
      } catch (_a) {
      }
    s.length = len;
    this._s = s;
  }
}

// src/lib/ep.cache.ts
var loadEpCache = function() {
  try {
    const raw = localStorage.getItem(LSK_EP_CACHE);
    return raw ? deserialize(raw) : [];
  } catch {
    return [];
  }
};
var dumpEpCache = function() {
  localStorage.setItem(LSK_EP_CACHE, serialize(epCache));
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
var CACHE_MAX_SIZE = 256;
var epCache = loadEpCache();
epCache.get = (id) => {
  return epCache.find((item) => item[0] === id)?.[1];
};
epCache.add = (id, ep) => {
  for (const item of epCache) {
    if (item[0] === id) {
      item[1] = ep;
      dumpEpCache();
      return;
    }
  }
  if (epCache.length > CACHE_MAX_SIZE) {
    epCache.shift();
  }
  epCache.push([id, ep]);
  dumpEpCache();
};

// src/lib/cache.ts
var CACHE_MAX_SIZE2 = 64;
var cache = [];
cache.add = (id, data) => {
  cache.push({ id, data });
  if (cache.length > CACHE_MAX_SIZE2) {
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
    const server = _li.className;
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
    const urlTitle = _div.querySelector("a")?.href.replace(window.location.origin + window.location.pathname, "").replace("/category", "");
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

// src/lib/states.ts
class AsyncState extends State {
  constructor(value) {
    super(value);
  }
  asyncAs(fn) {
    const child = new State(undefined);
    this.sub(async (value) => {
      child.value = await fn(value);
    })(this.value, this.value);
    return child;
  }
}

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
    return this.ref.sub(f);
  }
  as(f) {
    const child = new State(f(this.ref.value));
    this.refs.push(this.ref.sub((value) => {
      child.value = f(value);
    }));
    return child;
  }
}

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
function serialize2(values) {
  let result = SER_VERSION2;
  for (const value of values) {
    result += value.title + "\n" + value.urlTitle + "\n" + value.image + "\n" + value.status + "\n\n";
  }
  return result.slice(0, -2);
}
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

// src/global.ts
var releasesPage = new UrlState("releases", Number);
releasesPage.value ||= 1;
var releases = releasesPage.asyncAs(async (page) => page === null ? [] : await getReleases(page));
var search = new UrlState("search", String);
var results = search.asyncAs(async (search2) => search2?.trim() ? await getSearch(search2) : null);
var urlTitle = new UrlState("title", String);
var Route;
(function(Route2) {
  Route2[Route2["Home"] = 0] = "Home";
  Route2[Route2["Player"] = 1] = "Player";
})(Route || (Route = {}));
var route = urlTitle.as((title) => title === null ? Route.Home : Route.Player);
var headTitle = document.querySelector("head>title");
var originalTitle = headTitle.textContent;
var details = urlTitle.asyncAs(async (urlTitle2) => {
  const details2 = urlTitle2 === null ? null : await getDetails(urlTitle2);
  headTitle.textContent = details2?.title || originalTitle;
  if (details2 && episodeNumber.value === null) {
    episodeNumber.value = epCache.get(urlTitle2) || details2.episodes[details2.episodes.length - 1] || null;
  }
  return details2;
});
var episodeNumber = new AsyncState(null);
episodeNumber.sub((value) => {
  if (value !== null && urlTitle.value !== null) {
    epCache.add(urlTitle.value, value);
  }
});
var episode = episodeNumber.asyncAs(async (episodeNumber2) => urlTitle.value && episodeNumber2 !== null ? await getEpisode(urlTitle.value, episodeNumber2) : null);
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
var watchingPage = new UrlState("watching", Number);
watchingPage.value ||= 1;
statusful2.sub((_statusful) => {
  const maxPage = Math.ceil(_statusful.length / WATCHING_PAGE_SIZE);
  watchingPage.value = Math.min(watchingPage.value || 0, maxPage);
});
var watching = State.use({ watchingPage, statusful: statusful2 }).as((g) => {
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

// src/components/expandable.text.ts
function ExpandableText(text, limit) {
  if (text.length <= limit) {
    return {
      tagName: "span",
      children: [text]
    };
  }
  const isOpen = new State(false);
  const onclick = () => {
    isOpen.value = !isOpen.value;
  };
  return {
    tagName: "span",
    children: [
      isOpen.as((isOpen2) => isOpen2 ? text : text.slice(0, limit)),
      {
        tagName: "small",
        style: {
          color: "#666",
          cursor: "pointer"
        },
        tabIndex: 0,
        onclick,
        onkeydown: (e) => {
          e.key === "Enter" && onclick();
        },
        children: [
          isOpen.as((isOpen2) => isOpen2 ? " close" : "...")
        ]
      }
    ]
  };
}

// src/components/details.ts
function Details(_details, _statusful, episodeNumber2) {
  const status = _statusful.as((_statusful2) => _statusful2.find((s) => s.urlTitle === _details.urlTitle)?.status);
  const next = episodeNumber2.as((episodeNumber3) => _details.episodes[_details.episodes.indexOf(episodeNumber3 || 0) - 1] || null);
  const previous = episodeNumber2.as((episodeNumber3) => _details.episodes[_details.episodes.indexOf(episodeNumber3 || 0) + 1] || null);
  const scrollToEpisode = _details.episodes.length > 25;
  const buttonsElements = {};
  if (scrollToEpisode) {
    episodeNumber2.sub((episodeNumber3) => episodeNumber3 !== null && buttonsElements[episodeNumber3]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    }));
  }
  return {
    tagName: "div",
    className: status.as((status2) => status2 === Status.Watching ? "details-container watching" : "details-container"),
    children: [
      {
        tagName: "div",
        className: "details",
        style: {},
        children: [
          {
            tagName: "div",
            className: "image",
            style: {
              backgroundImage: "url(" + encodeURI(_details.image) + ")"
            },
            children: [
              {
                tagName: "div",
                className: "status-bar"
              }
            ]
          },
          {
            tagName: "div",
            className: "data",
            children: [
              {
                tagName: "button",
                children: [
                  status.as((status2) => status2 === Status.Watching ? "\u2715 Remove from watchlist" : "\u2605 Add to watchlist")
                ],
                onclick: status.as((status2) => () => {
                  status2 === Status.Watching ? statusful2.remove(_details) : statusful2.add(_details, Status.Watching);
                })
              },
              {
                tagName: "h2",
                children: [
                  status.as((status2) => status2 === Status.Watching ? "\u2605 " + _details.title : _details.title)
                ]
              },
              (_details.release || _details.status) && {
                tagName: "small",
                children: [
                  _details.release || null,
                  _details.status && _details.release && " \u2022 " || null,
                  _details.status || null
                ]
              },
              _details.genres && {
                tagName: "p",
                className: "genres",
                children: _details.genres.map((genre) => ({
                  tagName: "span",
                  children: [genre]
                }))
              },
              {
                tagName: "p",
                className: "description",
                children: [
                  ExpandableText(_details.description, 200)
                ]
              },
              _details.alias && {
                tagName: "p",
                className: "aliases",
                children: [
                  {
                    tagName: "small",
                    children: ["a.k.a. "]
                  },
                  {
                    tagName: "i",
                    children: [
                      _details.alias.join(" \u2022 ")
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        tagName: "div",
        className: "episode-buttons",
        children: [
          {
            tagName: "button",
            className: previous.as((previous2) => previous2 === null && "disabled" || null),
            children: ["\uD83E\uDC90 previous"],
            onclick: previous.as((previous2) => previous2 !== null && (() => {
              episodeNumber2.ref.value = previous2;
            }))
          },
          {
            tagName: "div",
            className: _details.episodes.length < 19 ? "episode-list center" : _details.episodes.length < 100 ? "episode-list" : _details.episodes.length < 200 ? "episode-list s" : "episode-list xs",
            children: _details.episodes.map((number) => {
              const button = createNode({
                tagName: "button",
                className: episodeNumber2.as((_episodeNumber) => _episodeNumber === number && "active"),
                children: [number],
                onclick: () => {
                  episodeNumber2.ref.value = number;
                }
              });
              if (scrollToEpisode) {
                buttonsElements[number] = button;
              }
              return button;
            })
          },
          {
            tagName: "button",
            className: next.as((next2) => next2 === null && "disabled" || null),
            children: ["next \uD83E\uDC92"],
            onclick: next.as((next2) => next2 !== null && (() => {
              episodeNumber2.ref.value = next2;
            }))
          }
        ]
      }
    ]
  };
}
function EpisodePlayer(_episode) {
  const lastServer = localStorage.getItem(LSK_SERVER);
  const src = new State(_episode.links.find((item) => item.server === lastServer)?.href || _episode.links[0].href);
  const iframe = createNode({
    tagName: "iframe",
    src
  });
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("marginwidth", "0");
  iframe.setAttribute("marginheight", "0");
  iframe.setAttribute("scrolling", "no");
  return {
    tagName: "div",
    className: "player",
    children: [
      iframe,
      {
        tagName: "div",
        className: "server-list",
        children: [
          {
            tagName: "small",
            children: ["servers"]
          },
          ..._episode.links.map((item) => ({
            tagName: "button",
            className: src.as((src2) => src2 === item.href && "active"),
            children: [
              item.server
            ],
            onclick: () => {
              src.value = item.href;
              localStorage.setItem(LSK_SERVER, item.server);
            }
          }))
        ]
      }
    ]
  };
}
var LSK_SERVER = "server";

// src/components/loading.ts
var Loading = {
  tagName: "p",
  children: ["loading"]
};

// src/components/card.ts
function Card(entry, statusful3) {
  const status = statusful3.as((_statusful) => _statusful.find((s) => s.urlTitle === entry.urlTitle)?.status);
  let fetched = false;
  let tId;
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
  return {
    tagName: "div",
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
      {
        tagName: "div",
        className: "image",
        style: {
          backgroundImage: entry.image && "url(" + encodeURI(entry.image) + ")"
        }
      },
      {
        tagName: "p",
        children: [entry.title]
      },
      entry.episode !== undefined && {
        tagName: "small",
        children: ["ep ", entry.episode]
      },
      status.as((status2) => status2 === Status.Watching && {
        tagName: "div",
        className: "status",
        children: [
          {
            tagName: "span",
            children: [
              "\u2605"
            ]
          }
        ]
      }),
      {
        tagName: "div",
        className: "status-bar"
      }
    ]
  };
}

// src/components/pagination.ts
function Pagination(page, max, onclick) {
  if (page === null) {
    return 0;
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
  return {
    tagName: "div",
    className: "pagination",
    children: values.map((value) => ({
      tagName: "button",
      children: [value],
      disabled: value === page,
      className: value === page && "active",
      onclick: () => {
        onclick(value);
      }
    }))
  };
}

// src/components/releases.ts
function Releases(_releases) {
  statusfulRef.clear();
  return {
    tagName: "div",
    children: [
      {
        tagName: "div",
        className: "section-header",
        children: [
          {
            tagName: "h3",
            children: ["Recent releases"]
          },
          ReleasesPagination
        ]
      },
      {
        tagName: "div",
        className: "releases-list",
        children: _releases.map((_entry) => Card(_entry, statusfulRef))
      },
      {
        tagName: "div",
        className: "section-footer",
        children: [
          ReleasesPagination
        ]
      }
    ]
  };
}
var ReleasesPagination = releasesPage.as((_page) => Pagination(_page, 99, (page) => {
  releasesPage.value = page;
}));
var statusfulRef = new StateRef(statusful2);
var LoadingPagination = Pagination(1, 6, () => {
});
var ReleasesLoading = {
  tagName: "div",
  className: "loading",
  children: [
    LoadingPagination,
    {
      tagName: "div",
      className: "releases-list",
      children: new Array(8).fill(0).map(() => ({
        tagName: "div",
        className: "card loading",
        style: {
          animationDelay: (Math.random() * 300).toFixed(0) + "ms"
        }
      }))
    },
    LoadingPagination
  ]
};

// src/components/search.ts
var Result = function(result, statusful3) {
  const status = statusful3.as((statusful4) => statusful4.find((s) => s.urlTitle === result.urlTitle)?.status);
  let fetched = false;
  let tId;
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
  return {
    tagName: "div",
    tabIndex: 0,
    className: status.as((status2) => status2 === Status.Watching ? "result watching" : "result"),
    onmouseenter: prefetch,
    onmouseleave: cancel,
    onfocus: prefetch,
    onblur: cancel,
    onclick,
    onkeydown: (e) => {
      e.key === "Enter" && onclick();
    },
    children: [
      {
        tagName: "div",
        className: "image",
        style: {
          backgroundImage: "url(" + encodeURI(result.image) + ")"
        },
        children: [
          {
            tagName: "div",
            className: "status-bar"
          }
        ]
      },
      {
        tagName: "p",
        children: [result.title]
      }
    ]
  };
};
var debounce = function(f, ms) {
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
};
var statusfulRef2 = new StateRef(statusful2);
var SearchInput = createNode({
  tagName: "input",
  type: "search",
  placeholder: "Type '/' to search",
  value: search.as((search2) => search2 || ""),
  oninput: debounce((e) => {
    search.value = e.target.value.trim() || null;
  }, 1000)
});
window.addEventListener("keydown", (e) => {
  if (document.activeElement !== SearchInput && document.activeElement?.tagName !== "INPUT" && e.key === "/") {
    e.preventDefault();
    SearchInput.focus();
  }
});
var Search = createNode({
  tagName: "div",
  className: "search-container",
  children: [
    SearchInput,
    results.as((results2) => {
      statusfulRef2.clear();
      return results2 && {
        tagName: "div",
        tabIndex: -1,
        className: "search-results",
        children: results2.length === 0 ? [
          {
            tagName: "p",
            className: "no-results",
            children: ["no results"]
          }
        ] : results2.map((result) => Result(result, statusfulRef2))
      };
    })
  ]
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

// src/components/watching.ts
function Watching(_watching) {
  statusfulRef3.clear();
  return {
    tagName: "div",
    children: [
      {
        tagName: "div",
        className: "section-header",
        children: [
          {
            tagName: "h2",
            children: ["Watchlist"]
          },
          WatchingPagination
        ]
      },
      {
        tagName: "div",
        className: "watching-list",
        children: _watching.data.map((_entry) => Card(_entry, statusfulRef3))
      },
      {
        tagName: "div",
        className: "section-footer",
        children: [
          WatchingPagination
        ]
      }
    ]
  };
}
var WatchingPagination = State.use({ watchingPage, watching }).as((g) => Pagination(g.watchingPage, g.watching.maxPage, (page) => {
  watchingPage.value = page;
}));
var statusfulRef3 = new StateRef(statusful2);

// src/components/root.ts
var Home = [
  watching.as((watching3) => watching3.data.length > 0 && Watching(watching3)),
  releases.as((_releases) => _releases ? Releases(_releases) : ReleasesLoading)
];
var statusfulRef4 = new StateRef(statusful2);
var episodeNumberRef = new StateRef(episodeNumber);
var Player = [
  details.as((_details) => {
    statusfulRef4.clear();
    episodeNumberRef.clear();
    return _details ? Details(_details, statusfulRef4, episodeNumberRef) : Loading;
  }),
  episode.as((_episode) => _episode ? EpisodePlayer(_episode) : Loading)
];
var Logo = `<svg viewBox="0 0 305 91" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M110.458 4C100.458 4 91.1704 13.213 79.9578 33C71.4578 48 68.9578 74.5 76.4578 82C83.9578 89.5 99.9578 90.5 111.958 90.5C123.958 90.5 135.458 90.5 143.958 83C152.458 75.5 148.958 45.5 137.958 27.5C126.958 9.5 118.958 4 110.458 4ZM110.458 15.5C103.958 15.5 92.9051 31 88.9578 41C80.4709 62.5 81.9578 71 85.4578 75C88.9578 79 107.958 79.5 111.958 79.5C115.958 79.5 133.958 78 135.958 75C137.958 72 140.208 59.5 130.958 41C127.458 34 117.958 15.5 110.458 15.5Z"/>
<path d="M55.724 0.0130428C48.524 -0.386957 48.3907 8.51304 49.224 13.013C35.224 21.013 13.224 43.013 3.22398 68.013C-6.77602 93.013 9.22398 89.513 14.224 89.513C19.224 89.513 49.224 89.013 55.724 89.513C62.224 90.013 66.724 83.513 63.224 64.513C59.724 45.513 44.724 59.013 37.224 69.513C29.724 80.013 38.724 74.513 42.724 72.513C46.724 70.513 51.224 66.513 55.724 71.013C60.224 75.513 56.724 88.513 29.224 81.013C1.72399 73.513 30.724 42.513 38.724 32.013C46.724 21.513 53.724 26.513 57.724 26.513C61.724 26.513 63.224 20.013 63.224 16.513C63.224 13.013 64.724 0.513043 55.724 0.0130428Z"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M266.458 4C256.458 4 247.17 13.213 235.958 33C227.458 48 224.958 74.5 232.458 82C239.958 89.5 255.958 90.5 267.958 90.5C279.958 90.5 291.458 90.5 299.958 83C308.458 75.5 304.958 45.5 293.958 27.5C282.958 9.5 274.958 4 266.458 4ZM266.458 15.5C259.958 15.5 248.905 31 244.958 41C236.471 62.5 237.958 71 241.458 75C244.958 79 263.958 79.5 267.958 79.5C271.958 79.5 289.958 78 291.958 75C293.958 72 296.208 59.5 286.958 41C283.458 34 273.958 15.5 266.458 15.5Z"/>
<path d="M211.724 0.0130428C204.524 -0.386957 204.391 8.51304 205.224 13.013C191.224 21.013 169.224 43.013 159.224 68.013C149.224 93.013 165.224 89.513 170.224 89.513C175.224 89.513 205.224 89.013 211.724 89.513C218.224 90.013 222.724 83.513 219.224 64.513C215.724 45.513 200.724 59.013 193.224 69.513C185.724 80.013 194.724 74.513 198.724 72.513C202.724 70.513 207.224 66.513 211.724 71.013C216.224 75.513 212.724 88.513 185.224 81.013C157.724 73.513 186.724 42.513 194.724 32.013C202.724 21.513 209.724 26.513 213.724 26.513C217.724 26.513 219.224 20.013 219.224 16.513C219.224 13.013 220.724 0.513043 211.724 0.0130428Z"/>
</svg>`;
var Header = {
  tagName: "header",
  children: [
    {
      tagName: "div",
      children: [
        {
          tagName: "button",
          className: "logo",
          innerHTML: Logo,
          onclick: () => {
            if (route.value !== Route.Home) {
              urlTitle.value = null;
              episodeNumber.value = null;
            }
          }
        },
        Search
      ]
    }
  ]
};
var Root = {
  tagName: "div",
  id: "root",
  children: [
    Header,
    {
      tagName: "main",
      children: route.as((route2) => route2 === Route.Home ? Home : Player)
    }
  ]
};

// src/index.ts
document.body.appendChild(createNode(Root));
