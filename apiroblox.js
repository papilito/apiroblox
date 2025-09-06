const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Função para buscar os dados do usuário pelo username
async function getUserData(username) {
  const res = await fetch(`https://users.roblox.com/v1/users/by-username/${username}`);
  if (!res.ok) return null;
  return await res.json();
}

// ----------------------
// Avatar (redirect para a imagem)
// ----------------------
app.get("/avatar/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const userData = await getUserData(username);
    if (!userData) return res.status(404).json({ error: "Usuário não encontrado" });

    const userId = userData.id;
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const thumbData = await thumbRes.json();
    if (!thumbData.data || thumbData.data.length === 0)
      return res.status(404).json({ error: "Thumbnail não encontrada" });

    // Faz o redirect direto para a imagem
    res.redirect(thumbData.data[0].imageUrl);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno na API" });
  }
});

// ----------------------
// Username oficial
// ----------------------
app.get("/username/:username", async (req, res) => {
  const username = req.params.username;
  const userData = await getUserData(username);
  if (!userData) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json({ username: userData.name });
});

// ----------------------
// DisplayName / Apelido
// ----------------------
app.get("/displayname/:username", async (req, res) => {
  const username = req.params.username;
  const userData = await getUserData(username);
  if (!userData) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json({ displayName: userData.displayName });
});

// ----------------------
// Data de criação
// ----------------------
app.get("/created/:username", async (req, res) => {
  const username = req.params.username;
  const userData = await getUserData(username);
  if (!userData) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json({ created: userData.created });
});

// ----------------------
// Rota teste
// ----------------------
app.get("/", (req, res) => {
  res.send("API Roblox rodando! Rotas: /avatar/:username, /username/:username, /displayname/:username, /created/:username");
});

// ----------------------
// Start
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
