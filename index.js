//Importando bibliotecas
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";
//Configurando dotenv
dotenv.config();
//Funcao delete SetInterval
setInterval(async ()=>{
  console.log("apaguei");
 const lista = await participantes.find().toArray();
 const apagar = await participantes;
 const menssagem = await messages;
 lista.map((usuario)=>{
  const horario = usuario.lastStatus;
  if((Date.now() - horario)/1000 >= 10){
    let now =dayjs().format("HH:mm:ss");
     apagar.deleteOne(usuario);
     menssagem.insertOne({ from: usuario.name, to: 'Todos', text: 'sai da sala...', type: 'status', time: now});
  }
 } )
}, 15000);


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

//Criando Variaveis Globais com o Joi
const participantesSchena = joi.object({
  name: joi.string().required().min(3),
});
const messagesSchena = joi.object({
  to: joi.string().required().min(2),
  text: joi.string().required().min(2),
  type: joi.string().required().valid("message", "private_message")
})
//Conectando mongo
mongoClient.connect().then(() => {
  db = mongoClient.db("batepapo");
  messages = db.collection("messages");
  participantes = db.collection("participants");
});

//Rotas post
app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const validation = participantesSchena.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    const erro = validation.error.details.map((detail) => detail.message);
    console.log(erro)
    res.status(422).send(erro);
    return;
  }
  const validacao = await participantes.find({ name }).toArray();
  if (validacao.length !== 0) {
    res.sendStatus(409);
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
  let now =dayjs().format("HH:mm:ss");
  
  const validations = messagesSchena.validate(req.body, {abortEarly: false});
  if(validations.error){
  const erros = validations.error.details.map(detalhes => detalhes.message)
  console.log(erros);
  res.sendStatus(422);
  return;    
  }
  const usuario = await participantes.find({name: user}).toArray();
  if(usuario.length !== 0){
    res.sendStatus(409);
    return;
  }

  try {
    await messages.insertOne({ from: user, to, text, type, time: now});
    res.status(201).send("Mensagem enviada");
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
app.post("/status", async (req, res) => {
  const { user } = req.headers;
  console.log(user);
  try{
    const online = await participantes.findOne({name: user})
    if(!online){
      res.sendStatus(404);
      return;
    }
      await  participantes.updateOne(
        {
          name: user
        },
        {
          $set: {lastStatus: Date.now()}
        }
      );
      res.sendStatus(201);

  } catch(err) {
    res.status(422).send(err);
  }
 

});

//Rotas get
app.get("/participants", async (req, res) => {
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
  const {user} = req.headers;
  console.log(user);
  if (limit) {
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
    const listaMessages = await messages.find({$or: [{to: user}, {type: "message"}, {from: user}]}).toArray();
    res.status(201).send(listaMessages);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(5000);
