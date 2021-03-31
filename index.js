const TelegramBot = require('node-telegram-bot-api');
const token = require('./token.js');
const axios = require('axios');
console.log('Bot has been started');
let currencyHTML = null;
let hostSite = 'https://currency-uah-bot.herokuapp.com';
const bot = new TelegramBot(token, 
	{	webHook: {
			port: 443,
			host: '0.0.0.0'
		},
	}
);
bot.setWebHook(hostSite+':443/bot'+token);
bot.on("polling_error", console.error);

function chatId(msg){
	return msg.chat.id;
}
function getCurrency(){
	axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
	  .then(res=>{
	  	currencyData = res;
	  })
	  .catch( (err)=>console.log(err) )

}



bot.on('callback_query', (query)=>{
	const chatId = query.message.chat.id;
	function sendCurrency(){
			currencyHTML = `<i>Курс <b>${currencyName}</b>:</i>
		<b>Купівля:</b> ${Math.round(buy*100)/100} грн
		<b>продаж:</b> ${Math.round(sale*100)/100} грн`;
		bot.sendMessage(chatId, currencyHTML, {parse_mode:'HTML'});
	}
	switch (query.data) {
		case 'usd':
			buy = currencyData.data.find(item=>item.ccy==='USD').buy;
		  	sale = currencyData.data.find(item=>item.ccy==='USD').sale;
		  	currencyName = 'Долара';
		  	sendCurrency()
		break;
		case 'euro':
			buy = currencyData.data.find(item=>item.ccy==='EUR').buy;
		  	sale = currencyData.data.find(item=>item.ccy==='EUR').sale;
		  	currencyName = "Євро"
		  	sendCurrency()
		break;
		case 'rub':
			buy = currencyData.data.find(item=>item.ccy==='RUR').buy;
		  	sale = currencyData.data.find(item=>item.ccy==='RUR').sale;
		  	currencyName = "Рубля"
			sendCurrency()
		break;
		// case 'btc': 
		// 	buy = currencyData.data.find(item=>item.ccy==='BTC').buy;
		//   	sale = currencyData.data.find(item=>item.ccy==='BTC').sale;
		//   	currencyName = "Біткоїну"
		// 	sendCurrency()
		// break;
	}
})
bot.on('message', msg=>{
	getCurrency()
	let howToWrite= `Напишіть бажану конвертацію у форматі: <i>120.25 usd uah</i>
Доступні валюти: <b>usd, euro, rub</b>
*конвертація лише до гривні`;
	switch (msg.text) {
		case '/help':
		case '/start':
			bot.sendMessage(chatId(msg), "Оберіть дію", {
				reply_markup: {
					keyboard: [
						['Курс'], ['Конвертація валют']
					]
				}
			});

			break;
		case 'Курс':
			getCurrency();
			bot.sendMessage(chatId(msg), "Яка валюта цікавить?",{
				reply_markup: {
					inline_keyboard:[
					[
						{
							text: "Долар",
							callback_data: 'usd'
						},
						{
							text: "Євро",
							callback_data: 'euro',
						}
					],
					[
						{
							text: "Рубль",
							callback_data: 'rub'
						},
						// {
						// 	text: "Біткоїн",
						// 	callback_data: 'btc'
						// }
					]
					] 
				}
			})
			// statements_1
			break;
		case 'Конвертація валют':
			bot.sendMessage(chatId(msg), howToWrite, {
			parse_mode: "HTML"
		})
			break;
		default: 
		let str = msg.text;
		let [value, currencyFrom, currencyTo] = str.split(' ');
		// console.log('value:',value, 'currencyFrom:',currencyFrom, 'currencyTo:',currencyTo);
		if (currencyTo && currencyTo.toLowerCase()==="uah"){
			if (currencyFrom.toLowerCase()==="usd"){
				getCurrency()
				let usdSale = currencyData.data.find(item=>item.ccy==='USD').buy;
				bot.sendMessage(chatId(msg), `${value} x ${ Math.round(usdSale*100)/100} = ${value*usdSale} грн`, {parse_mode: "HTML"})
			}
			if (currencyFrom.toLowerCase()==="euro"){
				getCurrency()
				let euroSale = currencyData.data.find(item=>item.ccy==='EUR').buy;
				bot.sendMessage(chatId(msg), `${value} x ${ Math.round(euroSale*100)/100} = ${value*euroSale} грн`, {parse_mode: "HTML"})
			}
			if( currencyFrom.toLowerCase()==="rub"){
				getCurrency()
				let rubSale = currencyData.data.find(item=>item.ccy==='RUR').buy;
				bot.sendMessage(chatId(msg), `${value} x ${ Math.round(rubSale*100)/100} = ${value*rubSale} грн`, {parse_mode: "HTML"})
			}
		}else if (currencyFrom && currencyFrom.toLowerCase()==="uah"){
			if (currencyTo.toLowerCase() == "usd"){
				getCurrency()
				let usdBuy = currencyData.data.find(item=>item.ccy==='USD').sale;
				bot.sendMessage(chatId(msg), `${value} / ${ Math.round(usdBuy*100)/100} = ${Math.round(value*1000/usdBuy)/1000} дол`, {parse_mode: "HTML"})
			}
			if (currencyTo.toLowerCase() == "euro"){
				getCurrency()
				let euroBuy = currencyData.data.find(item=>item.ccy==='EUR').sale;
				bot.sendMessage(chatId(msg), `${value} / ${ Math.round(euroBuy*100)/100} = ${Math.round(value*1000/euroBuy)/1000} євро`, {parse_mode: "HTML"})
			}
			if (currencyTo.toLowerCase() == "rub"){
				getCurrency()
				let rubBuy = currencyData.data.find(item=>item.ccy==='RUR').sale;
				bot.sendMessage(chatId(msg), `${value} / ${ Math.round(rubBuy*100)/100} = ${Math.round(value*1000/rubBuy)/1000} руб`, {parse_mode: "HTML"})
			}
		}else{
				bot.sendMessage(chatId(msg), `Переконайтесь в правильності написання: 
${howToWrite}`, {parse_mode:"HTML"})
		}
		// console.log(str);
		// bot.sendMessage(chatId(msg),str);	
	}
})


