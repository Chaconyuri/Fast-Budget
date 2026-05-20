const tokenKey = 'fastBudgetToken';
const apiUrlInput = document.getElementById('apiBase');
const statusPanel = document.getElementById('status');
const tokenCard = document.getElementById('tokenCard');
const tokenValue = document.getElementById('tokenValue');
const servicesList = document.getElementById('servicesList');
const itemsList = document.getElementById('itemsList');
const quotesList = document.getElementById('quotesList');
const quoteServiceSelect = document.getElementById('quoteServiceSelect');
const quoteServiceQty = document.getElementById('quoteServiceQty');
const quoteServicesList = document.getElementById('quoteServicesList');
const quoteItemSelect = document.getElementById('quoteItemSelect');
const quoteItemQty = document.getElementById('quoteItemQty');
const quoteItemsList = document.getElementById('quoteItemsList');

let quoteServicesArr = [];
let quoteItemsArr = [];
let quoteDataCache = [];

function apiBase() {
  const value = apiUrlInput.value.trim();
  return value.replace(/\/+$/, '');
}

function showStatus(message, type = 'success') {
  statusPanel.textContent = message;
  statusPanel.className = `status ${type}`;
}

function hideStatus() {
  statusPanel.className = 'status hidden';
}

function showSection(id) {
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === id);
  });
  hideStatus();
}

function updateTokenDisplay(token) {
  if (!token) {
    tokenCard.classList.add('hidden');
    tokenCard.querySelector('code').textContent = '';
    return;
  }

  tokenCard.classList.remove('hidden');
  tokenValue.textContent = token;
}

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
  updateTokenDisplay(token);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
  updateTokenDisplay('');
  showStatus('Sessão encerrada.', 'success');
}

async function fetchApi(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  let payload = null;
  if (contentType.includes('application/json')) {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.message || response.statusText;
    throw new Error(message || 'Erro na requisição');
  }

  return payload;
}

async function registerUser(event) {
  event.preventDefault();
  const form = event.target;
  const data = {
    email: form.email.value,
    password: form.password.value,
    full_name: form.full_name.value,
  };

  try {
    const response = await fetchApi('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    showStatus('Cadastro realizado com sucesso.', 'success');
    form.reset();
    console.log(response);
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

async function loginUser(event) {
  event.preventDefault();
  const form = event.target;
  const payload = new URLSearchParams({
    username: form.email.value,
    password: form.password.value,
  });

  try {
    const response = await fetch(`${apiBase()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.detail || response.statusText);
    }

    const data = await response.json();
    setToken(data.access_token);
    showStatus('Login efetuado com sucesso.', 'success');
    loadAllData();
    showSection('services');
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

async function createService(event) {
  event.preventDefault();
  const form = event.target;
  const data = {
    name: form.name.value,
    description: form.description.value,
    unit_price: Number(form.unit_price.value),
  };

  try {
    await fetchApi('/api/v1/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    showStatus('Serviço cadastrado com sucesso.', 'success');
    form.reset();
    loadServices();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

async function createItem(event) {
  event.preventDefault();
  const form = event.target;
  const data = {
    name: form.name.value,
    description: form.description.value,
    unit_price: Number(form.unit_price.value),
  };

  try {
    await fetchApi('/api/v1/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    showStatus('Item cadastrado com sucesso.', 'success');
    form.reset();
    loadItems();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

async function createQuote(event) {
  event.preventDefault();
  const form = event.target;

  const data = {
    client_name: form.client_name.value,
    client_email: form.client_email.value,
    notes: form.notes.value,
    services: quoteServicesArr.map((s) => ({ service_id: s.service_id, quantity: s.quantity })),
    items: quoteItemsArr.map((i) => ({ item_id: i.item_id, quantity: i.quantity })),
  };

  try {
    await fetchApi('/api/v1/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    showStatus('Orçamento criado com sucesso.', 'success');
    form.reset();
    quoteServicesArr = [];
    quoteItemsArr = [];
    renderQuoteLists();
    loadQuotes();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

function renderList(container, items, fallback) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="empty">${fallback}</p>`;
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'response-item';
    li.innerHTML = `<strong>${item.name || item.client_name || item.email || item.id}</strong>
      <small>${item.description || item.client_email || item.notes || ''}</small>
      <div>${item.unit_price ? `Preço: R$ ${item.unit_price.toFixed(2)}` : ''}</div>`;
    container.appendChild(li);
  });
}

function renderServiceList(container, items, fallback) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="empty">${fallback}</p>`;
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'response-item';
    li.innerHTML = `<strong>${item.name}</strong>
      <small>${item.description || ''}</small>
      <div>Preço: R$ ${item.unit_price?.toFixed(2) ?? '0.00'}</div>
      <button type="button" class="secondary" onclick="removeService(${item.id})">Excluir serviço</button>`;
    container.appendChild(li);
  });
}

function renderItemList(container, items, fallback) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="empty">${fallback}</p>`;
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'response-item';
    li.innerHTML = `<strong>${item.name}</strong>
      <small>${item.description || ''}</small>
      <div>Preço: R$ ${item.unit_price?.toFixed(2) ?? '0.00'}</div>
      <button type="button" class="secondary" onclick="removeItem(${item.id})">Excluir item</button>`;
    container.appendChild(li);
  });
}

async function loadServices() {
  try {
    const data = await fetchApi('/api/v1/services');
    renderServiceList(servicesList, data, 'Nenhum serviço encontrado.');
    if (quoteServiceSelect) {
      quoteServiceSelect.innerHTML = '<option value="">-- selecione um serviço --</option>';
      data.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} — R$ ${s.unit_price?.toFixed(2) ?? '0.00'}`;
        quoteServiceSelect.appendChild(opt);
      });
    }
  } catch (error) {
    servicesList.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

async function loadItems() {
  try {
    const data = await fetchApi('/api/v1/items');
    renderItemList(itemsList, data, 'Nenhum item encontrado.');
    if (quoteItemSelect) {
      quoteItemSelect.innerHTML = '<option value="">-- selecione um item --</option>';
      data.forEach((i) => {
        const opt = document.createElement('option');
        opt.value = i.id;
        opt.textContent = `${i.name} — R$ ${i.unit_price?.toFixed(2) ?? '0.00'}`;
        quoteItemSelect.appendChild(opt);
      });
    }
  } catch (error) {
    itemsList.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

function renderQuoteLists() {
  if (quoteServicesList) {
    quoteServicesList.innerHTML = '';
    if (!quoteServicesArr.length) {
      quoteServicesList.innerHTML = '<li class="empty">Nenhum serviço adicionado.</li>';
    } else {
      quoteServicesArr.forEach((s, idx) => {
        const li = document.createElement('li');
        li.className = 'response-item';
        li.innerHTML = `<strong>${s.name}</strong><div>Quantidade: ${s.quantity}</div><div style="margin-top:8px;"><button type="button" class="secondary" onclick="removeServiceFromQuote(${idx})">Remover</button></div>`;
        quoteServicesList.appendChild(li);
      });
    }
  }

  if (quoteItemsList) {
    quoteItemsList.innerHTML = '';
    if (!quoteItemsArr.length) {
      quoteItemsList.innerHTML = '<li class="empty">Nenhum item adicionado.</li>';
    } else {
      quoteItemsArr.forEach((i, idx) => {
        const li = document.createElement('li');
        li.className = 'response-item';
        li.innerHTML = `<strong>${i.name}</strong><div>Quantidade: ${i.quantity}</div><div style="margin-top:8px;"><button type="button" class="secondary" onclick="removeItemFromQuote(${idx})">Remover</button></div>`;
        quoteItemsList.appendChild(li);
      });
    }
  }
}

function addServiceToQuote() {
  const id = Number(quoteServiceSelect.value);
  const qty = Number(quoteServiceQty.value) || 1;
  if (!id) return showStatus('Selecione um serviço antes de adicionar.', 'error');
  const name = quoteServiceSelect.selectedOptions[0]?.textContent || `Serviço ${id}`;
  quoteServicesArr.push({ service_id: id, quantity: qty, name });
  renderQuoteLists();
}

function addItemToQuote() {
  const id = Number(quoteItemSelect.value);
  const qty = Number(quoteItemQty.value) || 1;
  if (!id) return showStatus('Selecione um item antes de adicionar.', 'error');
  const name = quoteItemSelect.selectedOptions[0]?.textContent || `Item ${id}`;
  quoteItemsArr.push({ item_id: id, quantity: qty, name });
  renderQuoteLists();
}

function removeServiceFromQuote(idx) {
  quoteServicesArr.splice(idx, 1);
  renderQuoteLists();
}

function removeItemFromQuote(idx) {
  quoteItemsArr.splice(idx, 1);
  renderQuoteLists();
}

async function removeService(serviceId) {
  try {
    await fetchApi(`/api/v1/services/${serviceId}`, { method: 'DELETE' });
    showStatus('Serviço excluído com sucesso.', 'success');
    loadServices();
    loadAllData();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

async function removeItem(itemId) {
  try {
    await fetchApi(`/api/v1/items/${itemId}`, { method: 'DELETE' });
    showStatus('Item excluído com sucesso.', 'success');
    loadItems();
    loadAllData();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

async function removeQuote(quoteId) {
  try {
    await fetchApi(`/api/v1/quotes/${quoteId}`, { method: 'DELETE' });
    showStatus('Orçamento excluído com sucesso.', 'success');
    loadQuotes();
  } catch (error) {
    showStatus(error.message, 'error');
  }
}

function exportQuoteToPdf(quoteId) {
  const quote = quoteDataCache.find((q) => q.id === quoteId);
  if (!quote) {
    return showStatus('Orçamento não encontrado para exportação.', 'error');
  }

  const html = `
    <html>
      <head>
        <title>Orçamento #${quote.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          h1, h2, h3 { color: #0f172a; }
          .section { margin-bottom: 24px; }
          .line-item { margin-bottom: 12px; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; }
          .line-item strong { display: block; margin-bottom: 4px; }
          .meta { margin-top: 4px; font-size: 0.95rem; color: #475569; }
          .total { margin-top: 18px; padding: 14px; border-radius: 10px; background: #e2e8f0; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>Orçamento #${quote.id}</h1>
        <div class="section">
          <h2>Dados do cliente</h2>
          <p><strong>Cliente:</strong> ${quote.client_name}</p>
          <p><strong>Email:</strong> ${quote.client_email || '-'}</p>
          <p><strong>Observações:</strong> ${quote.notes || '-'}</p>
        </div>
        <div class="section">
          <h2>Serviços</h2>
          ${quote.services?.length ? quote.services.map((service) => `
            <div class="line-item">
              <strong>${service.service_name}</strong>
              <div>Preço unitário: R$ ${service.unit_price.toFixed(2)}</div>
              <div>Quantidade: ${service.quantity}</div>
              <div>Total: R$ ${service.line_total.toFixed(2)}</div>
              <div class="meta">${service.service_description || ''}</div>
            </div>
          `).join('') : '<p>Nenhum serviço utilizado.</p>'}
        </div>
        <div class="section">
          <h2>Itens</h2>
          ${quote.items?.length ? quote.items.map((item) => `
            <div class="line-item">
              <strong>${item.item_name}</strong>
              <div>Preço unitário: R$ ${item.unit_price.toFixed(2)}</div>
              <div>Quantidade: ${item.quantity}</div>
              <div>Total: R$ ${item.line_total.toFixed(2)}</div>
              <div class="meta">${item.item_description || ''}</div>
            </div>
          `).join('') : '<p>Nenhum item utilizado.</p>'}
        </div>
        <div class="total">Total do orçamento: R$ ${quote.total_amount.toFixed(2)}</div>
      </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (!win) {
    return showStatus('Abra o bloqueador de pop-ups para gerar o PDF.', 'error');
  }

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

async function loadQuotes() {
  try {
    const data = await fetchApi('/api/v1/quotes');
    quoteDataCache = data || [];
    quotesList.innerHTML = '';
    if (!data || data.length === 0) {
      quotesList.innerHTML = '<p class="empty">Nenhum orçamento encontrado.</p>';
      return;
    }

    data.forEach((quote) => {
      const li = document.createElement('li');
      li.className = 'response-item';
      const servicesHtml = quote.services?.length
        ? `<div><strong>Serviços usados</strong>${quote.services
            .map(
              (service) => `
                <div style="margin-top:10px; padding:10px; border-radius:12px; background:#f8fafc; border:1px solid #e2e8f0;">
                  <div><strong>${service.service_name}</strong> — R$ ${service.unit_price.toFixed(2)}</div>
                  <div>Quantidade: ${service.quantity}</div>
                  <div>Total: R$ ${service.line_total.toFixed(2)}</div>
                  <div>${service.service_description || ''}</div>
                </div>`
            )
            .join('')}</div>`
        : '<div class="empty">Nenhum serviço usado.</div>';
      const itemsHtml = quote.items?.length
        ? `<div><strong>Itens usados</strong>${quote.items
            .map(
              (item) => `
                <div style="margin-top:10px; padding:10px; border-radius:12px; background:#f8fafc; border:1px solid #e2e8f0;">
                  <div><strong>${item.item_name}</strong> — R$ ${item.unit_price.toFixed(2)}</div>
                  <div>Quantidade: ${item.quantity}</div>
                  <div>Total: R$ ${item.line_total.toFixed(2)}</div>
                  <div>${item.item_description || ''}</div>
                </div>`
            )
            .join('')}</div>`
        : '<div class="empty">Nenhum item usado.</div>';
      li.innerHTML = `<strong>${quote.client_name}</strong>
        <div>Email: ${quote.client_email || '-'}</div>
        <div>Observações: ${quote.notes || '-'}</div>
        ${servicesHtml}
        ${itemsHtml}
        <div style="margin-top:14px; font-weight:700;">Total do orçamento: R$ ${quote.total_amount.toFixed(2)}</div>
        <button type="button" class="secondary" onclick="exportQuoteToPdf(${quote.id})" style="margin-top:12px; margin-right:8px;">Gerar PDF</button>
        <button type="button" class="secondary" onclick="removeQuote(${quote.id})" style="margin-top:12px;">Excluir orçamento</button>`;
      quotesList.appendChild(li);
    });
  } catch (error) {
    quotesList.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

async function loadAllData() {
  await Promise.all([loadServices(), loadItems(), loadQuotes()]);
}

window.addEventListener('load', () => {
  const savedToken = getToken();
  updateTokenDisplay(savedToken);
  hideStatus();
  if (savedToken) {
    loadAllData();
  }
});

window.showSection = showSection;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.createService = createService;
window.createItem = createItem;
window.createQuote = createQuote;
window.clearToken = clearToken;
window.addServiceToQuote = addServiceToQuote;
window.addItemToQuote = addItemToQuote;
window.removeServiceFromQuote = removeServiceFromQuote;
window.removeItemFromQuote = removeItemFromQuote;
window.removeService = removeService;
window.removeItem = removeItem;
window.removeQuote = removeQuote;
