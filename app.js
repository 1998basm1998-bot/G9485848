let customers = JSON.parse(localStorage.getItem('system_customers')) || [];
let quotes = JSON.parse(localStorage.getItem('system_quotes')) || [];
let invoices = JSON.parse(localStorage.getItem('system_invoices')) || [];
let projects = JSON.parse(localStorage.getItem('system_projects')) || []; 

window.onload = function() {
    renderCustomers();
    renderQuotes();
    renderInvoices();
    renderProjects(); 
    updateCustomerDropdowns();
    
    document.getElementById('quoteDate').valueAsDate = new Date();
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    addItemRow('quoteItemsBody', 'quote');
    addItemRow('invoiceItemsBody', 'invoice');
}

// دالة التنقل (مرتبطة بالقائمة السفلية الجديدة)
function openScreen(screenId, buttonElement) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
}

// ================= إدارة العملاء =================
document.getElementById('customerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let name = document.getElementById('custName').value;
    customers.push({ id: Date.now(), name: name, phone: document.getElementById('custPhone').value, address: document.getElementById('custAddress').value });
    localStorage.setItem('system_customers', JSON.stringify(customers));
    alert(`تم حفظ ${name} بنجاح!`);
    this.reset(); renderCustomers(); updateCustomerDropdowns();
});

function renderCustomers() {
    let tbody = document.getElementById('customersTableBody'); tbody.innerHTML = '';
    customers.forEach((c, i) => {
        tbody.innerHTML += `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.address}</td><td><button class="btn-delete" onclick="deleteItem('system_customers', customers, ${i}, renderCustomers)">حذف</button></td></tr>`;
    });
}
function updateCustomerDropdowns() {
    let options = '<option value="">-- اختر العميل --</option>';
    customers.forEach(c => options += `<option value="${c.name}">${c.name}</option>`);
    document.getElementById('quoteCustomer').innerHTML = options;
    document.getElementById('invoiceCustomer').innerHTML = options;
}

function deleteItem(storageKey, array, index, renderFunc) {
    if(confirm("هل أنت متأكد من الحذف؟")) { array.splice(index, 1); localStorage.setItem(storageKey, JSON.stringify(array)); renderFunc(); }
}

// ================= الجداول =================
function addItemRow(tbodyId, type) {
    let tbody = document.getElementById(tbodyId); let rowId = Date.now();
    tbody.insertAdjacentHTML('beforeend', `<tr id="row-${rowId}">
        <td><input type="text" class="item-name" required></td>
        <td><input type="number" class="item-price" value="0" min="0" oninput="calculateTotal('${type}')" required></td>
        <td><input type="number" class="item-qty" value="1" min="1" oninput="calculateTotal('${type}')" required></td>
        <td class="item-row-total" style="color:white;">0</td>
        <td><button type="button" class="btn-delete" onclick="document.getElementById('row-${rowId}').remove(); calculateTotal('${type}')">X</button></td>
    </tr>`);
}
function calculateTotal(type) {
    let grandTotal = 0;
    document.getElementById(`${type}ItemsBody`).querySelectorAll('tr').forEach(row => {
        let total = (parseFloat(row.querySelector('.item-price').value) || 0) * (parseFloat(row.querySelector('.item-qty').value) || 0);
        row.querySelector('.item-row-total').innerText = total; grandTotal += total;
    });
    let discount = parseFloat(document.getElementById(`${type}Discount`).value) || 0;
    document.getElementById(`${type}GrandTotal`).innerText = Math.max(0, grandTotal - discount);
}

// ================= الفواتير =================
document.getElementById('invoiceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let items = Array.from(document.getElementById('invoiceItemsBody').querySelectorAll('tr')).map(row => ({
        name: row.querySelector('.item-name').value, price: row.querySelector('.item-price').value, qty: row.querySelector('.item-qty').value, total: row.querySelector('.item-row-total').innerText
    }));
    
    let inv = {
        id: "INV-" + Math.floor(Math.random() * 10000), customer: document.getElementById('invoiceCustomer').value, date: document.getElementById('invoiceDate').value,
        items: items, discount: document.getElementById('invoiceDiscount').value, total: document.getElementById('invoiceGrandTotal').innerText
    };
    invoices.push(inv); localStorage.setItem('system_invoices', JSON.stringify(invoices));
    alert("تم إصدار الفاتورة!"); this.reset(); renderInvoices();
});

function renderInvoices() {
    let tbody = document.getElementById('invoicesListBody'); tbody.innerHTML = '';
    invoices.forEach((inv, i) => {
        tbody.innerHTML += `<tr><td>${inv.id}</td><td>${inv.customer}</td><td>${inv.date}</td><td>${inv.total}</td>
            <td><button class="btn-print" onclick="printCustomInvoice(${i})">🖨️ طباعة</button> <button class="btn-delete" onclick="deleteItem('system_invoices', invoices, ${i}, renderInvoices)">حذف</button></td></tr>`;
    });
}

// الطباعة
function printCustomInvoice(index) {
    let inv = invoices[index];
    let itemsHtml = inv.items.map(item => `<tr><td>${item.name}</td><td>${item.price}</td><td>${item.qty}</td><td>${item.total}</td></tr>`).join('');
    
    document.getElementById('printArea').innerHTML = `
        <div class="watermark-bg">نظام الإدارة</div>
        <div class="print-header"><h1>فاتورة مبيعات</h1><p>شكراً لتعاملكم معنا</p></div>
        <div class="print-details"><div><strong>رقم الفاتورة:</strong> ${inv.id}</div><div><strong>التاريخ:</strong> ${inv.date}</div><div><strong>السيد/ة:</strong> ${inv.customer}</div></div>
        <table class="print-table"><thead><tr><th>المنتج</th><th>السعر الإفرادي</th><th>الكمية</th><th>المجموع</th></tr></thead><tbody>${itemsHtml}</tbody></table>
        <div class="print-total"><p>الخصم: ${inv.discount}</p><p>الصافي النهائي: ${inv.total}</p></div>
    `;
    window.print();
}

// ================= المشاريع =================
document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let proj = {
        name: document.getElementById('projName').value, staff: document.getElementById('projStaff').value || 'غير محدد',
        details: document.getElementById('projDetails').value, amount: document.getElementById('projAmount').value, date: new Date().toLocaleDateString()
    };
    projects.push(proj); localStorage.setItem('system_projects', JSON.stringify(projects));
    alert("تم حفظ الصرفية للمشروع بنجاح!"); this.reset(); renderProjects();
});

function renderProjects() {
    let tbody = document.getElementById('projectsTableBody'); tbody.innerHTML = '';
    projects.forEach((p, i) => {
        tbody.innerHTML += `<tr><td>${p.name}</td><td>${p.staff}</td><td>${p.details}</td><td>${p.amount}</td><td>${p.date}</td>
            <td><button class="btn-delete" onclick="deleteItem('system_projects', projects, ${i}, renderProjects)">حذف</button></td></tr>`;
    });
}

// ================= تصدير إكسل =================
function exportDataToExcel() {
    if(typeof XLSX === 'undefined') { alert("تأكد من اتصالك بالإنترنت."); return; }
    let wb = XLSX.utils.book_new();
    let ws_customers = XLSX.utils.json_to_sheet(customers);
    let ws_projects = XLSX.utils.json_to_sheet(projects);
    let ws_invoices = XLSX.utils.json_to_sheet(invoices.map(i => ({ ID: i.id, العميل: i.customer, التاريخ: i.date, الإجمالي: i.total })));

    XLSX.utils.book_append_sheet(wb, ws_customers, "العملاء");
    XLSX.utils.book_append_sheet(wb, ws_invoices, "الفواتير");
    XLSX.utils.book_append_sheet(wb, ws_projects, "المشاريع");

    XLSX.writeFile(wb, "Backup_Data.xlsx");
}
