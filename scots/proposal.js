// ===== proposal.js =====

function fmtMoney(v) {
    return (Number(v) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escXml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function safeFileName(s) {
    return String(s || '').replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim().slice(0, 60);
}

function numberToWordsRu(num) {
    const n = Math.floor(Number(num) || 0);
    if (n === 0) return 'Ноль рублей 00 копеек';

    const onesM = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const onesF = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const teens = ['десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцать'];
    const tens  = ['','','двадцать','тридцать','сорок','пятьдесят','шестьдесят','семьдесят','восемьдесят','девяносто'];
    const hund  = ['','сто','двести','триста','четыреста','пятьсот','шестьсот','семьсот','восемьсот','девятьсот'];

    const groups = [];
    let t = n;
    while (t > 0) { groups.push(t % 1000); t = Math.floor(t / 1000); }

    const names = [
        ['рубль','рубля','рублей'],
        ['тысяча','тысячи','тысяч'],
        ['миллион','миллиона','миллионов']
    ];
    const female = [false, true, false];

    function triplet(v, fem) {
        const out = [];
        out.push(hund[Math.floor(v / 100)]);
        const r = v % 100;
        if (r >= 10 && r < 20) out.push(teens[r - 10]);
        else {
            out.push(tens[Math.floor(r / 10)]);
            out.push((fem ? onesF : onesM)[r % 10]);
        }
        return out.filter(Boolean).join(' ');
    }
    function plural(v, forms) {
        const a = Math.abs(v) % 100, b = a % 10;
        if (a > 10 && a < 20) return forms[2];
        if (b > 1 && b < 5) return forms[1];
        if (b === 1) return forms[0];
        return forms[2];
    }

    const parts = [];
    for (let g = groups.length - 1; g >= 0; g--) {
        const v = groups[g];
        if (!v) continue;
        parts.push(triplet(v, female[g]));
        parts.push(plural(v, names[g]));
    }
    let res = parts.join(' ').replace(/\s+/g, ' ').trim();
    res = res.charAt(0).toUpperCase() + res.slice(1);
    return res + ' 00 копеек';
}

function buildProposalData(order, orderIndex) {
    const number = order.displayId || String(orderIndex + 1).padStart(3, '0');
    const dateStr = order.date
        ? new Date(order.date).toLocaleDateString('ru-RU')
        : new Date().toLocaleDateString('ru-RU');
    const validUntil = order.deliveryDate
        ? new Date(order.deliveryDate).toLocaleDateString('ru-RU')
        : new Date().toLocaleDateString('ru-RU');

    const rows = (order.items || []).map((it, i) => ({
        idx: i + 1,
        name: it.name || 'Товар',
        qty: Number(it.qty) || 1,
        unit: 'шт',
        price: Number(it.price) || 0,
        sum: (Number(it.price) || 0) * (Number(it.qty) || 1)
    }));
    const total = rows.reduce((s, r) => s + r.sum, 0);

    // Берем реквизиты из глобальной переменной
    const reqs = window.companyRequisites || {};

    return {
        number, dateStr, validUntil,
        customer: order.customer || '',
        rows, total,
        totalWords: numberToWordsRu(total),
        company: {
            fullName: reqs.fullName || 'ООО "МАРКОРП"',
            address: reqs.address || '',
            inn: reqs.inn || '',
            kpp: reqs.kpp || '',
            bank: reqs.bank || '',
            bik: reqs.bik || '',
            ks: reqs.ks || '',
            rs: reqs.rs || '',
            nds: reqs.nds || 'НДС не облагается',
            director: reqs.director || ''
        }
    };
}

// ============ XLSX (ExcelJS) ============
function exportOrderAsXlsx(orderIndex) {
    const order = orders[orderIndex];
    if (!order) return;
    const d = buildProposalData(order, orderIndex);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('КП', { views: [{ showGridLines: false }] });

    // Ширины колонок (A=2, B=4, C=2, D=50, E=2, F=2, G=2...)
    ws.columns = [
        { width: 2 }, { width: 4 }, { width: 2 }, { width: 50 }, { width: 2 }, { width: 2 }, { width: 2 },
        { width: 2 }, { width: 2 }, { width: 15 }, { width: 2 }, { width: 2 }, { width: 2 }, { width: 2 },
        { width: 2 }, { width: 2 }, { width: 2 }, { width: 2 }, { width: 2 }, { width: 2 }, { width: 2 },
        { width: 2 }, { width: 2 }, { width: 8 }, { width: 2 }, { width: 2 }, { width: 2 }, { width: 2 },
        { width: 6 }, { width: 2 }, { width: 2 }, { width: 12 }, { width: 2 }, { width: 2 }, { width: 2 },
        { width: 15 }, { width: 12 }
    ];

    // Стили
    const borderStyle = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    
    // 1. Шапка с реквизитами (справа)
    ws.getCell('J2').value = `Организация: ${d.company.fullName}`;
    ws.getCell('J3').value = `Адрес: ${d.company.address}`;
    ws.getCell('J4').value = `ИНН: ${d.company.inn} / КПП: ${d.company.kpp}`;
    ws.getCell('J5').value = `Банк: ${d.company.bank}`;
    ws.getCell('J6').value = `БИК: ${d.company.bik} / Р/с: ${d.company.rs} / К/с: ${d.company.ks}`;
    
    ['J2','J3','J4','J5','J6'].forEach(cell => {
        ws.getCell(cell).alignment = { horizontal: 'right' };
        ws.mergeCells(cell + ':U' + cell.slice(1)); // merge J:U
    });

    // 2. Заголовок КП
    ws.getCell('B8').value = `Коммерческое предложение № ${d.number} от ${d.dateStr}`;
    ws.getCell('B8').font = { bold: true, size: 12 };

    // 3. Кому
    ws.getCell('B12').value = 'Кому:';
    ws.getCell('F12').value = d.customer;
    ws.mergeCells('F12:U12');

    // 4. Таблица товаров
    const headRow = 14;
    const headers = ['№', '', 'Товары (работы, услуги)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Кол-во', '', '', '', 'Ед.', '', '', 'Цена', '', '', '', '', 'Сумма'];
    // Заполняем только значимые ячейки, чтобы merge не сломался
    ws.getCell(`B${headRow}`).value = '№';
    ws.getCell(`D${headRow}`).value = 'Товары (работы, услуги)';
    ws.getCell(`X${headRow}`).value = 'Кол-во';
    ws.getCell(`AE${headRow}`).value = 'Ед.';
    ws.getCell(`AH${headRow}`).value = 'Цена';
    ws.getCell(`AJ${headRow}`).value = 'Сумма';

    // Применяем стили и объединения к шапке
    ws.mergeCells(`D${headRow}:W${headRow}`);
    ['B','D','X','AE','AH','AJ'].forEach(col => {
        ws.getCell(`${col}${headRow}`).font = { bold: true };
        ws.getCell(`${col}${headRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getCell(`${col}${headRow}`).border = borderStyle;
    });

    // Данные
    d.rows.forEach((r, i) => {
        const rr = headRow + 1 + i;
        ws.getCell(`B${rr}`).value = r.idx;
        ws.getCell(`D${rr}`).value = r.name;
        ws.getCell(`X${rr}`).value = r.qty;
        ws.getCell(`AE${rr}`).value = r.unit;
        ws.getCell(`AH${rr}`).value = r.price;
        ws.getCell(`AJ${rr}`).value = r.sum;

        ws.mergeCells(`D${rr}:W${rr}`);
        
        ws.getCell(`B${rr}`).border = borderStyle;
        ws.getCell(`D${rr}`).border = borderStyle;
        ws.getCell(`X${rr}`).border = borderStyle;
        ws.getCell(`AE${rr}`).border = borderStyle;
        ws.getCell(`AH${rr}`).border = borderStyle;
        ws.getCell(`AJ${rr}`).border = borderStyle;

        ws.getCell(`B${rr}`).alignment = { horizontal: 'center' };
        ws.getCell(`X${rr}`).alignment = { horizontal: 'center' };
        ws.getCell(`AE${rr}`).alignment = { horizontal: 'center' };
        ws.getCell(`AH${rr}`).alignment = { horizontal: 'right' };
        ws.getCell(`AJ${rr}`).alignment = { horizontal: 'right' };
    });

    // Итого
    const sumRow = headRow + d.rows.length + 2;
    ws.getCell(`AJ${sumRow}`).value = 'Итого:';
    ws.getCell(`AK${sumRow}`).value = d.total;
    ws.getCell(`AJ${sumRow+1}`).value = `Без налога (${d.company.nds}):`;
    ws.getCell(`AK${sumRow+1}`).value = '-';
    ws.getCell(`AJ${sumRow+2}`).value = 'Всего:';
    ws.getCell(`AK${sumRow+2}`).value = d.total;

    ['AJ','AK'].forEach(col => {
        for(let i=0; i<3; i++) {
            ws.getCell(`${col}${sumRow+i}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' } }; // только линии
            ws.getCell(`${col}${sumRow+i}`).alignment = { horizontal: col === 'AJ' ? 'right' : 'left' };
        }
    });

    ws.getCell(`B${sumRow+3}`).value = `Всего наименований ${d.rows.length}, на сумму ${fmtMoney(d.total)} руб.`;
    ws.getCell(`B${sumRow+4}`).value = d.totalWords;
    ws.getCell(`B${sumRow+4}`).font = { bold: true };
    ws.getCell(`B${sumRow+6}`).value = `Предложение действует до ${d.validUntil} года.`;

    ws.getCell(`B${sumRow+11}`).value = 'Руководитель';
    ws.getCell(`Y${sumRow+11}`).value = d.company.director;

    // Сохранение
    wb.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `КП_${safeFileName(d.number)}_${safeFileName(d.customer)}.xlsx`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
}
window.exportOrderAsXlsx = exportOrderAsXlsx;

// ============ PDF ============
function buildProposalHtml(d) {
    const rowsHtml = d.rows.map(r => `
        <tr>
            <td class="c">${r.idx}</td>
            <td>${escXml(r.name)}</td>
            <td class="c">${r.qty}</td>
            <td class="c">${r.unit}</td>
            <td class="r">${fmtMoney(r.price)}</td>
            <td class="r">${fmtMoney(r.sum)}</td>
        </tr>`).join('');

    // Блок реквизитов
    const companyHtml = `
        <div><b>Организация:</b> ${escXml(d.company.fullName)}</div>
        <div><b>Адрес:</b> ${escXml(d.company.address)}</div>
        <div><b>ИНН / КПП:</b> ${escXml(d.company.inn)} / ${escXml(d.company.kpp)}</div>
        <div><b>Банк:</b> ${escXml(d.company.bank)}</div>
        <div><b>БИК / Р/с / К/с:</b> ${escXml(d.company.bik)} / ${escXml(d.company.rs)} / ${escXml(d.company.ks)}</div>
    `;

    // Блок подписи с факсимиле (если есть)
    const faxHtml = window.companyFaxBase64 
        ? `<img src="${window.companyFaxBase64}" style="position:absolute; left:100px; top:-20px; width:120px; opacity:0.85; mix-blend-mode: multiply;">` 
        : '';

    return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><title>КП № ${escXml(d.number)}</title>
<style>
/* Скрываем колонтитулы браузера при печати */
@page { size: A4; margin: 15mm; }
@media print {
    .no-print { display:none !important; }
    /* Это убирает URL и дату */
    @page { margin: 15mm 15mm 15mm 15mm; }
}
* { box-sizing: border-box; }
body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color:#000; margin:0; }
.hdr { font-size: 10pt; line-height:1.35; margin-bottom: 24px; }
h1 { font-size:14pt; margin: 14px 0 16px; text-align:center; }
.meta { margin: 12px 0; font-size: 12pt; }
table.items { width:100%; border-collapse:collapse; margin-top:16px; font-size: 10pt; }
table.items th, table.items td { border:1px solid #555; padding:6px 8px; vertical-align:top; }
table.items th { background:#f5f5f5; font-weight:bold; text-align:center; }
td.c { text-align:center; }
td.r { text-align:right; white-space:nowrap; }
table.totals { width:40%; margin-left:auto; margin-top:16px; border-collapse:collapse; font-size: 11pt; }
table.totals td { padding:4px 6px; }
table.totals td:last-child { text-align:right; border-bottom:1px solid #555; white-space:nowrap; }
.words { margin-top:16px; font-size: 11pt; }
.sign { margin-top:45px; position:relative; display:flex; justify-content:space-between; font-size: 11pt; }
</style></head>
<body>
<div class="hdr">
    ${companyHtml}
</div>
<h1>Коммерческое предложение № ${escXml(d.number)} от ${escXml(d.dateStr)}</h1>
<div class="meta"><b>Кому:</b> ${escXml(d.customer)}</div>
<table class="items">
    <thead><tr>
        <th style="width:28px;">№</th>
        <th>Товары (работы, услуги)</th>
        <th style="width:52px;">Кол-во</th>
        <th style="width:38px;">Ед.</th>
        <th style="width:82px;">Цена</th>
        <th style="width:92px;">Сумма</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
</table>
<table class="totals">
    <tr><td>Итого:</td><td>${fmtMoney(d.total)}</td></tr>
    <tr><td>Без налога (${escXml(d.company.nds)}):</td><td>-</td></tr>
    <tr><td><b>Всего:</b></td><td><b>${fmtMoney(d.total)}</b></td></tr>
</table>
<div class="words">Всего наименований ${d.rows.length}, на сумму ${fmtMoney(d.total)} руб.</div>
<div class="words"><b>${escXml(d.totalWords)}</b></div>
<div class="words" style="margin-top:20px;">Предложение действует до ${escXml(d.validUntil)} года.</div>

<div class="sign">
    <div style="width: 40%;">
        <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 4px;"></div>
        <div style="text-align: center;">Руководитель</div>
    </div>
    <div style="width: 40%; position:relative;">
        ${faxHtml}
        <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 4px;"></div>
        <div style="text-align: center;">${escXml(d.company.director)}</div>
    </div>
</div>

<div class="no-print" style="margin-top:40px; text-align:center;">
    <button onclick="window.print()" style="padding:10px 24px; font-size:16px; cursor:pointer; background:#ff9900; color:#fff; border:none; border-radius:4px; font-weight:bold;">🖨️ Сохранить в PDF</button>
    <div style="font-size:12px; color:#666; margin-top:10px;">В настройках печати выберите <b>«Сохранить как PDF»</b> и обязательно снимите галочку <b>«Верхние и нижние колонтитулы»</b>.</div>
</div>
<script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 200); });<\/script>
</body></html>`;
}

function exportOrderAsPdf(orderIndex) {
    const order = orders[orderIndex];
    if (!order) return;
    const d = buildProposalData(order, orderIndex);
    const html = buildProposalHtml(d);

    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) { alert('Разрешите всплывающие окна для формирования КП.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
}
window.exportOrderAsPdf = exportOrderAsPdf;
