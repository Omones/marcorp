let orders = [];
let customers = [];
let currentEditingOrderId = null;

const GOOGLE_SPREADSHEET_CSV_URL = "https://google.com";

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
const syncGoogleBtn = document.getElementById('sync-google-btn');

document.addEventListener('DOMContentLoaded', () => {
    initModalAddSelect();
    loadDataFromSource();

    dbSourceSelect.addEventListener('change', (e) => {
        const source = e.target.value;
        if (source === 'google') {
            syncGoogleBtn.style.display = 'inline-block';
            topCreateBtn.disabled = true;
            topCreateBtn.style.opacity = '0.5';
        } else {
            syncGoogleBtn.style.display = 'none';
            topCreateBtn.disabled = false;
            topCreateBtn.style.opacity = '1';
        }
        loadDataFromSource();
    });

    syncGoogleBtn.addEventListener('click', loadDataFromSource);

    topCreateBtn.addEventListener('click', () => { 
        if (dbSourceSelect.value === 'google') {
            alert('Прямое создание записей в режиме Google Таблицы недоступно.');
            return;
        }
        openOrderModal(null); 
    });
    
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === orderModal) closeModal(); });
    modalForm.addEventListener('submit', handleSaveOrder);
    modalAddItemBtn.addEventListener('click', addItemToModalTable);
    modalShippingInput.addEventListener('input', recalculateModalTotal);
});
function loadDataFromSource() {
    const source = dbSourceSelect.value;
    if (source === 'local') {
        orders = JSON.parse(localStorage.getItem('scots_orders')) || [];
        customers = JSON.parse(localStorage.getItem('scots_customers')) || [];
        if (typeof updateCustomersDatalist === 'function') updateCustomersDatalist();
        if (typeof renderOrdersTable === 'function') renderOrdersTable();
    } else if (source === 'google') {
        fetchGoogleSpreadsheetData();
    }
}

async function fetchGoogleSpreadsheetData() {
    try {
        const response = await fetch(GOOGLE_SPREADSHEET_CSV_URL);
        if (!response.ok) throw new Error('Ошибка сети при запросе к Google Таблице');
        const csvText = await response.text();
        parseGoogleCsv(csvText);
    } catch (error) {
        alert('Не удалось загрузить данные из Google Таблицы: ' + error.message);
        dbSourceSelect.value = 'local';
        syncGoogleBtn.style.display = 'none';
        topCreateBtn.disabled = false;
        topCreateBtn.style.opacity = '1';
        loadDataFromSource();
    }
}

function parseGoogleCsv(text) {
    const lines = text.split(/\r?\n/);
    if (lines.length <= 1) {
        orders = [];
        customers = [];
        if (typeof renderOrdersTable === 'function') renderOrdersTable();
        return;
    }

    const newOrders = [];
    const newCustomers = new Set();

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const row = parseCsvLine(lines[i]);
        if (row.length < 4) continue;

        const date = row[0] || "";
        const deliveryDate = row[1] || "";
        const customerName = row[2] ? row[2].trim() : "";
        const total = parseFloat(row[4]) || 0;
        const shipping = parseFloat(row[5]) || 0;
        const status = row[6] || "ожидает оплаты";
        const comments = row[7] || "";
        const itemsRaw = row[3] || "";

        if (customerName) newCustomers.add(customerName);

        let parsedItems = [];
        if (itemsRaw) {
            try {
                parsedItems = JSON.parse(itemsRaw.replace(/""/g, '"'));
            } catch (e) {
                parsedItems = [{ article: "CUSTOM", name: itemsRaw, price: total, cost: Math.round(total * 0.5), qty: 1 }];
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

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
function calculateProfit(order) {
    const totalCostOfItems = order.items.reduce((sum, item) => sum + (item.cost * item.qty), 0);
    const shipping = parseFloat(order.shipping) || 0;
    return parseFloat(order.total) - (totalCostOfItems + shipping);
}
window.calculateProfit = calculateProfit;

function openOrderModal(index) {
    if (dbSourceSelect.value === 'google') {
        alert('Редактирование записей в режиме Google Таблицы недоступно.');
        return;
    }
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
        modalDeliveryDateInput.value = deliveryDateObj.toISOString().split('T')[0];
        modalStatusSelect.value = "ожидает оплаты";
        modalCommentsTextarea.value = "";
        orderModal.tempItems = [];
    } else {
        const order = orders[index];
        modalOrderTitle.textContent = 'Заказ клиента #' + order.displayId;
        modalCustomerInput.value = order.customer;
        modalTotalInput.value = order.total;
        modalShippingInput.value = order.shipping;
        modalDateInput.value = order.date;
        modalDeliveryDateInput.value = order.deliveryDate || "";
        modalStatusSelect.value = order.status;
        modalCommentsTextarea.value = order.comments || "";
        orderModal.tempItems = JSON.parse(JSON.stringify(order.items));
    }
    renderModalItemsTable();
    orderModal.style.display = "block";
}
window.openOrderModal = openOrderModal;

function closeModal() { orderModal.style.display = "none"; currentEditingOrderId = null; }

function handleSaveOrder(e) {
    e.preventDefault();
    if (dbSourceSelect.value === 'google') return;
    
    const customer = modalCustomerInput.value.trim();
    if (!customer) return;
    if (!customers.includes(customer)) {
        customers.push(customer);
        localStorage.setItem('scots_customers', JSON.stringify(customers));
        updateCustomersDatalist();
    }
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
    if (currentEditingOrderId === null) {
        orders.push(orderData);
    } else {
        orders[currentEditingOrderId] = orderData;
    }
    localStorage.setItem('scots_orders', JSON.stringify(orders));
    if (typeof renderOrdersTable === 'function') renderOrdersTable();
    closeModal();
}

document.addEventListener('DOMContentLoaded', () => {
    const topExportBtn = document.getElementById('top-export-btn');
    const topImportBtn = document.getElementById('top-import-btn');
    const dbFileInput = document.getElementById('database-file-input');

    if (topExportBtn) {
        topExportBtn.addEventListener('click', () => {
            if (dbSourceSelect.value === 'google') {
                alert('Экспорт заблокирован при работе с Google Таблицей.');
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
                alert('Импорт заблокирован при работе с Google Таблицей.');
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
                        throw new Error("Неверная структура JSON-файла.");
                    }
                    if (confirm("Вы уверены, что хотите затереть текущую базу данных?")) {
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
                        alert("База данных успешно импортирована!");
                    }
                } catch (err) {
                    alert("Ошибка при чтении файла: " + err.message);
                }
                dbFileInput.value = '';
            };
            reader.readAsText(file);
        });
    }
});
