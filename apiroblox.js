import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

async function getUserId(username) {
  const res = await fetch(`https://users.roblox.com/v1/usernames/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [username] }),
  });

  const data = await res.json();
  if (data.data && data.data.length > 0) {
    return data.data[0].id;
  }
  return null;
}

app.get("/avatar/:username", async (req, res) => {
  try {
    const userId = await getUserId(req.params.username);
    if (!userId) return res.status(404).json({ error: "Usuário não encontrado" });

    const thumb = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const thumbData = await thumb.json();

    res.json({ avatar: thumbData.data[0].imageUrl });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar avatar" });
  }
});

app.get("/info/:username", async (req, res) => {
  try {
    const userId = await getUserId(req.params.username);
    if (!userId) return res.status(404).json({ error: "Usuário não encontrado" });

    const info = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const infoData = await info.json();

    const createdTimestamp = Math.floor(new Date(infoData.created).getTime() / 1000);

    res.json({
      username: infoData.name,
      description: infoData.description || "Sem descrição",
      createdTimestamp: createdTimestamp
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar informações" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
