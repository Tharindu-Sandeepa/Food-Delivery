const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
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
      from: `"FoodDash" <${process.env.GMAIL_USER}>`,
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
        <p>Track your order at <a href="${process.env.FRONTEND_URL}/orders/">View Order</a>.</p>
        <p>Thank you for choosing DS Food!</p>
      `,
    });
  } catch (err) {
    console.error('Order confirmation email error:', err);
    throw new Error('Order confirmation email could not be sent');
  }
};

// Send order details to restaurant
const sendOrderDetailsToRestaurant = async (email, orderDetails) => {
  try {
    const { orderId, items, total, userName } = orderDetails;

    await transporter.sendMail({
      from: `"FoodDash" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `New Order Received - Order #${orderId}`,
      html: `
        <h2>New Order Received!</h2>
        <p>You have a new order from ${userName}.</p>
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
        <p>View order details at <a href="${process.env.FRONTEND_URL}/admin">View Order</a>.</p>
      `,
    });
  } catch (err) {
    console.error('Order details email error:', err);
    throw new Error('Order details email could not be sent');
  }
};

// Send delivery completion email
const sendDeliveryCompletionEmail = async (email, userName, orderId) => {

  console.log("Sending delivery completion email to:", email);
  console.log("from", `"FoodDash" <${process.env.GMAIL_USER}>`)

  try {
    await transporter.sendMail({
      from: `"FoodDash" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Order #${orderId} Delivered`,
      html: `
        <h2>Hello, ${userName}!</h2>
        <p>Great news! Your order #${orderId} has been successfully delivered.</p>
        <p>We hope you enjoy your meal! View details at <a href="${process.env.FRONTEND_URL}/orders">View Order</a>.</p>
        <p>Thank you for choosing DS Food!</p>
      `,
    });

    console.log("Delivery completion email sent successfully to:", email);
    
  } catch (err) {
    console.error('Delivery completion email error:', err);
    throw new Error('Delivery completion email could not be sent');
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendDeliveryCompletionEmail,
  sendOrderDetailsToRestaurant,
};