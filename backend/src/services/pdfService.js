import PDFDocument from 'pdfkit';

/**
 * Generates an itemized order receipt and protocol PDF stream.
 * @param {Object} orderData Full order and product items details
 * @param {WritableStream} outputStream Express response stream
 */
export function generateOrderInvoicePDF(orderData, outputStream) {
  const doc = new PDFDocument({ margin: 45, size: 'A4' });

  doc.pipe(outputStream);

  const trackingNumber = String(orderData.tracking_number || orderData.id || '');
  const id = String(orderData.id || '');
  const customerName = String(orderData.customer_name || 'Valued Customer');
  const customerEmail = String(orderData.customer_email || 'N/A');
  const customerPhone = String(orderData.customer_phone || 'N/A');
  const shippingAddress = String(orderData.shipping_address || 'Address provided during checkout');
  const paymentMethod = String(orderData.payment_method || 'cash_on_delivery').toUpperCase().replace(/_/g, ' ');
  const totalAmount = Number(orderData.total_amount || 0).toFixed(2);
  const createdAt = orderData.created_at ? new Date(orderData.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const items = Array.isArray(orderData.items) ? orderData.items : [];

  // --- TOP BANNER ---
  doc
    .rect(0, 0, doc.page.width, 95)
    .fill('#142A20');

  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor('#EFE3C3')
    .text('FANCY STORE', 45, 28);

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#C5A059')
    .text('BOTANICAL SCIENCE & CLINICAL DERMATOLOGY', 45, 54);

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#A2BDB1')
    .text('Colombo, Sri Lanka | concierge@fancystore.lk', 45, 68);

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor('#FFFFFF')
    .text('OFFICIAL DISPATCH RECEIPT', 270, 26, { align: 'right', width: 280 });

  doc
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .fillColor('#C5A059')
    .text(`TRACK NO: ${trackingNumber}`, 270, 46, { align: 'right', width: 280 });

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#E8EFE9')
    .text(`ORDER ID: #${id}  |  DATE: ${createdAt}`, 270, 66, { align: 'right', width: 280 });

  doc.y = 120;

  // --- RECIPIENT & LOGISTICS INFO ---
  const startY = doc.y;

  // Left Column
  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor('#1B382B')
    .text('BILLED & DISPATCHED TO:', 45, startY);

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#161D1A')
    .text(customerName, 45, startY + 14);

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#57534E')
    .text(`Email: ${customerEmail}`, 45, startY + 28)
    .text(`Mobile: ${customerPhone}`, 45, startY + 41);

  // Right Column
  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor('#1B382B')
    .text('DELIVERY DESTINATION:', 300, startY);

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#57534E')
    .text(shippingAddress, 300, startY + 14, { width: 250 })
    .moveDown(0.3);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#C5A059')
    .text(`PAYMENT METHOD: ${paymentMethod}`, 300, doc.y);

  doc.y = Math.max(doc.y + 20, startY + 75);

  // Divider
  doc
    .strokeColor('#E8EFE9')
    .lineWidth(1)
    .moveTo(45, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown(0.8);

  // --- ITEMS TABLE HEADER ---
  const tableTop = doc.y;

  doc
    .rect(45, tableTop, 505, 20)
    .fill('#E8EFE9');

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#1B382B')
    .text('PRODUCT FORMULATION', 55, tableTop + 5)
    .text('SKIN PROFILE', 270, tableTop + 5)
    .text('QTY', 370, tableTop + 5)
    .text('UNIT (LKR)', 415, tableTop + 5)
    .text('SUBTOTAL (LKR)', 460, tableTop + 5, { align: 'right', width: 85 });

  let currentY = tableTop + 26;

  // --- ITEMS LIST ---
  items.forEach((item) => {
    const itemName = String(item.product_name || item.name || `Formulation #${item.product_id || ''}`);
    const skinProfile = String(item.target_skin_type || 'Botanical Care');
    const quantity = String(item.quantity || 1);
    const unitPrice = Number(item.unit_price || item.price_at_purchase || item.price || 0);
    const subtotal = Number(item.subtotal || unitPrice * Number(quantity));

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor('#161D1A')
      .text(itemName, 55, currentY, { width: 200 });

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#78716C')
      .text(skinProfile, 270, currentY)
      .text(quantity, 375, currentY)
      .text(unitPrice.toFixed(2), 415, currentY);

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor('#1B382B')
      .text(subtotal.toFixed(2), 450, currentY, { width: 95, align: 'right' });

    const extraDetails = String(item.key_ingredients || item.benefits || '').trim();
    if (extraDetails) {
      currentY += 13;
      doc
        .font('Helvetica-Oblique')
        .fontSize(7)
        .fillColor('#8A8580')
        .text(`Key Actives & Benefits: ${extraDetails}`, 55, currentY, { width: 480 });
    }

    currentY += 20;

    doc
      .strokeColor('#F3F6F4')
      .lineWidth(0.5)
      .moveTo(45, currentY - 4)
      .lineTo(550, currentY - 4)
      .stroke();
  });

  // --- TOTAL SUMMARY ---
  doc.y = currentY + 8;
  const summaryY = doc.y;

  doc
    .rect(340, summaryY, 210, 60)
    .fillAndStroke('#FBF9F5', '#E8EFE9');

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#57534E')
    .text('Delivery & Climate Shielding:', 350, summaryY + 12)
    .text('FREE (LKR 0.00)', 460, summaryY + 12, { align: 'right', width: 80 });

  doc
    .strokeColor('#E8EFE9')
    .lineWidth(0.5)
    .moveTo(350, summaryY + 28)
    .lineTo(540, summaryY + 28)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor('#1B382B')
    .text('Grand Total:', 350, summaryY + 36);

  doc
    .font('Helvetica-Bold')
    .fontSize(11.5)
    .fillColor('#142A20')
    .text(`LKR ${totalAmount}`, 430, summaryY + 34, { align: 'right', width: 110 });

  // --- RESTORATIVE INSTRUCTIONS FOOTER ---
  doc.y = summaryY + 75;

  doc
    .rect(45, doc.y, 505, 50)
    .fill('#E8EFE9');

  const footerNoticeY = doc.y + 8;
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor('#1B382B')
    .text('CLIMATE-CONTROLLED STORAGE & COURIER RECEIPT NOTICE', 55, footerNoticeY);

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#425B4E')
    .text(
      `Store hydrogel masks and sleep pods below 25°C, away from direct sunlight. Inspect the seal upon receipt. You can track this parcel live on fancystore.lk using Track No. ${trackingNumber}.`,
      55,
      footerNoticeY + 13,
      { width: 485 }
    );

  doc.end();
}