const xendit = require('./xendit')

const { Invoice } = xendit;
const invoiceSpecificOptions = {};
const tagihan = new Invoice(invoiceSpecificOptions);

(async () => {
    try {
        let invoice = await tagihan.createInvoice({
            externalID: Date.now().toString(),
            payerEmail: 'example@gmail.com',
            description: 'Invoice for Shoes Purchase',
            amount: 100000,
            customer: {
              given_names: 'xen customer',
              email: 'example@gmail.com',
            },
            customerNotificationPreference: {
              invoice_created: ['email'],
            },
          });
          console.log('created invoice', invoice); // eslint-disable-line no-console
    } catch (error) {
        console.error(e); // eslint-disable-line no-console
        process.exit(1);
    }
}) 
