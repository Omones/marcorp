const ordersTableBody = document.getElementById('orders-table-body');

document.addEventListener('DOMContentLoaded', () => {
    renderOrdersTable();
    initTableResizable();
});

function getStatusBadgeClass(status) {
    switch (status) {
        case 'ожидает оплаты': return 'badge-await';
        case 'оплачен, оформляется': return 'badge-paid';
        case 'ожидаем поставку': return 'badge-supply';
        case 'ожидает клиента': return 'badge-supply';
        case 'исполнен': return 'badge-paid';
        default: return 'badge-await';
    }
}

function updateSummaryProfit() {
    const totalProfitCounter = document.getElementById('total-profit-counter');
    if (!totalProfitCounter) return;
    const totalProfit = orders
        .filter(order => order.status === 'исполнен')
        .reduce((sum, order) => sum + calculateProfit(order), 0);
    totalProfitCounter.textContent = totalProfit + ' р.';
}

function updateInlineOrderField(index, field, value) {
    if (!orders[index]) return;
    if (field === 'total' || field === 'shipping') {
        orders[index][field] = parseFloat(value) || 0;
    } else {
        orders[index][field] = value;
    }
    if (field === 'customer' && value.trim() && !customers.includes(value.trim())) {
        customers.push(value.trim());
        localStorage.setItem('scots_customers', JSON.stringify(customers));
        if (typeof updateCustomersDatalist === 'function') updateCustomersDatalist();
    }
    localStorage.setItem('scots_orders', JSON.stringify(orders));
    
    const profit = calculateProfit(orders[index]);
    const profitTd = document.getElementById('profit-td-' + index);
    if (profitTd) {
        profitTd.textContent = profit + ' р.';
        profitTd.className = profit >= 0 ? 'profit-positive' : 'profit-negative';
    }
    updateSummaryProfit();
}
window.updateInlineOrderField = updateInlineOrderField;

function renderOrdersTable() {
    ordersTableBody.innerHTML = '';
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#808080; padding:20px;">Журнал пуст. Нажмите кнопку создания нового заказа.</td></tr>';
        updateSummaryProfit();
        return;
    }
    orders.forEach((order, index) => {
        const displayId = String(index + 1).padStart(3, '0');
        order.displayId = displayId; 
        
        let imagesHtml = '<div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                let imgPath = "images/ORDList.jpg";
                if (item.article !== "CUSTOM") {
                    const catalogItem = ORDEKT_CATALOG.find(c => c.id === item.article);
                    if (catalogItem && catalogItem.image) imgPath = catalogItem.image;
                }
                imagesHtml += '<div style="position:relative; width:34px; height:34px;">' +
                    '<img src="' + imgPath + '" style="width:100%; height:100%; object-fit:cover; border-radius:4px; border:1px solid #dcdbc9;" title="' + item.name + '">' +
                    (item.qty > 1 ? '<span style="position:absolute; bottom:-4px; right:-4px; background:#ff9900; color:#fff; font-size:10px; font-weight:bold; padding:0 4px; border-radius:8px; border:1px solid #fff; min-width:14px; text-align:center;">' + item.qty + '</span>' : '') +
                    '</div>';
            });
        } else {
            imagesHtml += '<span style="color:#a0a0a0; font-style:italic; font-size:12px;">Пусто</span>';
        }
        imagesHtml += '</div>';
        
        const profit = calculateProfit(order);
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + displayId + '</strong></td>' +
            '<td><input type="datetime-local" style="width:100%; font-size:12px; padding:2px;" value="' + order.date + '" onchange="updateInlineOrderField(' + index + ', \'date\', this.value)"></td>' +
            '<td><input type="date" style="width:100%; font-size:12px; padding:2px;" value="' + (order.deliveryDate || '') + '" onchange="updateInlineOrderField(' + index + ', \'deliveryDate\', this.value)"></td>' +
            '<td><input type="text" style="width:100%; padding:2px;" value="' + order.customer + '" onchange="updateInlineOrderField(' + index + ', \'customer\', this.value)"></td>' +
            '<td>' + imagesHtml + '</td>' +
            '<td><input type="number" style="width:100%; font-weight:bold; padding:2px; text-align:right;" value="' + order.total + '" onchange="updateInlineOrderField(' + index + ', \'total\', this.value)"></td>' +
            '<td>' +
                '<select style="width:100%; padding:2px; font-size:12px;" onchange="updateInlineOrderField(' + index + ', \'status\', this.value); this.className=\'badge \' + getStatusBadgeClass(this.value)">' +
                    '<option value="ожидает оплаты"' + (order.status === 'ожидает оплаты' ? ' selected' : '') + '>ожидает оплаты</option>' +
                    '<option value="оплачен, оформляется"' + (order.status === 'оплачен, оформляется' ? ' selected' : '') + '>оплачен, оформляется</option>' +
                    '<option value="ожидаем поставку"' + (order.status === 'ожидаем поставку' ? ' selected' : '') + '>ожидаем поставку</option>' +
                    '<option value="ожидает клиента"' + (order.status === 'ожидает клиента' ? ' selected' : '') + '>ожидает клиента</option>' +
                    '<option value="исполнен"' + (order.status === 'исполнен' ? ' selected' : '') + '>исполнен</option>' +
                '</select>' +
            '</td>' +
            '<td id="profit-td-' + index + '" class="' + profitClass + '">' + profit + ' р.</td>' +
            '<td style="white-space:nowrap; text-align:center;">' +
            '<button class="btn-icon" title="Редактировать / Открыть" onclick="openOrderModal(' + index + ')">📝</button>' +
            '<button class="btn-icon" title="Удалить заказ" onclick="deleteOrder(' + index + ')">🗑️</button>' +
            '</td>';
        const selectEl = tr.querySelector('select');
        if (selectEl) { selectEl.className = 'badge ' + getStatusBadgeClass(order.status); }
        ordersTableBody.appendChild(tr);
    });
    updateSummaryProfit();
}
window.renderOrdersTable = renderOrdersTable;

function deleteOrder(index) {
    if (confirm('Удалить выбранный документ из журнала?')) {
        orders.splice(index, 1);
        localStorage.setItem('scots_orders', JSON.stringify(orders));
        renderOrdersTable();
    }
}
window.deleteOrder = deleteOrder;

function initTableResizable() {
    const table = document.querySelector('.taxi-table');
    if (!table) return;
    const cols = table.querySelectorAll('th');
    const savedWidths = JSON.parse(localStorage.getItem('scots_table_widths')) || {};
    table.style.tableLayout = 'fixed';
    cols.forEach((col, idx) => {
        if (savedWidths[idx]) { col.style.width = savedWidths[idx] + 'px'; }
        if (idx === cols.length - 1) return;
        const resizer = document.createElement('div');
        resizer.style.position = 'absolute'; resizer.style.top = '0'; resizer.style.right = '0';
        resizer.style.width = '6px'; resizer.style.cursor = 'col-resize'; resizer.style.userSelect = 'none';
        resizer.style.height = '100%'; resizer.style.zIndex = '10';
        col.style.position = 'relative'; col.appendChild(resizer);
        let startX, startWidth;
        resizer.addEventListener('mousedown', (e) => {
            startX = e.clientX; startWidth = col.offsetWidth;
            const onMouseMove = (moveEvent) => {
                const currentWidth = startWidth + (moveEvent.clientX - startX);
                if (currentWidth > 40) { col.style.width = currentWidth + 'px'; }
            };
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                const currentWidths = {};
                table.querySelectorAll('th').forEach((th, i) => { currentWidths[i] = th.offsetWidth; });
                localStorage.setItem('scots_table_widths', JSON.stringify(currentWidths));
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}
