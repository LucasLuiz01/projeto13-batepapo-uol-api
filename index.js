import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
//Configurando dotenv
dotenv.config();
//Configurando APP
const app = express();
app.use(express.json());
app.use(cors());

//Configurando Mongo
const mongoClient = new MongoClient(process.env.MONGO_URL)



app.post("/participantes", (req, res) => {

})

app.post("/messages", (req, res) => {

})
app.post("/status", (req, res) => {

})

app.get("/participantes", (req, res) => {

})

app.get("/messages", (req, res) => {

})

app.listen(5000);

