const STORAGE_KEY = "proxySwitchState";
const DIRECT_ID = "direct";
const DEFAULT_PROXIES_VERSION = 2;
const DEFAULT_PROXIES = [
  { id: "company-socks", name: "Company SOCKS5", type: "socks5", host: "127.0.0.1", port: 1080, proxyDNS: true },
  { id: "company-http", name: "Company HTTP", type: "http", host: "127.0.0.1", port: 8080 },
  { id: "clash-http", name: "Clash HTTP", type: "http", host: "127.0.0.1", port: 7890 }
];

function createId() {
  return `proxy-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function normalizeProxy(proxy) {
  return {
    id: String(proxy.id || createId()),
    name: String(proxy.name || "").trim(),
    type: proxy.type === "socks5" ? "socks5" : "http",
    host: String(proxy.host || "").trim(),
    port: Number(proxy.port),
    proxyDNS: proxy.type === "socks5" ? Boolean(proxy.proxyDNS) : false
  };
}

function validateProxy(proxy) {
  if (!proxy.name) return "名称不能为空。";
  if (!proxy.host) return "Host 不能为空。";
  if (!Number.isInteger(proxy.port) || proxy.port < 1 || proxy.port > 65535) return "Port 必须是 1 到 65535 之间的整数。";
  if (proxy.type !== "http" && proxy.type !== "socks5") return "代理类型只能是 HTTP 或 SOCKS5。";
  return "";
}

async function getState() {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  if (!stored[STORAGE_KEY]) {
    const state = { proxies: DEFAULT_PROXIES, selectedId: DIRECT_ID, defaultProxiesVersion: DEFAULT_PROXIES_VERSION };
    await browser.storage.local.set({ [STORAGE_KEY]: state });
    return state;
  }
  const state = stored[STORAGE_KEY];
  const savedProxies = Array.isArray(state.proxies) ? state.proxies.map(normalizeProxy) : [];
  const proxies = [...savedProxies];
  if (!state.defaultProxiesVersion && !proxies.some((proxy) => proxy.id === "clash-http")) proxies.push(DEFAULT_PROXIES.find((proxy) => proxy.id === "clash-http"));
  const selectedId = state.selectedId === DIRECT_ID || proxies.some((proxy) => proxy.id === state.selectedId) ? state.selectedId : DIRECT_ID;
  const normalizedState = { proxies, selectedId, defaultProxiesVersion: DEFAULT_PROXIES_VERSION };
  if (proxies.length !== savedProxies.length || selectedId !== state.selectedId || state.defaultProxiesVersion !== DEFAULT_PROXIES_VERSION) await saveState(normalizedState);
  return normalizedState;
}

async function saveState(state) {
  await browser.storage.local.set({ [STORAGE_KEY]: state });
}

function getProxyConfig(proxy) {
  if (!proxy) return { proxyType: "none" };
  const address = `${proxy.host}:${proxy.port}`;
  if (proxy.type === "socks5") return { proxyType: "manual", socks: address, socksVersion: 5, proxyDNS: proxy.proxyDNS };
  return { proxyType: "manual", http: address, ssl: address };
}

function getBadgeText(selectedId, proxies) {
  if (selectedId === DIRECT_ID) return "D";
  const proxy = proxies.find((item) => item.id === selectedId);
  return proxy?.type === "socks5" ? "S" : "H";
}

async function updateBadge(state) {
  await browser.action.setBadgeText({ text: getBadgeText(state.selectedId, state.proxies) });
  await browser.action.setBadgeBackgroundColor({ color: state.selectedId === DIRECT_ID ? "#737373" : "#0060df" });
}

async function applySelectedProxy(selectedId) {
  const state = await getState();
  const proxy = selectedId === DIRECT_ID ? null : state.proxies.find((item) => item.id === selectedId);
  state.selectedId = proxy || selectedId === DIRECT_ID ? selectedId : DIRECT_ID;
  await browser.proxy.settings.set({ value: getProxyConfig(proxy) });
  await saveState(state);
  await updateBadge(state);
  return state;
}

async function restoreSelectedProxy() {
  const state = await getState();
  return applySelectedProxy(state.selectedId);
}
