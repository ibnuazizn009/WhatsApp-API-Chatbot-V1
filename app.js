const { Client } = require('whatsapp-web.js');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors: {origin: "*"}});
const qrcode = require('qrcode');
const fs = require('fs');
require('dotenv').config();


// Xendit
const xendit = require('./helpers/xendit');
// Invoice Xendit
const { Invoice } = xendit;
const invoiceSpecificOptions = {};
const tagihan = new Invoice(invoiceSpecificOptions);

const kategori = require('./models/kategori');
const product = require('./models/product');

const chatReply = require('./helpers/replyChat');
const authAPI = require('./middlewares/auth')
// Mongoose Connection

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var mongoString = "mongodb+srv://EnkripsiAES128:enkripsiAES128@cluster0.3yt2b.gcp.mongodb.net/chatbot-whatsApp-V1?retryWrites=true&w=majority"

mongoose.connect(mongoString, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
})

mongoose.connection.on("error", function(error) {
  console.log(error)
});

mongoose.connection.on("open", function() {
  console.log("Connected to MongoDB database.")
});



const SESSION_FILE_PATH = './chatbot-whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Methods`, `GET, HEAD, PATCH, PUT, POST, DELETE, OPTIONS`);
    res.header(`Access-Control-Allow-Headers`, `Authorization, Origin, X-Requested-With, Content-Type, Accept, X-Access-Token, X-Key`);
    if (req.method === `OPTIONS`) {
      res.status(200).end();
    } else {
      next();
    }
});

app.get('/', async (req, res)=>{
    res.render('index', {
        title: 'Chatbot-WhatsApp-API',
        root: __dirname,
    })
})


app.get('/kategori', async (req, res)=>{
    const thisKategori = await chatReply.getKategori()
    res.send(thisKategori)
})

app.get('/keyword', async (req, res)=>{
    const thisKeyword = await chatReply.getKeywordAndProduct()
    res.send(thisKeyword)
})

// add kategori
app.get('/add-kategori', (req, res)=>{
    res.render('add-kategori')
})
app.post('/add-kategori', (req, res)=>{

    req.headers.authorization
    const category = new kategori({
		_id: new mongoose.Types.ObjectId(),
		keyword: req.body.keyword,
        message: req.body.message
		
    });
    category
	.save()
	.then(result => {
		console.log(result);
		res.status(201).json({
		message: 'Created Kategori successfully',
		createdKategori: {
			keyword: result.keyword,
            message: result.message,
			_id: result._id,
			reqeust: {
				type: 'POST',
			}
		}
	});
	}).catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});
})

// add product
app.get('/add-product', (req, res)=>{
    res.render('add-product')
})
app.post('/add-product', async (req, res)=>{

      // Create a new message
      const newProduct = new product(req.body)
      // get userId
      const category = await kategori.findById({_id: req.body.id})
      // assign a message as a dari
      newProduct.kategori = category;
      // save a message
      await newProduct
	    .save()
	    .then(result => {
		console.log(result);
		res.status(201).json({
		message: 'Created Product successfully',
		createdProduct: {
			keyword: result.keyword,
            message: result.message,
            price: result.price,
            currency: result.currency,
			_id: result._id,
			reqeust: {
				type: 'POST',
			}
		}
	});
	}).catch(err => {
		console.log(err);
		res.status(500).json({
			error: err
		});
	});

      // add Message to the user messages array
      category.product.push(newProduct)
      
      await category.save()
})

app.get('/create-invoice', async (req, res)=>{
    res.render('create-invoice')
})

// app.post('/create-invoice', authAPI, async (req, res) =>{
//     try {
//         let invoice = await tagihan.createInvoice({
//             externalID: `invoice-${Date.now().toString()}`,
//             payerEmail: req.body.email,
//             description: req.body.description,
//             amount: req.body.total,
//             customer: {
//               given_names: req.body.name,
//               email: req.body.email,
//             },
//             customerNotificationPreference: {
//               invoice_created: ['email'],
//             },
//           });
//           res.send(invoice);
//           console.log('created invoice', invoice); // eslint-disable-line no-console
//     } catch (error) {
//         console.error(e); // eslint-disable-line no-console
//         process.exit(1);
//     }
// })

const client = new Client({
    restartOnAuthFail: true, 
    puppeteer: { 
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],
    }, session: sessionCfg });


client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});


client.on('message', async msg => {
    const keyword = msg.body;
    const category = await chatReply.reply(keyword)

    switch (keyword) {
        case category !== false:
            msg.reply(category)
            break;
    
        default:
            break;
    }
});

client.initialize();


// Socket IO
io.on('connection', (socket)=>{
    socket.emit('message', 'Connecting...');

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url)=>{
            socket.emit('qr', url);
            socket.emit('message', 'QR Code recived scan now!')
        });
    });
    client.on('ready', () => {
        socket.emit('ready', 'WhatsApp QR Ready')
        socket.emit('message', 'WhatsApp QR Ready')
    });

    client.on('authenticated', (session) => {
        socket.emit('authenticated', 'WhatsApp QR authenticated')
        socket.emit('message', 'WhatsApp QR authenticated')
        console.log('AUTHENTICATED', session);
        sessionCfg=session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
            if (err) {
                console.error(err);
            }
        });
    });
})


server.listen(4000, ()=>{
    console.log('Server Running...')
})