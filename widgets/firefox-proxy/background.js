let activeRequestProxy = null;

function handleProxyRequest() {
  return activeRequestProxy ? getHttpProxyInfo(activeRequestProxy) : { type: "direct" };
}

function updateProxyRequestHandler(proxy) {
  activeRequestProxy = proxy?.type === "https" || (proxy?.type === "http" && proxy.username && proxy.password) ? proxy : null;
  if (activeRequestProxy && !browser.proxy.onRequest.hasListener(handleProxyRequest)) {
    browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });
  }
  if (!activeRequestProxy && browser.proxy.onRequest.hasListener(handleProxyRequest)) {
    browser.proxy.onRequest.removeListener(handleProxyRequest);
  }
}

async function applySelectedProxyInBackground(selectedId) {
  const state = await getState();
  const proxy = selectedId === DIRECT_ID ? null : state.proxies.find((item) => item.id === selectedId);
  state.selectedId = proxy || selectedId === DIRECT_ID ? selectedId : DIRECT_ID;
  updateProxyRequestHandler(proxy);
  await browser.proxy.settings.set({ value: getProxyConfig(proxy) });
  await saveState(state);
  await updateBadge(state);
  return state;
}

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "apply-selected-proxy") return applySelectedProxyInBackground(message.selectedId);
  return undefined;
});

browser.runtime.onInstalled.addListener(() => {
  getState().then((state) => applySelectedProxyInBackground(state.selectedId)).catch(console.error);
});

browser.runtime.onStartup.addListener(() => {
  getState().then((state) => applySelectedProxyInBackground(state.selectedId)).catch(console.error);
});

getState().then((state) => applySelectedProxyInBackground(state.selectedId)).catch(console.error);
