const form = document.getElementById("proxy-form");
const type = document.getElementById("type");
const dnsRow = document.getElementById("dns-row");
const message = document.getElementById("message");
const cancel = document.getElementById("cancel");
let state;

function formatProxy(proxy) {
  const dns = proxy.type === "socks5" ? `，DNS 代理：${proxy.proxyDNS ? "开" : "关"}` : "";
  const typeLabel = proxy.type === "socks5" ? "SOCKS5" : proxy.type === "https" ? "HTTPS" : "HTTP";
  const authentication = proxy.type !== "socks5" && proxy.username && proxy.password ? "，已配置认证" : "";
  return `${typeLabel} · ${proxy.host}:${proxy.port}${dns}${authentication}`;
}

function showMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle("success", success);
}

function updateDnsVisibility() {
  dnsRow.hidden = type.value !== "socks5";
  const needsAuthentication = type.value === "http" || type.value === "https";
  document.getElementById("username-row").hidden = !needsAuthentication;
  document.getElementById("password-row").hidden = !needsAuthentication;
}

function resetForm() {
  form.reset();
  document.getElementById("id").value = "";
  document.getElementById("editor-title").textContent = "新增代理";
  type.value = "socks5";
  document.getElementById("proxy-dns").checked = true;
  cancel.hidden = true;
  showMessage("");
  updateDnsVisibility();
}

function render() {
  const container = document.getElementById("proxy-list");
  if (!state.proxies.length) {
    container.innerHTML = '<div class="empty">尚未保存代理配置。</div>';
    return;
  }
  container.replaceChildren(...state.proxies.map((proxy) => {
    const card = document.createElement("article");
    card.className = "card";
    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = proxy.name;
    const detail = document.createElement("div");
    detail.className = "card-detail";
    detail.textContent = formatProxy(proxy);
    info.append(name, detail);
    const controls = document.createElement("div");
    const edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "编辑";
    edit.addEventListener("click", () => editProxy(proxy.id));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => removeProxy(proxy.id));
    controls.append(edit, remove);
    card.append(info, controls);
    return card;
  }));
}

function editProxy(id) {
  const proxy = state.proxies.find((item) => item.id === id);
  if (!proxy) return;
  document.getElementById("id").value = proxy.id;
  document.getElementById("name").value = proxy.name;
  type.value = proxy.type;
  document.getElementById("host").value = proxy.host;
  document.getElementById("port").value = proxy.port;
  document.getElementById("proxy-dns").checked = proxy.proxyDNS;
  document.getElementById("username").value = proxy.username;
  document.getElementById("password").value = proxy.password;
  document.getElementById("editor-title").textContent = "编辑代理";
  cancel.hidden = false;
  showMessage("");
  updateDnsVisibility();
  document.getElementById("name").focus();
}

async function removeProxy(id) {
  const proxy = state.proxies.find((item) => item.id === id);
  if (!proxy || !confirm(`删除“${proxy.name}”？`)) return;
  state.proxies = state.proxies.filter((item) => item.id !== id);
  if (state.selectedId === id) {
    state.selectedId = DIRECT_ID;
  }
  await saveState(state);
  if (state.selectedId === DIRECT_ID) await applySelectedProxy(DIRECT_ID);
  await updateBadge(state);
  if (document.getElementById("id").value === id) resetForm();
  render();
  showMessage("代理已删除。", true);
}

type.addEventListener("change", updateDnsVisibility);
cancel.addEventListener("click", resetForm);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.getElementById("id").value;
  const proxy = normalizeProxy({
    id: id || createId(), name: document.getElementById("name").value, type: type.value,
    host: document.getElementById("host").value, port: document.getElementById("port").value,
    proxyDNS: document.getElementById("proxy-dns").checked,
    username: document.getElementById("username").value, password: document.getElementById("password").value
  });
  const validationError = validateProxy(proxy);
  if (validationError) return showMessage(validationError);
  const index = state.proxies.findIndex((item) => item.id === id);
  if (index >= 0) state.proxies[index] = proxy;
  else state.proxies.push(proxy);
  await saveState(state);
  if (state.selectedId === proxy.id) await applySelectedProxy(proxy.id);
  render();
  resetForm();
  showMessage(index >= 0 ? "代理已更新。" : "代理已添加。", true);
});

getState().then((loaded) => { state = loaded; render(); updateDnsVisibility(); }).catch((cause) => showMessage(`无法读取配置：${cause.message}`));
