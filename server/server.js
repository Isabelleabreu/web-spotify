import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.static("public"));

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null;
let tokenExpires = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpires) return cachedToken;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpires = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

//Buscar artista por nome
app.get("/artist", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Falta o parâmetro q" });

  try {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=artist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar artista" });
  }
});

//Buscar top tracks
app.get("/top-tracks/:id", async (req, res) => {
  try {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${req.params.id}/top-tracks?country=BR`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar top tracks" });
  }
});

// Buscar artista específico por ID
app.get("/artist/:id", async (req, res) => {
  try {
    const token = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar artista por ID" });
  }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
