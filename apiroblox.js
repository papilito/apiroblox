import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Função para pegar ID pelo username
async function getUserId(username) {
  const res = await fetch(`https://users.roblox.com/v1/usernames/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [username] }),
  });
  const data = await res.json();
  return data.data[0]?.id;
}

// 🔹 Rota unificada /user/:username
app.get("/user/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const userId = await getUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Infos principais
    const infoRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const info = await infoRes.json();

    // Avatar
    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData.data[0]?.imageUrl;

    // JSON final
    res.json({
      username: info.name,
      displayName: info.displayName,
      description: info.description,
      created: info.created,
      avatar: avatarUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// 🔹 Rota só pra avatar (redirect pra imagem)
app.get("/avatar/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const userId = await getUserId(username);

    if (!userId) {
      return res.status(404).send("Usuário não encontrado");
    }

    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData.data[0]?.imageUrl;

    if (avatarUrl) {
      res.redirect(avatarUrl);
    } else {
      res.status(404).send("Avatar não encontrado");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
