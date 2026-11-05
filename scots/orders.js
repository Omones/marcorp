let orders = [];
let customers = [];
let currentEditingOrderId = null;

const topCreateBtn = document.getElementById('top-create-btn');
const orderModal = document.getElementById('order-modal');
const modalCloseBtn = document.querySelector('.close-modal-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalForm = document.getElementById('modal-form');
const modalOrderTitle = document.getElementById('modal-order-title');
const modalCustomerInput = document.getElementById('modal-customer');
const modalCustomersDatalist = document.getElementById('modal-customers-datalist');
const modalTotalInput = document.getElementById('modal-total');
const modalShippingInput = document.getElementById('modal-shipping');
const modalDateInput = document.getElementById('modal-date');
const modalDeliveryDateInput = document.getElementById('modal-delivery-date');
const modalStatusSelect = document.getElementById('modal-status');
const modalItemsBody = document.getElementById('modal-items-body');
const modalCommentsTextarea = document.getElementById('modal-comments');
const modalAddSelect = document.getElementById('modal-add-select');
const modalAddItemBtn = document.getElementById('modal-add-item-btn');

const dbSourceSelect = document.getElementById('db-source-select');
const googleUrlInput = document.getElementById('google-url-input');
const syncGoogleBtn = document.getElementById('sync-google-btn');

// --- ФУНКЦИИ УВЕДОМЛЕНИЙ (TOAST) ---
function showLoadingToast(text = "Синхронизация с Google...") {
    const container = document.getElementById('toast-container');
    if (!container) return;
    container.innerHTML = ''; // Очищаем старые уведомления
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'sync-toast';
    toast.innerHTML = '<div class="spinner"></div><span>' + text + '</span>';
    container.appendChild(toast);
}

function showSuccessToast(text = "Успешно сохранено!") {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.getElementById('sync-toast') || document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = '<span class="checkmark">✓</span><span>' + text + '</span>';
    
    if (!toast.parentNode) container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function showErrorToast(text) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.getElementById('sync-toast') || document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = '<span>⚠️</span><span>' + text + '</span>';
    
    if (!toast.parentNode) container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initModalAddSelect === 'function') initModalAddSelect();

    if (sessionStorage.getItem('scots_google_url')) {
        googleUrlInput.value = sessionStorage.getItem('scots_google_url');
    }

    handleToggleUiElements(dbSourceSelect.value);
    loadDataFromSource();

    dbSourceSelect.addEventListener('change', (e) => {
        const source = e.target.value;
        handleToggleUiElements(source);
        loadDataFromSource();
    });

    googleUrlInput.addEventListener('input', (e) => {
        sessionStorage.setItem('scots_google_url', e.target.value.trim());
    });

    syncGoogleBtn.addEventListener('click', loadDataFromSource);
    topCreateBtn.addEventListener('click', () => { openOrderModal(null); });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => { if (e.target === orderModal) closeModal(); });
    modalForm.addEventListener('submit', handleSaveOrder);
    if (modalAddItemBtn) modalAddItemBtn.addEventListener('click', addItemToModalTable);
    if (modalShippingInput) modalShippingInput.addEventListener('input', recalculateModalTotal);
});

function handleToggleUiElements(source) {
    if (source === 'google') {
        googleUrlInput.style.display = 'inline-block';
        syncGoogleBtn.style.display = 'inline-block';
    } else {
        googleUrlInput.style.display = 'none';
        syncGoogleBtn.style.display = 'none';
    }
}

function loadDataFromSource() {
    const source = dbSourceSelect.value;
    if (source === 'local') {
        try {
            orders = JSON.parse(localStorage.getItem('scots_orders')) || [];
            customers = JSON.parse(localStorage.getItem('scots_customers')) || [];
        } catch (e) {
            console.error("Ошибка чтения локальной БД:", e);
            orders = [];
            customers = [];
        }
        if (typeof updateCustomersDatalist === 'function') updateCustomersDatalist();
        if (typeof renderOrdersTable === 'function') renderOrdersTable();
    } else if (source === 'google') {
        fetchGoogleSpreadsheetData();
    }
}

// --- ОТВЕТЧИКИ GOOGLE (JSONP) ---
window.handleGoogleJsonpResponse = function(resData) {
    if (resData && resData.result === 'success') {
        parseGoogleDataArray(resData.data);
        showSuccessToast("Данные загружены");
    } else {
        showErrorToast('Ошибка Apps Script: ' + (resData ? resData.message : 'Неизвестная ошибка'));
    }
    const oldScript = document.getElementById('google-jsonp-script');
    if (oldScript) oldScript.remove();
};

window.handleGoogleMutationResponse = function(resData) {
    if (resData && resData.result === 'success') {
        showSuccessToast("Данные в Google Таблице обновлены!");
        fetchGoogleSpreadsheetData();
    } else {
        showErrorToast('Ошибка изменения в Google: ' + (resData ? resData.message : 'Неизвестная ошибка'));
    }
    const oldScript = document.getElementById('google-mutation-script');
    if (oldScript) oldScript.remove();
};

function fetchGoogleSpreadsheetData() {
    const url = googleUrlInput.value.trim();
    if (!url) {
        orders = [];
        customers = [];
        if (typeof renderOrdersTable === 'function') renderOrdersTable();
        return;
    }

    showLoadingToast("Загрузка данных из Google...");

    const oldScript = document.getElementById('google-jsonp-script');
    if (oldScript) oldScript.remove();

    const separator = url.indexOf('?') !== -1 ? '&' : '?';
    const jsonpUrl = url + separator + 'callback=handleGoogleJsonpResponse&_ts=' + Date.now();

    const script = document.createElement('script');
    script.id = 'google-jsonp-script';
    script.src = jsonpUrl;
    script.onerror = function() {
        showErrorToast('Не удалось выполнить запрос к скрипту Google. Проверьте URL.');
    };
    document.body.appendChild(script);
}

// --- ОТПРАВКА ИЗМЕНЕНИЙ В GOOGLE ---
function sendGoogleMutation(actionType, index, orderData) {
    const url = googleUrlInput.value.trim();
    if (!url) { showErrorToast('Не указан URL шлюза Google!'); return; }

    showLoadingToast("Сохранение в Google...");

    const oldScript = document.getElementById('google-mutation-script');
    if (oldScript) oldScript.remove();

    const separator = url.indexOf('?') !== -1 ? '&' : '?';
    let mutationUrl = url + separator +
        'callback=handleGoogleMutationResponse' +
        '&action=' + actionType +
        '&index=' + index +
        '&_ts=' + Date.now();
        
    if (orderData) {
        mutationUrl += '&order=' + encodeURIComponent(JSON.stringify(orderData));
    }

    const script = document.createElement('script');
    script.id = 'google-mutation-script';
    script.src = mutationUrl;
    document.body.appendChild(script);
}

// --- ПАРСИНГ И ФОРМАТИРОВАНИЕ ДАТ (Универсальные) ---
function formatDateForInput(dateVal) {
    if (!dateVal) return "";
    if (dateVal instanceof Date) {
        const pad = (n) => String(n).padStart(2, '0');
        return `${dateVal.getFullYear()}-${pad(dateVal.getMonth() + 1)}-${pad(dateVal.getDate())}T${pad(dateVal.getHours())}:${pad(dateVal.getMinutes())}`;
    }
    let str = String(dateVal).replace(' ', 'T');
    if (str.length > 16) str = str.slice(0, 16);
    return str;
}

function formatDateOnly(dateVal) {
    if (!dateVal) return "";
    if (dateVal instanceof Date) {
        const pad = (n) => String(n).padStart(2, '0');
        return `${dateVal.getFullYear()}-${pad(dateVal.getMonth() + 1)}-${pad(dateVal.getDate())}`;
    }
    let str = String(dateVal).replace(' ', 'T').split('T')[0].slice(0, 10);
    return str;
}

function parseGoogleDataArray(matrix) {
    if (!matrix || matrix.length <= 1) {
        orders = [];
        customers = [];
        if (typeof renderOrdersTable === 'function') renderOrdersTable();
        return;
    }
    const newOrders = [];
    const newCustomers = new Set();

    for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        if (!row || row.length < 3) continue;

        const date = formatDateForInput(row[0]);
        const deliveryDate = formatDateOnly(row[1]);
        
        const customerName = row[2] ? String(row[2]).trim() : "";
        const total = parseFloat(row[3]) || 0;
        const shipping = parseFloat(row[4]) || 0;
        const status = row[5] ? String(row[5]).trim() : "ожидает оплаты";
        const comments = row[6] ? String(row[6]) : "";
        const itemsRaw = row[8] ? String(row[8]) : "";

        if (customerName) newCustomers.add(customerName);

        let parsedItems = [];
        if (itemsRaw) {
            try {
                parsedItems = JSON.parse(itemsRaw);
            } catch (e) {
                const textFallback = row[7] ? String(row[7]) : "Товар";
                parsedItems = [{ article: "CUSTOM", name: textFallback, price: total, cost: Math.round(total * 0.5), qty: 1 }];
            }
        }

        newOrders.push({
            date: date,
            deliveryDate: deliveryDate,
            customer: customerName,
            items: parsedItems,
            shipping: shipping,
            total: total,
            status: status,
            comments: comments
        });
    }
    orders = newOrders;
    customers = Array.from(newCustomers);
    if (typeof updateCustomersDatalist === 'function') updateCustomersDatalist();
    if (typeof renderOrdersTable === 'function') renderOrdersTable();
}

// --- РАСЧЕТ ПРИБЫЛИ ---
function calculateProfit(order) {
    if (!order || !order.items) return 0;
    const totalCostOfItems = order.items.reduce(
        (sum, item) => sum + ((parseFloat(item.cost) || 0) * (parseInt(item.qty) || 0)),
        0
    );
    const shipping = parseFloat(order.shipping) || 0;
    return (parseFloat(order.total) || 0) - (totalCostOfItems + shipping);
}
window.calculateProfit = calculateProfit;

// --- РАБОТА С МОДАЛЬНЫМ ОКНОМ ---
function openOrderModal(index) {
    currentEditingOrderId = index;
    if (index === null) {
        modalOrderTitle.textContent = 'Заказ клиента (создание)';
        modalCustomerInput.value = "";
        modalTotalInput.value = "0";
        modalShippingInput.value = "0";
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        modalDateInput.value = (new Date(now - offset)).toISOString().slice(0, 16);

        const deliveryDateObj = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000));
        modalDeliveryDateInput.value = deliveryDateObj.toISOString().slice(0, 10);
        modalStatusSelect.value = "ожидает оплаты";
        modalCommentsTextarea.value = "";
        orderModal.tempItems = [];
    } else {
        const order = orders[index];
        modalOrderTitle.textContent = 'Заказ клиента #' + (order.displayId || (index + 1));
        modalCustomerInput.value = order.customer;
        modalTotalInput.value = order.total;
        modalShippingInput.value = order.shipping;
        
        modalDateInput.value = formatDateForInput(order.date);
        modalDeliveryDateInput.value = formatDateOnly(order.deliveryDate);
        
        modalStatusSelect.value = order.status;
        modalCommentsTextarea.value = order.comments || "";
        orderModal.tempItems = JSON.parse(JSON.stringify(order.items || []));
    }
    if (typeof renderModalItemsTable === 'function') renderModalItemsTable();
    orderModal.style.display = "block";
}
window.openOrderModal = openOrderModal;

function closeModal() {
    orderModal.style.display = "none";
    currentEditingOrderId = null;
}

async function handleSaveOrder(e) {
    e.preventDefault();
    const customer = modalCustomerInput.value.trim();
    if (!customer) return;

    const orderData = {
        date: modalDateInput.value,
        deliveryDate: modalDeliveryDateInput.value,
        customer: customer,
        items: orderModal.tempItems || [],
        shipping: parseFloat(modalShippingInput.value) || 0,
        total: parseFloat(modalTotalInput.value) || 0,
        status: modalStatusSelect.value,
        comments: modalCommentsTextarea.value.trim()
    };

    const source = dbSourceSelect.value;

    if (source === 'local') {
        if (!customers.includes(customer)) {
            customers.push(customer);
            localStorage.setItem('scots_customers', JSON.stringify(customers));
            if (typeof updateCustomersDatalist === 'function') updateCustomersDatalist();
        }
        if (currentEditingOrderId === null) {
            orders.push(orderData);
        } else {
            orders[currentEditingOrderId] = orderData;
        }
        localStorage.setItem('scots_orders', JSON.stringify(orders));
        if (typeof renderOrdersTable === 'function') renderOrdersTable();
        closeModal();
        showSuccessToast("Сохранено локально");
    } else if (source === 'google') {
        const actionType = currentEditingOrderId === null ? 'create' : 'update';
        sendGoogleMutation(actionType, currentEditingOrderId, orderData);
        closeModal();
    }
}

// --- ЭКСПОРТ / ИМПОРТ ---
document.addEventListener('DOMContentLoaded', () => {
    const topExportBtn = document.getElementById('top-export-btn');
    const topImportBtn = document.getElementById('top-import-btn');
    const dbFileInput = document.getElementById('database-file-input');

    if (topExportBtn) {
        topExportBtn.addEventListener('click', () => {
            if (dbSourceSelect.value === 'google') {
                showErrorToast('Экспорт локальных файлов недоступен в режиме Google Таблицы.');
                return;
            }
            const backupData = {
                orders: JSON.parse(localStorage.getItem('scots_orders')) || [],
                customers: JSON.parse(localStorage.getItem('scots_customers')) || []
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 4));
            const downloadAnchor = document.createElement('a');
            const dateStr = new Date().toISOString().slice(0, 10);
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `scots_db_backup_${dateStr}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    if (topImportBtn && dbFileInput) {
        topImportBtn.addEventListener('click', () => {
            if (dbSourceSelect.value === 'google') {
                showErrorToast('Импорт локальных файлов недоступен в режиме Google Таблицы.');
                return;
            }
            dbFileInput.click();
        });

        dbFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    if (!parsedData || (!Array.isArray(parsedData.orders) && !Array.isArray(parsedData.customers))) {
                        throw new Error("Неверная структура JSON.");
                    }
                    if (confirm("Перезаписать локальную БД?")) {
                        if (Array.isArray(parsedData.orders)) {
                            orders = parsedData.orders;
                            localStorage.setItem('scots_orders', JSON.stringify(orders));
                        }
                        if (Array.isArray(parsedData.customers)) {
                            customers = parsedData.customers;
                            localStorage.setItem('scots_customers', JSON.stringify(customers));
                        }
                        if (typeof renderOrdersTable === 'function') renderOrdersTable();
                        if (typeof updateCustomersDatalist === 'function') updateCustomersDatalist();
                        showSuccessToast("Импорт успешно завершен!");
                    }
                } catch (err) {
                    showErrorToast("Ошибка: " + err.message);
                }
                dbFileInput.value = '';
            };
            reader.readAsText(file);
        });
    }
});
