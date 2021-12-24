require('dotenv').config({ path: '../.env' })

const { Telegraf } = require('telegraf')
const axios = require('axios')
const NodeCache = require("node-cache")

const baseApiUrl = process.env.BASE_API_URL
const tokenTelegram = process.env.TOKEN_TELEGRAM
const chatGroupTelegram = process.env.CHAT_GROUP_TELEGRAM

const trajeto = process.env.TRAJETO
const cidadeOrigem = process.env.CIDADE_ORIGEM
const idEmbarque = process.env.ID_EMBARQUE
const cidadeDestino = process.env.CIDADE_DESTINO
const idDesembarque = process.env.ID_DESEMBARQUE
const dataIda = process.env.DATA_IDA
const dataVolta = process.env.DATA_VOLTA

const myCache = new NodeCache()
const bot = new Telegraf(tokenTelegram)

let intervalid

async function obter() {
    let msgs = []
    const body = {
        "trajeto": trajeto,
        "cidadeOrigem": cidadeOrigem,
        "id-embarque": idEmbarque,
        "cidadeDestino": cidadeDestino,
        "id-desembarque": idDesembarque,
        "dataIda": dataIda,
        "dataVolta": dataVolta,
        "containerId": "content"
    }
    const res = await axios.post(`${baseApiUrl}/action?name=usc001PesquisarViagens`, body)
    const data = res.data;
    const palavraChave = 'showError("';
    const texto = data.length < 1000 ? data.substring(data.indexOf(palavraChave) + 11, data.length - 5) : `PASSAGEM ENCONTRADA para o dia ${dataIda}`
    msgs.push(`${texto}`)
    return msgs
}

bot.start((ctx) => {
    const chatId = ctx.message.chat.id
    ctx.reply(" Bem vindo! " + chatId)
})

bot.command('obter', async (ctx, next) => {
    intervalid = setInterval(() => {
        new Promise(function (resolve, reject) {
            resolve(obter())
        }).then(res => {
            res.forEach(element => {
                //ctx.telegram.sendMessage(chatGroupTelegram, element)
                ctx.reply(element)
            })
        })
    }, 10000)
})

bot.command('parar', (ctx) => {
    clearInterval(intervalid)
})

bot.launch()