import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure SMTP transport (defaults to console sandbox if credentials aren't set)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendOrderConfirmationEmail(orderData) {
  const {
    order_id,
    customer_name,
    customer_email,
    shipping_address,
    payment_method,
    total_amount,
    items = [],
  } = orderData;

  const itemsHtml = items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #E8EFE9;">
          <td style="padding: 10px 0; font-size: 13px; color: #161D1A;">
            <strong>${item.name || `Product #${item.product_id}`}</strong>
            <div style="font-size: 11px; color: #78716C;">Qty: ${item.quantity}</div>
          </td>
          <td style="padding: 10px 0; font-size: 13px; text-align: right; font-weight: bold; color: #1B382B;">
            LKR ${(Number(item.price || item.unit_price) * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join('');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FBF9F5; border: 1px solid #E8EFE9; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #142A20; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-family: serif; font-size: 24px; letter-spacing: -0.5px; color: #EFE3C3;">Fancy Store</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C5A059;">Botanical Science Care</p>
      </div>

      <div style="padding: 32px 24px;">
        <h2 style="font-size: 20px; font-family: serif; color: #161D1A; margin-top: 0;">Order Confirmed • #${order_id}</h2>
        <p style="font-size: 13px; color: #57534E; line-height: 1.6;">
          Dear ${customer_name},<br/>
          Thank you for trusting Fancy Store. Your clinical routine formulations are packaged in climate-controlled shielding and queued for islandwide dispatch.
        </p>

        <div style="background-color: white; border-radius: 12px; border: 1px solid #E8EFE9; padding: 16px; margin: 20px 0;">
          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #C5A059; margin-top: 0; margin-bottom: 12px;">Enclosed Formulations</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 14px 0 0 0; font-size: 14px; font-weight: bold; color: #161D1A;">Grand Total</td>
              <td style="padding: 14px 0 0 0; font-size: 16px; font-weight: bold; text-align: right; color: #1B382B; font-family: serif;">
                LKR ${Number(total_amount).toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <div style="font-size: 12px; color: #78716C; line-height: 1.6; background-color: #E8EFE9; padding: 14px; border-radius: 10px;">
          <strong>Shipping Details:</strong><br/>
          ${shipping_address}<br/>
          Payment Method: <span style="text-transform: capitalize;">${payment_method.replace(/_/g, ' ')}</span>
        </div>

        <p style="font-size: 12px; color: #78716C; text-align: center; margin-top: 24px;">
          Track dispatch status anytime by visiting our portal with your order ID <strong>#${order_id}</strong>.
        </p>
      </div>
    </div>
  `;

  // If no SMTP user is provided in .env, simulate by logging cleanly
  if (!process.env.SMTP_USER) {
    console.log(`📨 [Email Simulated] Order confirmation sent to ${customer_email} for Order #${order_id}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Fancy Store Botanical" <${process.env.SMTP_USER}>`,
      to: customer_email,
      subject: `Order #${order_id} Confirmed • Fancy Store Botanical Care`,
      html: htmlContent,
    });
    console.log(`✅ Confirmation email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed sending email:', error.message);
    return { success: false, error: error.message };
  }
}