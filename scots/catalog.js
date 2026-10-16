const ORDEKT_CATALOG = [
    { id: "ORD1MS", name: "Ортез лучезапястный ORDEKT 3XS", price: 1200 },
    { id: "ORD1S",  name: "Ортез лучезапястный ORDEKT XXS", price: 1400 },
    { id: "ORD1M",  name: "Ортез лучезапястный ORDEKT XS",  price: 1600 },
    { id: "ORD1L",  name: "Ортез лучезапястный ORDEKT S",   price: 1800 },
    { id: "ORD2MS", name: "Ортез предплечья ORDEKT M",      price: 2100 },
    { id: "ORD2S",  name: "Ортез предплечья ORDEKT L",      price: 2300 },
    { id: "ORD2M",  name: "Ортез предплечья ORDEKT XL",     price: 2600 },
    { id: "ORD2L",  name: "Ортез предплечья ORDEKT XXL",    price: 2900 },
    { id: "ORD3S",  name: "Пластина ORDEKT Перфорированная S", price: 950 },
    { id: "ORD3M",  name: "Пластина ORDEKT Перфорированная M", price: 1350 },
    { id: "ORD3L",  name: "Пластина ORDEKT Перфорированная L", price: 1850 },
    { id: "ORD4S",  name: "Пластина ORDEKT Сплошная S",      price: 900 },
    { id: "ORD4M",  name: "Пластина ORDEKT Сплошная M",      price: 1250 },
    { id: "ORD4L",  name: "Пластина ORDEKT Сплошная L",      price: 1750 },
    { id: "ORD5XS", name: "Ортез голеностопный XS",          price: 3200 },
    { id: "ORD5S",  name: "Ортез голеностопный S",           price: 3500 },
    { id: "ORD5M",  name: "Ортез голеностопный M",           price: 3900 },
    { id: "ORD5L",  name: "Ортез голеностопный L",           price: 4300 },
    { id: "ORD5XL", name: "Ортез голеностопный XL",          price: 4800 }
];

function initModalAddSelect() {
    modalAddSelect.innerHTML = '';
    const customOpt = document.createElement('option');
    customOpt.value = "CUSTOM_ITEM";
    customOpt.textContent = "➕ Произвольный товар (ввести вручную)";
    modalAddSelect.appendChild(customOpt);
    ORDEKT_CATALOG.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = '[' + item.id + '] ' + item.name + ' (' + item.price + ' р.)';
        modalAddSelect.appendChild(option);
    });
}

function updateCustomersDatalist() {
    modalCustomersDatalist.innerHTML = '';
    customers.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        modalCustomersDatalist.appendChild(option);
    });
}

function renderModalItemsTable() {
    modalItemsBody.innerHTML = '';
    const items = orderModal.tempItems || [];
    if (items.length === 0) {
        modalItemsBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#808080; font-style:italic;">Спецификация пуста. Добавьте товары.</td></tr>';
        return;
    }
    items.forEach((item, idx) => {
        const tr = document.createElement('tr');
        const nameCell = item.article === "CUSTOM" 
            ? '<input type="text" class="modal-table-input" style="text-align:left; font-weight:bold;" value="' + item.name + '" oninput="updateTempItemData(' + idx + ', \'name\', this.value)">'
            : '<strong>[' + item.article + ']</strong> ' + item.name;
        tr.innerHTML = '<td>' + nameCell + '</td>' +
            '<td><input type="number" class="modal-table-input" value="' + item.price + '" oninput="updateTempItemData(' + idx + ', \'price\', this.value)"></td>' +
            '<td><input type="number" class="modal-table-input" value="' + item.cost + '" oninput="updateTempItemData(' + idx + ', \'cost\', this.value)"></td>' +
            '<td><input type="number" class="modal-table-input" style="width:50px;" value="' + item.qty + '" oninput="updateTempItemData(' + idx + ', \'qty\', this.value)"></td>' +
            '<td style="text-align:center;"><button type="button" class="btn-icon" onclick="removeTempItem(' + idx + ')">❌</button></td>';
        modalItemsBody.appendChild(tr);
    });
}

function updateTempItemData(idx, key, val) {
    if (orderModal.tempItems && orderModal.tempItems[idx]) {
        if (key === 'name') {
            orderModal.tempItems[idx][key] = val;
        } else {
            orderModal.tempItems[idx][key] = parseFloat(val) || 0;
        }
        recalculateModalTotal();
    }
}
window.updateTempItemData = updateTempItemData;

function removeTempItem(idx) {
    if (orderModal.tempItems) {
        orderModal.tempItems.splice(idx, 1);
        renderModalItemsTable();
        recalculateModalTotal();
    }
}
window.removeTempItem = removeTempItem;

function addItemToModalTable() {
    const selectedId = modalAddSelect.value;
    if (selectedId === "CUSTOM_ITEM") {
        orderModal.tempItems.push({
            article: "CUSTOM",
            name: "Новый произвольный товар",
            price: 0,
            cost: 0,
            qty: 1
        });
    } else {
        const catalogItem = ORDEKT_CATALOG.find(item => item.id === selectedId);
        if (!catalogItem) return;
        const autoCost = Math.round(catalogItem.price * 0.5);
        orderModal.tempItems.push({
            article: catalogItem.id,
            name: catalogItem.name,
            price: catalogItem.price,
            cost: autoCost,
            qty: 1
        });
    }
    renderModalItemsTable();
    recalculateModalTotal();
}

function recalculateModalTotal() {
    const itemsTotal = orderModal.tempItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    modalTotalInput.value = itemsTotal;
}

function calculateNetProfit(order) {
    const totalCostOfItems = order.items.reduce((sum, item) => sum + (item.cost * item.qty), 0);
    return order.total - (totalCostOfItems + (parseFloat(order.shipping) || 0));
}
