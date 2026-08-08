import { OWNER_INFO, SHOP_NAME } from './restaurant';

/**
 * Kitchen ticket printing for the admin order list.
 *
 * The receipt is written into a hidden, same-origin iframe and printed from
 * there rather than by putting `@media print` rules on the app itself. That
 * keeps the app's dark theme, fixed bars and tab bar entirely out of the
 * printed output, and makes a reprint a fresh document every time.
 *
 * Only system fonts are used — pulling a webfont at print time would race the
 * print dialog and fall back to a different face anyway, and the shop machine
 * may well be offline. Tahoma/Arial cover Arabic on Windows, which is what a
 * counter PC is most likely running.
 */

/**
 * Widest the ticket will ever render.
 *
 * The page size itself is left to the printer — whatever roll is actually
 * loaded decides, so a 58mm roll, an 80mm roll and an A4 sheet all work with no
 * configuration. This cap only stops a wide sheet from stretching a receipt
 * across the full page; anything narrower than this simply fills its own width
 * and the rows reflow to match.
 */
const RECEIPT_MAX_WIDTH = '80mm';

/** How long to leave the iframe in the DOM after printing, in ms. Removing it
 *  the instant `print()` returns can cancel the job in some browsers. */
const CLEANUP_DELAY = 60_000;

const FRAME_ID = 'az-receipt-frame';

const STATUS_LABELS = {
    pending: 'تم الاستلام',
    preparing: 'جاري التحضير',
    baking: 'في الفرن',
    shipping: 'جاري التوصيل',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
};

/**
 * Address, notes and item names are customer-typed. They are interpolated into
 * a document on our own origin, so they get escaped rather than trusted.
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
            })[char]
    );
}

const money = (value) => `${Math.round(Number(value) || 0)} ج.م`;

/** Latin digits in an RTL line reorder unless the run is isolated. */
const ltr = (value) => `<span dir="ltr">${esc(value)}</span>`;

function formatPrintedAt() {
    // en-GB / 24h on purpose: an ar-EG short date mixes an Arabic AM/PM marker
    // into a run of Latin digits, and the bidi reordering that follows makes the
    // result genuinely ambiguous on paper. dd/mm/yyyy HH:mm reads the same to
    // everyone.
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

function receiptHtml(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    // `order.total` is already the final amount the customer pays (subtotal +
    // delivery − discount, see checkout). Subtotal is derived from the lines so
    // the ticket still adds up on an older order that predates a fee field.
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
<title>طلب ${esc(order.id)}</title>
<style>
  /* size:auto hands the page size to the printer instead of forcing one. Naming a
     width here is what made a 58mm roll clip: the driver was told the page was
     80mm and had to scale or crop to fit. */
  @page { size: auto; margin: 0; }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
  }

  body {
    width: 100%;
    max-width: ${RECEIPT_MAX_WIDTH};
    padding: 4mm 3mm;
    font-family: 'Cairo', Tahoma, Arial, 'Segoe UI', sans-serif;
    /* Thermal heads are low-res: small text closes up and smears. */
    font-size: 12px;
    line-height: 1.5;
    /* A long address or an unbroken order id must wrap rather than run off the
       edge of a narrow roll. */
    overflow-wrap: break-word;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .center { text-align: center; }
  .muted { color: #444; }
  .bold { font-weight: 700; }

  .shop-name { font-size: 19px; font-weight: 700; letter-spacing: .5px; }
  .shop-meta { font-size: 10px; color: #333; margin-top: 1mm; }

  hr {
    border: 0;
    border-top: 1px dashed #000;
    margin: 2.5mm 0;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 2mm;
  }
  /* Without this the label side refuses to shrink below its content and pushes
     the amount off the edge on a 58mm roll. */
  .row > :first-child { min-width: 0; }

  /* Never break the order id — it is the field staff read aloud. On a roll too
     narrow for both, row-head lets the status drop to its own line instead. */
  .row-head { flex-wrap: wrap; }
  .order-id { font-size: 15px; font-weight: 700; white-space: nowrap; }

  .field { margin-top: .8mm; font-size: 11px; }
  .field .label { color: #333; }

  /* The item lines are the part someone reads at arm's length off a spike by
     the oven, so they run larger than everything else on the ticket. */
  .item { margin-bottom: 2mm; }
  /* The name takes the slack and wraps; the price never splits. */
  .item-name { flex: 1; min-width: 0; font-size: 15px; font-weight: 700; }
  .item-price { flex: none; font-size: 15px; white-space: nowrap; font-weight: 700; }
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

  <div class="row row-head">
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

  ${
      order.notes
          ? `<div class="notes"><span class="label">ملاحظات</span>${esc(order.notes)}</div>`
          : ''
  }

  <div class="center footer">شكراً لطلبك من ${esc(SHOP_NAME)}</div>
  <div class="feed"></div>
</body>
</html>`;
}

/**
 * Print a single order's kitchen ticket.
 *
 * Resolves once the print dialog has been handed the document. Callers should
 * treat a rejection as "paper did not come out" and nothing more — the order it
 * describes has already been updated server-side by the time this runs.
 */
export function printOrderReceipt(order) {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            reject(new Error('الطباعة غير متاحة'));
            return;
        }
        if (!order?.id) {
            reject(new Error('لا يوجد طلب للطباعة'));
            return;
        }

        // A previous ticket may still be parked in the DOM waiting on its
        // cleanup timer; printing twice should not stack frames.
        document.getElementById(FRAME_ID)?.remove();

        const frame = document.createElement('iframe');
        frame.id = FRAME_ID;
        frame.setAttribute('aria-hidden', 'true');
        frame.setAttribute('tabindex', '-1');
        frame.style.cssText =
            'position:fixed;inset-block-start:0;inset-inline-start:0;width:0;height:0;border:0;visibility:hidden;';

        let done = false;
        const finish = (error) => {
            if (done) return;
            done = true;
            // Deliberately not immediate: Safari and some Chrome builds abort a
            // queued job if the source frame disappears too soon.
            setTimeout(() => frame.remove(), CLEANUP_DELAY);
            error ? reject(error) : resolve();
        };

        frame.onload = () => {
            try {
                const win = frame.contentWindow;
                if (!win) throw new Error('تعذر تجهيز الفاتورة للطباعة');
                win.focus();
                win.print();
                finish();
            } catch (error) {
                finish(error instanceof Error ? error : new Error('تعذرت الطباعة'));
            }
        };
        frame.onerror = () => finish(new Error('تعذر تجهيز الفاتورة للطباعة'));

        frame.srcdoc = receiptHtml(order);
        document.body.appendChild(frame);
    });
}

export default printOrderReceipt;
