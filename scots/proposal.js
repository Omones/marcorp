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

    // Берем реквизиты из глобальной переменной (из orders.js)
    const reqs = window.companyRequisites || {};

    return {
        number, dateStr, validUntil,
        customer: order.customer || '',
        rows, total,
        totalWords: numberToWordsRu(total),
        company: {
            fullName: reqs.fullName || 'ООО "МАРКОРП"',
            shortName: reqs.shortName || 'ООО "МАРКОРП"',
            address: reqs.address || '',
            inn: reqs.inn || '',
            kpp: reqs.kpp || '',
            phone: reqs.phone || '',
            director: reqs.director || '',
            nds: reqs.nds || 'НДС не облагается'
        }
    };
}

// ============ ZIP / XLSX ============
function crc32Table() {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[n] = c >>> 0;
    }
    return t;
}
const CRC_TABLE = crc32Table();
function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}
function u16(v){ return [v & 0xff, (v>>>8)&0xff]; }
function u32(v){ return [v & 0xff, (v>>>8)&0xff, (v>>>16)&0xff, (v>>>24)&0xff]; }
function u64(v){ return u32(v & 0xFFFFFFFF).concat(u32(Math.floor(v / 0x100000000))); }

function zipStore(files) {
    const enc = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;
    for (const f of files) {
        const nameBytes = enc.encode(f.name);
        const data = f.data;
        const crc = crc32(data);
        const local = [
            0x50,0x4b,0x03,0x04,
            ...u16(20), ...u16(0x0800),
            ...u16(0), ...u16(0),
            ...u32(crc), ...u32(data.length), ...u32(data.length),
            ...u16(nameBytes.length), ...u16(0)
        ];
        const localHeader = new Uint8Array(local);
        chunks.push(localHeader, nameBytes, data);

        const centralRec = [
            0x50,0x4b,0x01,0x02,
            ...u16(20), ...u16(20), ...u16(0x0800),
            ...u16(0), ...u16(0),
            ...u32(crc), ...u32(data.length), ...u32(data.length),
            ...u16(nameBytes.length), ...u16(0), ...u16(0),
            ...u16(0), ...u16(0), ...u32(0),
            ...u32(offset)
        ];
        central.push({ header: new Uint8Array(centralRec), name: nameBytes });

        offset += localHeader.length + nameBytes.length + data.length;
    }

    const centralStart = offset;
    let centralSize = 0;
    for (const c of central) {
        chunks.push(c.header, c.name);
        centralSize += c.header.length + c.name.length;
    }
    const end = new Uint8Array([
        0x50,0x4b,0x05,0x06,
        ...u16(0), ...u16(0),
        ...u16(central.length), ...u16(central.length),
        ...u32(centralSize), ...u32(centralStart),
        ...u16(0)
    ]);
    chunks.push(end);

    let total = 0;
    for (const c of chunks) total += c.length;
    const out = new Uint8Array(total);
    let p = 0;
    for (const c of chunks) { out.set(c, p); p += c.length; }
    return out;
}

function colLetter(n) {
    let s = '';
    while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
    return s;
}
function sheetXml(rows, merges, colWidths) {
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';

    if (colWidths && colWidths.length) {
        xml += '<cols>';
        colWidths.forEach((w, i) => {
            xml += `<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`;
        });
        xml += '</cols>';
    }

    xml += '<sheetData>';
    rows.forEach((row, rIdx) => {
        const r = rIdx + 1;
        xml += `<row r="${r}">`;
        row.forEach((cell, cIdx) => {
            if (cell == null) return;
            const ref = colLetter(cIdx + 1) + r;
            if (typeof cell === 'object' && cell.t === 'n') {
                xml += `<c r="${ref}"><v>${cell.v}</v></c>`;
            } else {
                const val = (typeof cell === 'object') ? cell.v : cell;
                xml += `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escXml(val)}</t></is></c>`;
            }
        });
        xml += '</row>';
    });
    xml += '</sheetData>';

    if (merges && merges.length) {
        xml += `<mergeCells count="${merges.length}">`;
        for (const m of merges) xml += `<mergeCell ref="${m}"/>`;
        xml += '</mergeCells>';
    }
    xml += '</worksheet>';
    return xml;
}

function exportOrderAsXlsx(orderIndex) {
    const order = orders[orderIndex];
    if (!order) return;
    const d = buildProposalData(order, orderIndex);

    const N = (v) => ({ v: v, t: 'n' });
    const S = (v) => (v == null || v === '') ? null : String(v);

    const rows = [];
    const put = (r, c, v) => {
        while (rows.length <= r) rows.push([]);
        while (rows[r].length <= c) rows[r].push(null);
        rows[r][c] = (typeof v === 'number') ? N(v) : S(v);
    };

    put(2, 9, `Организация: ${d.company.fullName}`);
    if (d.company.inn) put(3, 9, `ИНН: ${d.company.inn} / КПП: ${d.company.kpp}`);
    put(4, 9, `Адрес: ${d.company.address}`);

    put(7, 1, `Коммерческое предложение № ${d.number} от ${d.dateStr}`);
    put(11, 1, 'Кому:');
    put(11, 5, d.customer);

    const headR = 13;
    put(headR, 1, '№');
    put(headR, 3, 'Товары (работы, услуги)');
    put(headR, 23, 'Кол-во');
    put(headR, 28, 'Ед.');
    put(headR, 31, 'Цена');
    put(headR, 36, 'Сумма');

    d.rows.forEach((r, i) => {
        const rr = headR + 1 + i;
        put(rr, 1, r.idx);
        put(rr, 3, r.name);
        put(rr, 23, r.qty);
        put(rr, 28, r.unit);
        put(rr, 31, r.price);
        put(rr, 36, r.sum);
    });

    const lastItemR = headR + d.rows.length;
    const sumR = lastItemR + 2;
    put(sumR, 35, 'Итого:');
    put(sumR, 36, d.total);
    put(sumR + 1, 35, `Без налога (${d.company.nds})`);
    put(sumR + 1, 36, '-');
    put(sumR + 2, 35, 'Всего:');
    put(sumR + 2, 36, d.total);

    put(sumR + 3, 1, `Всего наименований ${d.rows.length}, на сумму ${fmtMoney(d.total)} руб.`);
    put(sumR + 4, 1, d.totalWords);
    put(sumR + 6, 1, `Предложение действует до ${d.validUntil} года.`);
    put(sumR + 11, 1, 'Руководитель');
    put(sumR + 11, 24, d.company.director);

    const merges = [
        `J3:U3`, `J4:U4`, `J5:U5`,
        `F12:U12`,
        `D${headR+1}:W${lastItemR}`,
        `B${sumR+3}:U${sumR+3}`,
        `B${sumR+4}:U${sumR+4}`,
    ];

    const widths = [];
    widths[0] = 2; widths[1] = 4; widths[2] = 2; widths[3] = 50; widths[4] = 2; widths[5] = 2; widths[6] = 2;
    widths[7] = 2; widths[8] = 2; widths[9] = 12; widths[10] = 2; widths[11] = 2; widths[12] = 2; widths[13] = 2;
    widths[14] = 2; widths[15] = 2; widths[16] = 2; widths[17] = 2; widths[18] = 2; widths[19] = 2; widths[20] = 2;
    widths[21] = 2; widths[22] = 2; widths[23] = 7; widths[24] = 2; widths[25] = 2; widths[26] = 2; widths[27] = 2;
    widths[28] = 5; widths[29] = 2; widths[30] = 2; widths[31] = 12; widths[32] = 2; widths[33] = 2; widths[34] = 2;
    widths[35] = 14; widths[36] = 12;

    const parts = [];
    const enc = new TextEncoder();

    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Лист_1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

    const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="1"><fill><patternFill patternType="none"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf/></cellStyleXfs>
<cellXfs count="1"><xf xfId="0"/></cellXfs>
</styleSheet>`;

    const sheet = sheetXml(rows, merges, widths);

    parts.push({ name: '[Content_Types].xml', data: enc.encode(contentTypes) });
    parts.push({ name: '_rels/.rels', data: enc.encode(rels) });
    parts.push({ name: 'xl/workbook.xml', data: enc.encode(workbook) });
    parts.push({ name: 'xl/_rels/workbook.xml.rels', data: enc.encode(workbookRels) });
    parts.push({ name: 'xl/styles.xml', data: enc.encode(styles) });
    parts.push({ name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheet) });

    const zip = zipStore(parts);
    const blob = new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `КП_${safeFileName(d.number)}_${safeFileName(d.customer)}.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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

    const companyHtml = `
        <div>Организация: ${escXml(d.company.fullName)}</div>
        ${d.company.inn ? `<div>ИНН: ${escXml(d.company.inn)} / КПП: ${escXml(d.company.kpp)}</div>` : ''}
        <div>Адрес: ${escXml(d.company.address)}</div>
    `;

    return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><title>КП № ${escXml(d.number)}</title>
<style>
@page { size: A4; margin: 15mm; }
* { box-sizing: border-box; }
body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color:#000; margin:0; }
.hdr { text-align:right; line-height:1.35; margin-bottom:18px; }
h1 { font-size:14pt; margin: 14px 0 12px; }
.meta { margin: 10px 0; }
table.items { width:100%; border-collapse:collapse; margin-top:10px; }
table.items th, table.items td { border:1px solid #555; padding:4px 6px; vertical-align:top; }
table.items th { background:#eee; font-weight:bold; }
td.c { text-align:center; }
td.r { text-align:right; white-space:nowrap; }
table.totals { width:45%; margin-left:auto; margin-top:10px; border-collapse:collapse; }
table.totals td { padding:4px 6px; }
table.totals td:last-child { text-align:right; border-bottom:1px solid #555; white-space:nowrap; }
.words { margin-top:14px; }
.sign { margin-top:40px; display:flex; justify-content:space-between; gap:20px; }
@media print { .no-print { display:none !important; } }
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
<div class="meta" style="margin-top:16px;">Предложение действует до ${escXml(d.validUntil)} года.</div>
<div class="sign">
    <div>Руководитель ____________________</div>
    <div>${escXml(d.company.director)}</div>
</div>
<div class="no-print" style="margin-top:24px; text-align:center;">
    <button onclick="window.print()" style="padding:8px 20px; font-size:14px; cursor:pointer;">🖨️ Печать / Сохранить как PDF</button>
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
