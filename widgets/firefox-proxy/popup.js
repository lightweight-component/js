const list = document.getElementById("proxy-list");
const current = document.getElementById("current");
const error = document.getElementById("error");

function formatProxy(proxy) {
  const type = proxy.type === "socks5" ? "SOCKS5" : proxy.type === "https" ? "HTTPS" : "HTTP";
  const authentication = proxy.type !== "socks5" && proxy.username && proxy.password ? " · 已配置认证" : "";
  return `${type} ${proxy.host}:${proxy.port}${authentication}`;
}

function showError(message) {
  error.hidden = !message;
  error.textContent = message || "";
}

function render(state) {
  const entries = [{ id: DIRECT_ID, name: "直连", detail: "不使用代理" }, ...state.proxies.map((proxy) => ({ ...proxy, detail: formatProxy(proxy) }))];
  list.replaceChildren(...entries.map((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `proxy${entry.id === state.selectedId ? " selected" : ""}`;
    button.dataset.id = entry.id;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(entry.id === state.selectedId));
    button.innerHTML = `<span class="dot" aria-hidden="true"></span><span><span class="name">${escapeHtml(entry.name)}</span><span class="detail">${escapeHtml(entry.detail)}</span></span>`;
    return button;
  }));
  const selected = entries.find((entry) => entry.id === state.selectedId);
  current.textContent = `当前：${selected?.name || "直连"}`;
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

list.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  try {
    showError("");
    render(await applySelectedProxy(button.dataset.id));
  } catch (cause) {
    console.error(cause);
    showError("无法应用代理设置，请确认已允许扩展访问隐私窗口。");
  }
});

document.getElementById("settings").addEventListener("click", () => browser.runtime.openOptionsPage());

getState().then(render).catch((cause) => showError(`无法读取配置：${cause.message}`));
