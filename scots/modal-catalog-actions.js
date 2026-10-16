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
        let imgPath = "images/ORDList.jpg";
        if (item.article !== "CUSTOM") {
            const catalogItem = ORDEKT_CATALOG.find(c => c.id === item.article);
            if (catalogItem && catalogItem.image) imgPath = catalogItem.image;
        }
        const imgHtml = '<img src="' + imgPath + '" style="width:36px; height:36px; object-fit:cover; border-radius:4px; border:1px solid #dcdbc9; vertical-align:middle; margin-right:8px;">';
        const nameCell = item.article === "CUSTOM" 
            ? '<div style="display:flex; align-items:center;">' + imgHtml + '<input type="text" class="modal-table-input" style="text-align:left; font-weight:bold; width:calc(100% - 48px);" value="' + item.name + '" oninput="updateTempItemData(' + idx + ', \'name\', this.value)"></div>'
            : '<div style="display:flex; align-items:center;">' + imgHtml + '<span><strong>[' + item.article + ']</strong> ' + item.name + '</span></div>';
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
