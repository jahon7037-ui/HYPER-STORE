// main.js — обновлённый и рабочий код для страницы "Собери свой ПК"

/* =========================
   Данные комплектующих
   ========================= */
const parts = {
  cpu: [
    { name: "Intel i5-12400F", socket: "LGA1700", ram: "DDR4", price: 1100000 },
    { name: "Intel i7-13700K", socket: "LGA1700", ram: "DDR5", price: 3900000 },
    { name: "Ryzen 5 5600", socket: "AM4", ram: "DDR4", price: 950000 },
    { name: "Ryzen 7 7800X3D", socket: "AM5", ram: "DDR5", price: 3200000 }
  ],
  mb: [
    { name: "MSI B660M", socket: "LGA1700", ram: "DDR4", price: 900000 },
    { name: "ASUS Z690 DDR5", socket: "LGA1700", ram: "DDR5", price: 1600000 },
    { name: "Gigabyte B450", socket: "AM4", ram: "DDR4", price: 500000 },
    { name: "ASUS X670E", socket: "AM5", ram: "DDR5", price: 2700000 }
  ],
  ram: [
    { name: "16GB DDR4 3200MHz", type: "DDR4", price: 300000 },
    { name: "32GB DDR4 3600MHz", type: "DDR4", price: 600000 },
    { name: "16GB DDR5 5200MHz", type: "DDR5", price: 450000 },
    { name: "32GB DDR5 6000MHz", type: "DDR5", price: 900000 }
  ],
  gpu: [
    { name: "RTX 4060", power: 450, price: 3000000 },
    { name: "RTX 4070", power: 550, price: 5500000 },
    { name: "RX 6600", power: 400, price: 1700000 }
  ],
  psu: [
    { name: "500W Cougar", watt: 500, price: 300000 },
    { name: "650W Deepcool", watt: 650, price: 450000 },
    { name: "750W Corsair", watt: 750, price: 650000 },
    { name: "850W Seasonic Gold", watt: 850, price: 900000 }
  ]
};

/* =========================
   DOM элементы (по id из твоего HTML)
   ========================= */
const cpuSelect = document.getElementById("cpuSelect");
const mbSelect = document.getElementById("mbSelect");
const ramSelect = document.getElementById("ramSelect");
const gpuSelect = document.getElementById("gpuSelect");
const psuSelect = document.getElementById("psuSelect");
const totalPriceEl = document.getElementById("totalPrice");
const addBtn = document.getElementById("addToCartBtn");
const buildResult = document.getElementById("buildResult");

/* Безопасность: если чего-то нет — прерываем и пишем в консоль */
if (!cpuSelect || !mbSelect || !ramSelect || !gpuSelect || !psuSelect || !totalPriceEl || !addBtn || !buildResult) {
  console.error("Один или несколько DOM-элементов не найдены. Проверь id в HTML.");
  throw new Error("DOM elements missing");
}

/* =========================
   Вспомогательные функции
   ========================= */

// Заполнение select с учетом дополнительных меток
function populateSelect(selectEl, items, labelFn = null) {
  selectEl.innerHTML = ""; // очистить
  if (!items || items.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Нет доступных вариантов";
    opt.dataset.price = "0";
    selectEl.appendChild(opt);
    selectEl.disabled = true;
    return;
  }

  selectEl.disabled = false;
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.name;
    opt.dataset.price = String(item.price ?? 0);
    // дополнительные данные (socket, ram, watt, power)
    if (item.socket) opt.dataset.socket = item.socket;
    if (item.ram) opt.dataset.ram = item.ram;
    if (item.watt) opt.dataset.watt = String(item.watt);
    if (item.power) opt.dataset.power = String(item.power);

    opt.textContent = labelFn ? labelFn(item) : `${item.name} — ${item.price}so'm`;
    selectEl.appendChild(opt);
  });
}

// Подсчёт цены по выбранным опциям
function calculateTotal() {
  let sum = 0;
  [cpuSelect, mbSelect, ramSelect, gpuSelect, psuSelect].forEach(sel => {
    if (!sel || !sel.value) return;
    const chosenOption = sel.querySelector(`option[value="${cssEscape(sel.value)}"]`);
    if (chosenOption) {
      const p = parseInt(chosenOption.dataset.price || "0", 10);
      if (!Number.isNaN(p)) sum += p;
    }
  });
  totalPriceEl.textContent = sum.toLocaleString("ru-RU");
  return sum;
}

// Безопасное экранирование для querySelector поиска option[value="..."]
function cssEscape(str) {
  return str.replace(/(["\\\[\]\{\}\:\#\.\,\+\*\?\^\$\|\(\)])/g, "\\$1");
}

/* =========================
   Логика фильтраций
   ========================= */

function updateMBOptions() {
  const cpuName = cpuSelect.value;
  const cpu = parts.cpu.find(c => c.name === cpuName) || parts.cpu[0];
  // отфильтруем материнские платы по сокету
  const filteredMB = parts.mb.filter(m => m.socket === cpu.socket);
  populateSelect(mbSelect, filteredMB, item => `${item.name} (${item.ram}) — ${item.price}so'm`);
  // установим первый доступный вариант (если есть)
  if (mbSelect.options.length > 0) mbSelect.selectedIndex = 0;
}

function updateRAMOptions() {
  const mbName = mbSelect.value;
  const mb = parts.mb.find(m => m.name === mbName);
  const ramType = mb ? mb.ram : null;
  const filteredRAM = ramType ? parts.ram.filter(r => r.type === ramType) : [];
  populateSelect(ramSelect, filteredRAM, item => `${item.name} — ${item.price}so'm`);
  if (ramSelect.options.length > 0) ramSelect.selectedIndex = 0;
}

function updatePSUOptions() {
  const gpuName = gpuSelect.value;
  const gpu = parts.gpu.find(g => g.name === gpuName) || parts.gpu[0];
  // требуемая мощность = мощность видеокарты + запас 100W
  const required = (gpu.power || 0) + 100;
  const filteredPSU = parts.psu.filter(p => p.watt >= required);
  populateSelect(psuSelect, filteredPSU, item => `${item.name} (${item.watt}W) — ${item.price}so'm`);
  if (psuSelect.options.length > 0) psuSelect.selectedIndex = 0;
}

/* =========================
   Инициализация (заполнение первых списков)
   ========================= */

function init() {
  // Заполнить CPU и GPU первично
  populateSelect(cpuSelect, parts.cpu, item => `${item.name} (${item.socket}, ${item.ram}) — ${item.price}so'm`);
  populateSelect(gpuSelect, parts.gpu, item => `${item.name} (${item.power}W) — ${item.price}so'm`);

  // Если ничего не выбрано — выбрать первый
  if (cpuSelect.options.length > 0) cpuSelect.selectedIndex = 0;
  if (gpuSelect.options.length > 0) gpuSelect.selectedIndex = 0;

  // Обновить зависимые списки
  updateMBOptions();
  updateRAMOptions();
  updatePSUOptions();

  // Установим слушатели после первой загрузки
  attachListeners();

  // Рассчитать цену начальную
  calculateTotal();
}

/* =========================
   Слушатели событий
   ========================= */

function attachListeners() {
  cpuSelect.addEventListener("change", () => {
    updateMBOptions();
    updateRAMOptions();
    calculateTotal();
  });

  mbSelect.addEventListener("change", () => {
    updateRAMOptions();
    calculateTotal();
  });

  ramSelect.addEventListener("change", calculateTotal);

  gpuSelect.addEventListener("change", () => {
    updatePSUOptions();
    calculateTotal();
  });

  psuSelect.addEventListener("change", calculateTotal);

  // кнопка "Добавить в заказ"
  addBtn.addEventListener("click", handleAddToOrder);
}

/* =========================
   Обработка нажатия кнопки
   ========================= */

let toastTimeout = null;

function handleAddToOrder() {
  // Собираем выбранные значения (безопасно)
  const cpu = cpuSelect.value || "—";
  const mb = mbSelect.value || "—";
  const ram = ramSelect.value || "—";
  const gpu = gpuSelect.value || "—";
  const psu = psuSelect.value || "—";
  const price = totalPriceEl.textContent || "0";

  // Показать сборку в блоке buildResult
  buildResult.innerHTML = `
    <p>Сборка добавлена:</p>
    <ul>
      <li><strong>CPU:</strong> ${escapeHtml(cpu)}</li>
      <li><strong>Материнская плата:</strong> ${escapeHtml(mb)}</li>
      <li><strong>RAM:</strong> ${escapeHtml(ram)}</li>
      <li><strong>GPU:</strong> ${escapeHtml(gpu)}</li>
      <li><strong>БП:</strong> ${escapeHtml(psu)}</li>
      <li><strong>Цена:</strong> ${escapeHtml(price)} ₽</li>
    </ul>
  `;

  // Показать уведомление "Ваш заказ отправлен менеджеру!"
  showOrderToast("Ваш заказ отправлен менеджеру!");
}

/* Простая защитная функция для вывода текста в HTML */
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   Toast-уведомление
   ========================= */

function createOrGetToastEl() {
  let el = document.getElementById("orderMessage");
  if (el) return el;

  // Создаём и вставляем после блока buildResult (чтобы было "снизу" на странице)
  el = document.createElement("div");
  el.id = "orderMessage";
  // если у тебя в CSS есть стили для #orderMessage, они применятся.
  // Если нет — добавим минимальные inline стили на всякий случай.
  el.style.position = "relative";
  el.style.marginTop = "18px";
  el.style.padding = "14px";
  el.style.borderRadius = "8px";
  el.style.background = "#1f1f1f";
  el.style.borderLeft = "4px solid #ff003c";
  el.style.color = "#fff";
  el.style.opacity = "0";
  el.style.transform = "translateY(8px)";
  el.style.transition = "all 0.35s ease";

  // Вставляем сразу после buildResult
  buildResult.insertAdjacentElement("afterend", el);
  return el;
}

function showOrderToast(text, duration = 5000) {
  const el = createOrGetToastEl();
  el.textContent = text;

  // показать
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });

  // сброс таймера при повторных кликах
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  toastTimeout = setTimeout(() => {
    // скрыть
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    toastTimeout = null;
  }, duration);
}

/* =========================
   Запуск и инициализация
   ========================= */
init();


totalPrice.textContent = price + " so'm";

result.innerHTML = `
    <p><b>Сборка добавлена:</b></p>
    <ul>
        <li>CPU: ${cpu}</li>
        <li>Материнская плата: ${mb}</li>
        <li>RAM: ${ram}</li>
        <li>GPU: ${gpu}</li>
        <li>БП: ${psu}</li>
        <li>Цена: ${price} so'm</li>
    </ul>
`;
