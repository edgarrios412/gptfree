const express = require("express")
const { G4F } = require("g4f");
const g4f = new G4F();
const cron = require("node-cron")

const app = express()

// const options2 = {
//     text: "With the imageGeneration function, you will be able to generate images from a text input and optional parameters that will provide you with millions of combinations to stylize each of the images.",
//     source: "en",
//     target: "es"
// };

const fn = async (theme) => {
    const messages = [
        { role: "assistant", content: "Eres programador y experto trabajando con JSON"},
        { role: "user", content: `Genera un test de 10 preguntas, con 3 respuestas falsas y una respuesta verdadera, tu respuesta debe ser un JSON con esta estructura {preguntas:[{"pregunta": "¿Dónde nació Nicolás Maduro?", "respuesta_correcta": "b", "respuestas": {"a":"China","b":"Venezuela","c":"Mexico","d":"Estados Unidos"}}]} debes evitar cometer errores y no debes repetir preguntas o opciones de respuestas y el tema es: ${theme}`}
    ];
    const response = await g4f.chatCompletion(messages)
    return response
}

// g4f.translation(options2).then(console.log)

app.get("/generateQuiz", async (req,res) => {
    const {theme} = req.query
    const response = await fn(theme)
    res.json(JSON.parse(response))
})

app.get("/activate", async (req,res) => {
    console.log("Activado por TELDIP BACKEND")
    res.json("Activado")
})

app.listen(3001, () => {
    console.log("Escuchando en el puerto 3001")
})