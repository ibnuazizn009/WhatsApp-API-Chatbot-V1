// https://api.xendit.co/balance
// https://api.xendit.co/v2/invoices
// https://api.xendit.co/v2/invoices

// {
// 	"external_id": "invoice-{{$timestamp}}",
// 	"amount": 5100,
// 	"payer_email": "ibnuazizn@gmail.com",
// 	"description": "Invoice Demo #123",
//     "invoice_duration": 3600,
//     "currency": "IDR",
//     "should_send_email": true,
//     "customer": {
//       "given_names": "Ibnu Aziz",
//       "email": "ibnuazizn@gmail.com",
//       "mobile_number": "+6285703817090"  
//     },
//      "customer_notification_preference": {
//         "invoice_created": ["email","whatsapp"],
//         "invoice_reminder": ["email", "whatsapp"],
//         "invoice_paid": ["email", "whatsapp"],
//         "invoice_expired": ["email", "whatsapp"]
//     },
//     "items":[{
//         "name": "Baju",
//         "quantity": 6,
//         "price": 10000
//     }],
//     "fees": [{
//         "type": "ADMIN",
//         "value": 1000
//     }]
// }
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const btoa = require('btoa')
const xendit = require('./helpers/xendit')
const { Invoice } = xendit;
const invoiceSpecificOptions = {};
const tagihan = new Invoice(invoiceSpecificOptions);
require("dotenv").config();


const invoice = {
	external_id: `invoice-${Date.now().toString()}`,
	amount: 900000,
	payer_email: "ibnuazizn@gmail.com",
	description: "Invoice Demo #123",
    invoice_duration: 3600,
    currency: "IDR",
    should_send_email: true,
    customer: {
      given_names: "Ibnu Aziz",
      email: "ibnuazizn@gmail.com",
      mobile_number: "+6285703817090"  
    },
     customer_notification_preference: {
        invoice_created: ["email","whatsapp"],
        invoice_reminder: ["email", "whatsapp"],
        invoice_paid: ["email", "whatsapp"],
        invoice_expired: ["email", "whatsapp"]
    },
    items:[{
        name: "Compass",
        quantity: 6,
        price: 150000
    }],
    fees: [{
        type: "ADMIN",
        value: 1000
    }]
}

let url = 'https://api.xendit.co/v2/invoices';

fetch(url, {
    method: 'POST',
    body: JSON.stringify(invoice),
    credentials: 'same-origin',
    redirect: 'follow',
    agent: null,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${process.env.XENDIT_SECRET_KEY}: '' `),
    }
})
.then(res => res.json())
    .then(json => {
        console.log("First user in the array:");
        console.log(json);
    });

console.log('created invoice', invoice);
