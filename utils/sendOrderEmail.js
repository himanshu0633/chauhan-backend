// const nodemailer = require('nodemailer');

// const sendOrderEmail = async (toEmail, orderData) => {
//     const recipients = [toEmail];

//     if (toEmail !== process.env.EMAIL_USERNAME) {
//         recipients.push(process.env.EMAIL_USERNAME);
//     }
//     console.log("Email User:", process.env.EMAIL_USERNAME);

//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD,
//         },
//     });

//     const { items, totalAmount, _id: orderId, address, phone } = orderData;

//     const itemList = items.map(item => `
//     <li>
//       <strong>${item.name}</strong> - Qty: ${item.quantity}, Price: ₹${item.price}
//     </li>
//   `).join('');

//     const mailOptions = {
//         from: `"Chauhan Sons Jewellers" <${process.env.EMAIL_USERNAME}>`,
//         to: recipients,
//         subject: `🧾 Order Confirmation - Order #${orderId}`,
//         html: `
//       <h2>Thank you for your order!</h2>
//       <p>Your order has been placed successfully.</p>
//       <h3>Order Details:</h3>
//       <ul>${itemList}</ul>
//       <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
//       <p><strong>Shipping Address:</strong> ${address}</p>
//       <p><strong>Phone:</strong> ${phone}</p>
//       <br/>
//       <p>We'll notify you when your order is shipped.</p>
//       <p>Best regards,<br/>Chauhan Sons Jewellers</p>
//     `
//     };

//     return transporter.sendMail(mailOptions);
// };

// module.exports = sendOrderEmail;
