import * as Print from 'expo-print';

import { OWNER_INFO, SHOP_NAME } from '../constants/restaurant';

/**
 * Kitchen ticket printing for the admin order list.
 *
 * expo-print hands the HTML to the OS print service (AirPrint on iOS, the
 * Android print framework), so any printer the device already knows about works
 * — including a thermal receipt printer reachable over the network.
 *
 * The markup mirrors web/lib/printReceipt.js so a ticket printed from the phone
 * and one printed from the counter PC are the same document. The two apps have
 * no shared package, so keeping them in step is manual.
 */

/**
 * Roll width. 80mm is the common thermal receipt size; change to '58mm' for the
 * narrow rolls. On A4 this prints a narrow strip, which is still legible.
 */
const PAPER_WIDTH = '80mm';

const STATUS_LABELS = {
    pending: 'تم الاستلام',
    preparing: 'جاري التحضير',
    baking: 'في الفرن',
    shipping: 'جاري التوصيل',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
};

/**
 * Address, notes and item names are customer-typed, and this HTML is rendered by
 * a real web view — so they get escaped rather than trusted.
 */
function esc(value) {
    return String(value ?? '').replace(
        /[&<>"']/g,
        (char) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            }[char])
    );
}

const money = (value) => `${Math.round(Number(value) || 0)} ج.م`;

/** Latin digits in an RTL line reorder unless the run is isolated. */
const ltr = (value) => `<span dir="ltr">${esc(value)}</span>`;

function formatPrintedAt() {
    // en-GB / 24h on purpose: an ar-EG short date mixes an Arabic AM/PM marker
    // into a run of Latin digits, and the bidi reordering that follows makes the
    // result ambiguous on paper. dd/mm/yyyy HH:mm reads the same to everyone.
    try {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
            timeZone: 'Africa/Cairo',
        }).format(new Date());
    } catch {
        return new Date().toLocaleString();
    }
}

function itemRows(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return '<div class="row"><span class="muted">لا توجد أصناف</span></div>';
    }

    return items
        .map((item) => {
            const qty = Number(item.quantity) || 1;
            const size = item.selectedSize || item.size;
            const lineTotal = (Number(item.price) || 0) * qty;
            return `
                <div class="item">
                    <div class="row">
                        <span class="item-name">${ltr(`${qty}×`)} ${esc(item.name)}</span>
                        <span class="item-price">${ltr(money(lineTotal))}</span>
                    </div>
                    ${size ? `<div class="item-size">${esc(size)}</div>` : ''}
                </div>`;
        })
        .join('');
}

export function receiptHtml(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    // `order.total` is already the final amount the customer pays (subtotal +
    // delivery − discount). Subtotal is derived from the lines so the ticket
    // still adds up on an older order that predates a fee field.
    const subtotal = items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
    );
    const deliveryFee = Number(order.delivery_fee ?? order.deliveryFee) || 0;
    const discount = Number(order.discount) || 0;
    const couponCode = order.coupon_code || order.couponCode;
    const zone = order.delivery_zone || order.deliveryZone;
    const status = STATUS_LABELS[order.status] || order.status || '';

    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>طلب ${esc(order.id)}</title>
<style>
  @page { size: ${PAPER_WIDTH} auto; margin: 0; }

  * { box-sizing: border-box; }

  html, body { margin: 0; padding: 0; background: #fff; color: #000; }

  body {
    width: ${PAPER_WIDTH};
    padding: 4mm 3mm;
    font-family: Tahoma, Arial, sans-serif;
    /* Thermal heads are low-res: small text closes up and smears. */
    font-size: 12px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .center { text-align: center; }
  .muted { color: #444; }
  .bold { font-weight: 700; }

  .shop-name { font-size: 19px; font-weight: 700; letter-spacing: .5px; }
  .shop-meta { font-size: 10px; color: #333; margin-top: 1mm; }

  hr { border: 0; border-top: 1px dashed #000; margin: 2.5mm 0; }

  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 2mm; }

  .order-id { font-size: 15px; font-weight: 700; }

  .field { margin-top: .8mm; font-size: 11px; }
  .field .label { color: #333; }

  /* The item lines are the part someone reads at arm's length off a spike by
     the oven, so they run larger than everything else on the ticket. */
  .item { margin-bottom: 2mm; }
  .item-name { font-size: 15px; font-weight: 700; }
  .item-price { font-size: 15px; white-space: nowrap; font-weight: 700; }
  .item-size { font-size: 11px; color: #333; padding-inline-start: 5mm; }

  .totals .row { font-size: 11px; margin-top: .6mm; }
  .grand {
    margin-top: 1.5mm;
    padding-top: 1.5mm;
    border-top: 1px solid #000;
    font-size: 16px;
    font-weight: 700;
  }

  /* The kitchen misses notes when they sit in the same grey as everything
     else, so they get a box of their own. */
  .notes {
    margin-top: 2.5mm;
    padding: 1.8mm 2mm;
    border: 1.5px solid #000;
    font-size: 12px;
    font-weight: 700;
  }
  .notes .label { display: block; font-size: 10px; font-weight: 400; }

  .footer { margin-top: 3mm; font-size: 10px; color: #333; }
  /* Feeds the last line clear of the tear bar before the cut. */
  .feed { height: 10mm; }
</style>
</head>
<body>
  <div class="center">
    <div class="shop-name">${esc(SHOP_NAME)}</div>
    <div class="shop-meta">${esc(OWNER_INFO.address)}</div>
    <div class="shop-meta">${ltr(OWNER_INFO.phone)}</div>
  </div>

  <hr>

  <div class="row">
    <span class="order-id">${ltr(`#${order.id}`)}</span>
    <span class="bold">${esc(status)}</span>
  </div>
  <div class="field"><span class="label">التاريخ:</span> ${ltr(order.date || '')}</div>
  <div class="field"><span class="label">وقت الطباعة:</span> ${ltr(formatPrintedAt())}</div>

  <hr>

  <div class="field bold">بيانات العميل</div>
  ${order.customer_name ? `<div class="field"><span class="label">الاسم:</span> ${esc(order.customer_name)}</div>` : ''}
  <div class="field"><span class="label">الهاتف:</span> ${ltr(order.phone || '')}</div>
  ${order.address ? `<div class="field"><span class="label">العنوان:</span> ${esc(order.address)}</div>` : ''}
  ${zone ? `<div class="field"><span class="label">المنطقة:</span> ${esc(zone)}</div>` : ''}

  <hr>

  ${itemRows(items)}

  <hr>

  <div class="totals">
    <div class="row"><span>المجموع الفرعي</span><span>${ltr(money(subtotal))}</span></div>
    ${deliveryFee > 0 ? `<div class="row"><span>التوصيل</span><span>${ltr(money(deliveryFee))}</span></div>` : ''}
    ${
        discount > 0
            // No leading minus: the label already says "discount", and a stray
            // sign next to an RTL currency run reorders unpredictably.
            ? `<div class="row"><span>الخصم${couponCode ? ` (${esc(couponCode)})` : ''}</span><span>${ltr(money(discount))}</span></div>`
            : ''
    }
    <div class="row grand"><span>الإجمالي</span><span>${ltr(money(order.total))}</span></div>
  </div>

  ${order.notes ? `<div class="notes"><span class="label">ملاحظات</span>${esc(order.notes)}</div>` : ''}

  <div class="center footer">شكراً لطلبك من ${esc(SHOP_NAME)}</div>
  <div class="feed"></div>
</body>
</html>`;
}

/**
 * Print a single order's kitchen ticket.
 *
 * Rejects if the OS print sheet could not be opened, or if the user cancelled
 * it. Callers should treat that as "paper did not come out" and nothing more —
 * the order it describes is already updated server-side by the time this runs.
 */
export async function printOrderReceipt(order) {
    if (!order?.id) throw new Error('لا يوجد طلب للطباعة');
    await Print.printAsync({ html: receiptHtml(order) });
}

export default printOrderReceipt;
