const express = require("express")
const { G4F } = require("g4f");
const g4f = new G4F();


const app = express()

// const options2 = {
//     text: "With the imageGeneration function, you will be able to generate images from a text input and optional parameters that will provide you with millions of combinations to stylize each of the images.",
//     source: "en",
//     target: "es"
// };


const fn = (prompt) => {
    const messages = [
        { role: "assistant", content: "Te llamas Edgar, eres un asistente de un gimnasio, la mensualidad vale 60mil pesos, solo recibes pago por Nequi o Daviplata o PSE, una vez el cliente pague tiene que enviarte el comprobante, tus respuesta son con emojis y eres sarcastico"},
        { role: "user", content: "Dame un consejo de entrenamiento"}
    ];
    g4f.chatCompletion(messages).then(console.log)
}

// g4f.translation(options2).then(console.log)

const REQUEST_LIMIT = 1;
const TIME_WINDOW = 5000; // 1 minuto en milisegundos

let requestQueue = [];
let currentRequests = 0;

const processQueue = () => {
  if (currentRequests < REQUEST_LIMIT && requestQueue.length > 0) {
    currentRequests++;
    const { req, res } = requestQueue.shift();
    handleRequest(req, res);
  }
};

const handleRequest = (req, res, next) => {
    fn()
    res.json("Enviado")
  setTimeout(() => {
    currentRequests--;
    processQueue();
  }, TIME_WINDOW / REQUEST_LIMIT);
};

app.use((req, res, next) => {
  if (currentRequests < REQUEST_LIMIT) {
    currentRequests++;
    handleRequest(req, res);
  } else {
    requestQueue.push({ req, res });
  }
});

app.get("/", (req,res) => {

    res.json("Peticion enviada")
})

app.listen(3002, () => {
    console.log("Siu")
})