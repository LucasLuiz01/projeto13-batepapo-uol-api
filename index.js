import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
//Configurando dotenv
dotenv.config();
//Configurando APP
const app = express();
app.use(express.json());
app.use(cors());

//Configurando Mongo
const mongoClient = new MongoClient(process.env.MONGO_URL);
//Criando Variaveis Globais
let db;
let messages;
let participantes;
//Conectando mongo
mongoClient.connect().then(() => {
  db = mongoClient.db("batepapo");
  messages = db.collection("messages");
  participantes = db.collection("participante");
});

//Rotas post
app.post("/participantes", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(422).send("Insira um nome válido");
    return;
  }
  try {
    await participantes.insertOne({ name, lastStatus: Date.now() });
    res.status(201).send("Participante Criado");
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const { user } = req.headers;
  try {
    await messages.insertOne({ from: user, to, text, type });
    res.status(201).send("Mensagem enviada");
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
app.post("/status", async (req, res) => {
  const { user } = req.headers;
  try {
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

//Rotas get
app.get("/participantes", async (req, res) => {
  try {
    let listaParticipantes = await participantes.find().toArray();
    res.status(201).send(listaParticipantes);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/messages", async (req, res) => {
    const limit = parseInt(req.query.limit);
    console.log(limit)
    if(limit){
        try {
            const listaMessages = await messages.find().toArray();
            res.status(201).send(listaMessages.slice(-limit));
            return;
          } catch (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          }
    }
  try {
    const listaMessages = await messages.find().toArray();
    res.status(201).send(listaMessages);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(5000);
