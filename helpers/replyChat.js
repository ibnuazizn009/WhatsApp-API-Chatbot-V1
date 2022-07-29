const kategori = require('../models/kategori');
const product = require('../models/product');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const btoa = require('btoa')
const xendit = require('./xendit')
const { Invoice } = xendit;
const invoiceSpecificOptions = {};
const tagihan = new Invoice(invoiceSpecificOptions);

require("dotenv").config();

const reply = async (keyword) => {
    const kategori = await getKategori(keyword)
    if(kategori){
        return kategori
    }
}

const getKategori = async (keyword) =>{
    const category = await kategori.find()
    .select('_id keyword message');
    if(category.length > 0){
        if(keyword == 'Hai' || keyword == 'Salam' || keyword == 'B')
        return `Hallo Saya Bot WhatsApp dari resto (name of resto), ada yang bisa saya bantu? \ndibawah adalah kategori yang tersedia di resto kami\n1. ${category[0].keyword}\n2. ${category[1].keyword}\n3. ${category[2].keyword}\n\nSilahkan pilih kategori yang ingin anda order`
    }
}
module.exports = {
   reply,
   getKategori

}