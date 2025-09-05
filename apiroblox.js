const express = require("express");
const fetch = require("node-fetch");
const app = express();

async function getUserData(username) {
  const res = await fetch(`https://users.roblox.com/v1/users/by-username/${username}`);
  if (!res.ok) return null;
  return await res.json();
}

app.get("/avatar/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const userData = await getUserData(username);
    if (!userData) return res.status(404).send("Usuário não encontrado");

    const userId = userData.id;
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const thumbData = await thumbRes.json();
    if (!thumbData.data || thumbData.data.length === 0) return res.status(404).send("Thumbnail não encontrada");

    res.redirect(thumbData.data[0].imageUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno na API");
  }
});

app.get("/username/:username", async (req, res) => {
  const username = req.params.username;
  const userData = await getUserData(username);
  if (!userData) return res.status(404).send("Usuário não encontrado");
  res.send(userData.name);
});

app.get("/displayname/:username", async (req, res) => {
  const username = req.params.username;
  const userData = await getUserData(username);
  if (!userData) return res.status(404).send("Usuário não encontrado");
  res.send(userData.displayName);
});

app.get("/created/:username", async (req, res) => {
  const username = req.params.username;
  const userData = await getUserData(username);
  if (!userData) return res.status(404).send("Usuário não encontrado");
  res.send(userData.created);
});

app.get("/", (req, res) => {
  res.send("API Roblox rodando! Use /avatar/:username, /displayname/:username, /created/:username...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
