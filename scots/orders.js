let orders = JSON.parse(localStorage.getItem('scots_orders')) || [];
let customers = JSON.parse(localStorage.getItem('scots_customers')) || [];
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

document.addEventListener('DOMContentLoaded', () => {
    initModalAddSelect();
    updateCustomersDatalist();
    topCreateBtn.addEventListener('click', () => { openOrderModal(null); });
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === orderModal) closeModal(); });
    modalForm.addEventListener('submit', handleSaveOrder);
    modalAddItemBtn.addEventListener('click', addItemToModalTable);
    modalShippingInput.addEventListener('input', recalculateModalTotal);
});

function calculateProfit(order) {
    const totalCostOfItems = order.items.reduce((sum, item) => sum + (item.cost * item.qty), 0);
    const shipping = parseFloat(order.shipping) || 0;
    return parseFloat(order.total) - (totalCostOfItems + shipping);
}
window.calculateProfit = calculateProfit;

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
