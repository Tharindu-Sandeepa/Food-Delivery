const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, userName, orderDetails) => {
  try {
    const { orderId, items, total, restaurantName } = orderDetails;

    await transporter.sendMail({
      from: `"DS Food App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - Order #${orderId}`,
      html: `
        <h2>Hello, ${userName}!</h2>
        <p>Thank you for your order from ${restaurantName}. Your order has been successfully placed.</p>
        <h3>Order Details</h3>
        <ul>
          ${items
            .map(
              (item) =>
                `<li>${item.name} x${item.quantity} - $${item.price.toFixed(2)}</li>`
            )
            .join('')}
        </ul>
        <p><strong>Total:</strong> $${total.toFixed(2)}</p>
        <p>Track your order at <a href="${process.env.FRONTEND_URL}/orders/${orderId}">View Order</a>.</p>
        <p>Thank you for choosing DS Food!</p>
      `,
    });
  } catch (err) {
    console.error('Order confirmation email error:', err);
    throw new Error('Order confirmation email could not be sent');
  }
};

// Send delivery completion email
const sendDeliveryCompletionEmail = async (email, userName, orderId) => {
  try {
    await transporter.sendMail({
      from: `"DS Food App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order #${orderId} Delivered`,
      html: `
        <h2>Hello, ${userName}!</h2>
        <p>Great news! Your order #${orderId} has been successfully delivered.</p>
        <p>We hope you enjoy your meal! View details at <a href="${process.env.FRONTEND_URL}/orders/${orderId}">View Order</a>.</p>
        <p>Thank you for choosing DS Food!</p>
      `,
    });
  } catch (err) {
    console.error('Delivery completion email error:', err);
    throw new Error('Delivery completion email could not be sent');
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendDeliveryCompletionEmail,
};