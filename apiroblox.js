const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/avatar/:username", async (req, res) => {
  const username = req.params.username; // <-- aqui entra o nome digitado

  try {
    // 1. Buscar o ID pelo username
    const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });

    const userData = await userRes.json();
    if (!userData.data || userData.data.length === 0) {
      return res.status(404).send("Usuário não encontrado");
    }

    const userId = userData.data[0].id;

    // 2. Buscar a thumbnail do avatar
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const thumbData = await thumbRes.json();

    if (!thumbData.data || thumbData.data.length === 0) {
      return res.status(404).send("Thumbnail não encontrada");
    }

    const imageUrl = thumbData.data[0].imageUrl;

    // Redireciona direto para a imagem
    res.redirect(imageUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno na API");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));


