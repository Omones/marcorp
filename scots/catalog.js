const ORDEKT_CATALOG = [
    { id: "190168", name: "Ортез индивидуальный лист перфорированный 200x200x2,5мм,", price: 9100 },
    { id: "ORD5MSL", name: "Ортез на стопу L,", price: 9100 },
    { id: "ORD5MSM", name: "Ортез на стопу M,", price: 9100 },
    { id: "ORD5MSS", name: "Ортез на стопу S,", price: 9100 },
    { id: "ORD5MSXS", name: "Ортез на стопу XS,", price: 9100 },
    { id: "ORD10MSL", name: "Ортез на лучезапястный сустав  с фиксацией 4-5 или 3-4-5 пальцев кисти L (серии),", price: 6500 },
    { id: "ORD10MSM", name: "Ортез на лучезапястный сустав  с фиксацией 4-5 или 3-4-5 пальцев кисти M (серии),", price: 6500 },
    { id: "ORD10MSS", name: "Ортез на лучезапястный сустав  с фиксацией 4-5 или 3-4-5 пальцев кисти S (серии),", price: 6500 },
    { id: "ORD10MSXS", name: "Ортез на лучезапястный сустав  с фиксацией 4-5 или 3-4-5 пальцев кисти XS (серии),", price: 6500 },
    { id: "ORD11MSL", name: "Ортез на лучезапястный сустав  с фиксацией 1 пальца кисти L (серии),", price: 6500 },
    { id: "ORD11MSM", name: "Ортез на лучезапястный сустав  с фиксацией 1 пальца кисти M (серии),", price: 6500 },
    { id: "ORD11MSS", name: "Ортез на лучезапястный сустав  с фиксацией 1 пальца кисти S (серии),", price: 6500 },
    { id: "ORD11MSXS", name: "Ортез на лучезапястный сустав  с фиксацией 1 пальца кисти XS (серии),", price: 6500 },
    { id: "ORD12MSL", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти L (тип 1) (серии),", price: 6500 },
    { id: "ORD12MSM", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти M (тип 1) (серии),", price: 6500 },
    { id: "ORD12MSS", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти S (тип 1) (серии),", price: 6500 },
    { id: "ORD12MSXS", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти XS (тип 1) (серии),", price: 6500 },
    { id: "ORD15MSL", name: "Ортез на лучезапястный сустав удлиненный ЭКСТРА  (тутор при ДЦП 50) L (серии),", price: 6500 },
    { id: "ORD15MSM", name: "Ортез на лучезапястный сустав удлиненный ЭКСТРА  (тутор при ДЦП 45) М (серии),", price: 6500 },
    { id: "ORD15MSS", name: "Ортез на лучезапястный сустав удлиненный ЭКСТРА  (тутор при ДЦП 42) S (серии),", price: 6500 },
    { id: "ORD15MSXS", name: "Ортез на лучезапястный сустав удлиненный ЭКСТРА  (тутор при ДЦП 40) XS (серии),", price: 6500 },
    { id: "ORD18MSL", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти L (тип 2) (серии),", price: 6500 },
    { id: "ORD18MSLXS", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти XS (тип 2) (серии),", price: 6500 },
    { id: "ORD18MSM", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти M (тип 2) (серии),", price: 6500 },
    { id: "ORD18MSS", name: "Ортез на лучезапястный сустав  с фиксацией 2 или 2-3 пальцев кисти S (тип 2) (серии),", price: 6500 },
    { id: "ORD1LSL", name: "Ортез на лучезапястный сустав. Лонгета L (серии),", price: 6500 },
    { id: "ORD1LSM", name: "Ортез на лучезапястный сустав. Лонгета M (серии),", price: 6500 },
    { id: "ORD1LSS", name: "Ортез на лучезапястный сустав. Лонгета S (серии),", price: 6500 },
    { id: "ORD1LSXS", name: "Ортез на лучезапястный сустав. Лонгета XS (серии),", price: 6500 },
    { id: "ORD1MBM", name: "Ортез на лучезапястный сустав M Синий (серии),", price: 6500 },
    { id: "ORD1MBS", name: "Ортез на лучезапястный сустав S  Синий (серии),", price: 6500 },
    { id: "ORD1MBXS", name: "Ортез на лучезапястный сустав XS Голубой (серии),", price: 6500 },
    { id: "ORD1MBXS", name: "Ортез на лучезапястный сустав XS Синий (серии),", price: 6500 },
    { id: "ORD1MBXXS", name: "Ортез на лучезапястный сустав XXS Голубой (серии),", price: 6500 },
    { id: "ORD1MGL", name: "Ортез на лучезапястный сустав L Зеленый (серии),", price: 6500 },
    { id: "ORD1MGXS", name: "Ортез на лучезапястный сустав XS Зеленый (серии),", price: 6500 },
    { id: "ORD1MGXXS", name: "Ортез на лучезапястный сустав XXS Зеленый (серии),", price: 6500 },
    { id: "ORD1MRL", name: "Ортез на лучезапястный сустав L Красный (серии),", price: 6500 },
    { id: "ORD1MRXS", name: "Ортез на лучезапястный сустав XS Красный (серии),", price: 6500 },
    { id: "ORD1MSL", name: "Ортез на лучезапястный сустав L ,", price: 6500 },
    { id: "ORD1MSM", name: "Ортез на лучезапястный сустав M ,", price: 6500 },
    { id: "ORD1MSS", name: "Ортез на лучезапястный сустав S  ,", price: 6500 },
    { id: "ORD1MSXS", name: "Ортез на лучезапястный сустав XS ,", price: 6500 },
    { id: "ORD1MSXXS", name: "Ортез на лучезапястный сустав XXS ,", price: 6500 },
    { id: "ORD1MSXXXS", name: "Ортез на лучезапястный сустав XXXS (серии),", price: 6500 },
    { id: "ORD1MVXS", name: "Ортез на лучезапястный сустав XS Фиолетовый (серии),", price: 6500 },
    { id: "ORD1MVXXS", name: "Ортез на лучезапястный сустав XXS Фиолетовый (серии),", price: 6500 },
    { id: "ORD1MYL", name: "Ортез на лучезапястный сустав L Жёлтый (серии),", price: 6500 },
    { id: "ORD1MYM", name: "Ортез на лучезапястный сустав M Жёлтый (серии),", price: 6500 },
    { id: "ORD1MYS", name: "Ортез на лучезапястный сустав S  Жёлтый (серии),", price: 6500 },
    { id: "ORD1MYXS", name: "Ортез на лучезапястный сустав XS Жёлтый (серии),", price: 6500 },
    { id: "ORD2LSL", name: "Ортез на голеностопный сустав. Лонгета L (серии),", price: 10500 },
    { id: "ORD2LSM", name: "Ортез на голеностопный сустав. Лонгета M (серии),", price: 10500 },
    { id: "ORD2LSS", name: "Ортез на голеностопный сустав. Лонгета S (серии),", price: 10500 },
    { id: "ORD2LSXS", name: "Ортез на голеностопный сустав. Лонгета XS (серии),", price: 10500 },
    { id: "ORD2MSL", name: "Ортез на голеностопный сустав L,", price: 10500 },
    { id: "ORD2MSM", name: "Ортез на голеностопный сустав M,", price: 10500 },
    { id: "ORD2MSS", name: "Ортез на голеностопный сустав S ,", price: 10500 },
    { id: "ORD2MSXS", name: "Ортез на голеностопный сустав XS,", price: 10500 },
    { id: "ORD2MSXXS", name: "Ортез на голеностопный сустав XXS (серии),", price: 10500 },
    { id: "ORD2MSXXXS", name: "Ортез на голеностопный сустав XXXS (серии),", price: 10500 },
    { id: "ORD3MSL", name: "Ортез на локтевой сустав L,", price: 7900 },
    { id: "ORD3MSM", name: "Ортез на локтевой сустав M,", price: 7900 },
    { id: "ORD3MSS", name: "Ортез на локтевой сустав S ,", price: 7900 },
    { id: "ORD3MSXS", name: "Ортез на локтевой сустав XS,", price: 7900 },
    { id: "ORD4MSL", name: "Ортез на лучезапястный сустав удлиненный с отверстием для первого пальца L (серии),", price: 6500 },
    { id: "ORD4MSM", name: "Ортез на лучезапястный сустав удлиненный с отверстием для первого пальца M (серии),", price: 6500 },
    { id: "ORD4MSS", name: "Ортез на лучезапястный сустав удлиненный с отверстием для первого пальца S (серии),", price: 6500 },
    { id: "ORD4MSXS", name: "Ортез на лучезапястный сустав удлиненный с отверстием для первого пальца XS (серии),", price: 6500 },
    { id: "ORD6OL", name: "Ортез на палец кисти с открытой ногтевой фалангой L (серии),", price: 1500 },
    { id: "ORD6OM", name: "Ортез на палец кисти с открытой ногтевой фалангой M (серии),", price: 1500 },
    { id: "ORD6OS", name: "Ортез на палец кисти с открытой ногтевой фалангой S (серии),", price: 1500 },
    { id: "ORD6OXL", name: "Ортез на палец кисти с открытой ногтевой фалангой XL (серии),", price: 1500 },
    { id: "ORD6OXXL", name: "Ортез на палец кисти с открытой ногтевой фалангой XXL (серии),", price: 1500 },
    { id: "ORD6ZL", name: "Ортез на палец кисти с закрытой ногтевой фалангой L (серии),", price: 1500 },
    { id: "ORD6ZM", name: "Ортез на палец кисти с закрытой ногтевой фалангой M (серии),", price: 1500 },
    { id: "ORD6ZS", name: "Ортез на палец кисти с закрытой ногтевой фалангой S (серии),", price: 1500 },
    { id: "ORD6ZXL", name: "Ортез на палец кисти с закрытой ногтевой фалангой XL (серии),", price: 1500 },
    { id: "ORD6ZXXL", name: "Ортез на палец кисти с закрытой ногтевой фалангой XXL (серии),", price: 1500 },
    { id: "ORD7MSL", name: "Ортез на лучезапястный сустав удлиненный без отверстия для первого пальца L (серии),", price: 6500 },
    { id: "ORD7MSM", name: "Ортез на лучезапястный сустав удлиненный без отверстия для первого пальца M (серии),", price: 6500 },
    { id: "ORD7MSS", name: "Ортез на лучезапястный сустав удлиненный без отверстия для первого пальца S (серии),", price: 6500 },
    { id: "ORD7MSXS", name: "Ортез на лучезапястный сустав удлиненный без отверстия для первого пальца XS (серии),", price: 6500 },
    { id: "ORD7MSXXS", name: "Ортез на лучезапястный сустав удлиненный без отверстия для первого пальца XXS (серии),", price: 6500 },
    { id: "ORD8MSL", name: "Ортез на коленный сустав L,", price: 10900 },
    { id: "ORD8MSM", name: "Ортез на коленный сустав M,", price: 10900 },
    { id: "ORD8MSS", name: "Ортез на коленный сустав S,", price: 10900 },
    { id: "ORD9MSL", name: "Ортез индивидуальный по антропометрическим показателям на голень-бедро L (серии),", price: 17500 },
    { id: "ORD9MSM", name: "Ортез индивидуальный по антропометрическим показателям на голень-бедро M (серии),", price: 17500 },
    { id: "ORD9MSS", name: "Ортез индивидуальный по антропометрическим показателям на голень-бедро S (серии),", price: 17500 },
    { id: "ORD9MSXS", name: "Ортез индивидуальный по антропометрическим показателям на голень-бедро XS (серии),", price: 17500 },
    { id: "ORD9MSXXS", name: "Ортез индивидуальный по антропометрическим показателям на голень-бедро XXS (серии),", price: 17500 },
    { id: "ORDList200x200х2,5", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 200x200x2,5мм (серии),", price: 3500 },
    { id: "ORDList200х200х1,5", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 200x200x1,5мм (серии),", price: 3500 },
    { id: "ORDList400х400х3", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 400x400x3мм (серии),", price: 5500 },
    { id: "ORDList40х40", name: "Ортез индивидуальный лист перфорированный 400x400x3мм,", price: 5500 },
    { id: "ORDList500x500х1,5", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 500x500x1,5мм (серии),", price: 5500 },
    { id: "ORDList600x490х2,5", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 600x490x2,5 мм (серии),", price: 9900 },
    { id: "ORDList600х490х3", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 600x490x3мм (серии),", price: 9900 },
    { id: "ORDList900x580х4", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 900x580х4мм (серии),", price: 25500 },
    { id: "ORDList900х580х3", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 900x580х3мм (серии),", price: 19500 },
    { id: "ORDList970x600х3", name: "Ортез индивидуальный  по антропометрическим показателям. Лист перфорированный 970х600х3мм (серии),", price: 21500 },
    { id: "", name: "Хук широкий (самоклеящаяся основа, крючки) 50мм*25м + Луп (петля) широкий 50мм*25м  ", price: 9000 },

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
