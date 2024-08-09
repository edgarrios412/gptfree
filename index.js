require("dotenv").config();
const { default: axios } = require("axios");
const express = require("express");
const { G4F } = require("g4f");
const g4f = new G4F();
const http = require("http");
const PORT = process.env.PORT;
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const usersInRoom = {};

io.on("connection", (socket) => {
  // ENVIAMOS UN MENSAJE CUANDO ALGUIEN SE CONECTA
  console.log(`${socket.id} se ha conectado`);
  socket.on("quiz", (msg) => {
    console.log("Se ha creado un QUIZ:", msg);
    io.emit("quiz", msg);
  });

  socket.on("disconnectSala", (msg) => {
    console.log("DESCONEXION DETECTADA")
    let sala;
    const salasDelUsuario = Object.keys(usersInRoom)?.filter(salaId => {
        return usersInRoom[salaId]?.some(user => user.socketId === socket.id);
    });

    // Elimina al usuario de cada sala
    salasDelUsuario.forEach(salaId => {
        usersInRoom[salaId] = usersInRoom[salaId]?.filter(user => user.socketId !== socket.id);
        io.emit(salaId, usersInRoom[salaId]);
        console.log("SALA DONDE SALIO:",salaId)
        console.log("USUARIOS RESTANTES:",usersInRoom[salaId])
    });
    // NOTIFICAR Y ACTUALIZAR LA SALA
    // return io.emit(sala, usersInRoom[sala]);
  })

  socket.on("sala", (msg) => {
    console.log("MENSAJE: ", msg)
    if (msg.connected) {
      // CUANDO ALGUIEN SE CONECTA A LA SALA
      usersInRoom[msg.salaId] = usersInRoom[msg.salaId] || [];
      usersInRoom[msg.salaId].push({ ...msg, socketId: socket.id });
      console.log(`${msg.nombre} se ha unido a la sala ${msg.salaId}`);
      return io.emit(msg.salaId, usersInRoom[msg.salaId]);
    } else {
      // CUANDO ALGUIEN SE DESCONECTA DE LA SALA
      usersInRoom[msg.salaId] = usersInRoom[msg.salaId]?.filter(
        (user) => user.socketId !== socket.id
      );
      console.log(`${msg.nombre} ha abandonado la sala`);
      // ENVIAMOS LOS USUARIOS QUE ESTÁN EN LA SALA
      return io.emit(msg.salaId, usersInRoom[msg.salaId]);
    }
  });

  socket.on("loadingQuiz", (msg) => {
    console.log("Creando QUIZ:", msg);
    io.emit("loadingQuiz", msg);
  });
  socket.on("respuesta", (msg) => {
    console.log("Respuesta de " + socket.id + ":", msg);
    io.emit("respuesta", msg);
  });

  // ESCUCHAMOS CUANDO ALGUIEN SE DESCONECTA
  socket.on("disconnect", (reason) => {
    console.log(`Un usuario se ha desconectado: ${reason}`);
    // Aquí puedes realizar acciones adicionales, como eliminar al usuario de una sala
  });

  // ESCUCHAMOS CUANDO ALGUIEN TIENE UN ERROR
  socket.on("error", (err) => {
    console.error("Error en la conexión:", err);
  });
});

io.on("disconnect", (msg) => {
  console.log("Un usuario se ha desconectado");
});

// const options2 = {
//     text: "With the imageGeneration function, you will be able to generate images from a text input and optional parameters that will provide you with millions of combinations to stylize each of the images.",
//     source: "en",
//     target: "es"
// };

const fn = async (theme) => {
  const messages = [
    {
      role: "assistant",
      content: "Eres programador y experto trabajando con JSON",
    },
    {
      role: "user",
      content: `Genera un test de 10 preguntas, con 3 respuestas falsas y una respuesta verdadera, tu respuesta debe ser un JSON con esta estructura {preguntas:[{"pregunta": "¿Dónde nació Nicolás Maduro?", "respuesta_correcta": "b", "respuestas": {"a":"China","b":"Venezuela","c":"Mexico","d":"Estados Unidos"}}]} debes evitar cometer errores y no debes repetir preguntas o opciones de respuestas y el tema es: ${theme}`,
    },
  ];
  const response = await g4f.chatCompletion(messages);
  return response;
};

// g4f.translation(options2).then(console.log)

app.get("/generateQuiz", async (req, res) => {
  const { theme } = req.query;
  console.log(theme);
  const response = await fn(theme);
  res.json(JSON.parse(response));
});

app.get("/activate", async (req, res) => {
  console.log("Activado por TELDIP BACKEND");
  res.json("Activado");
});

server.listen(PORT, () => {
  console.log("Escuchando en el puerto " + PORT);
});
