import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/info/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const userRes = await fetch(
      `https://users.roblox.com/v1/usernames/users`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [username] })
      }
    );

    const userData = await userRes.json();
    if (!userData.data || userData.data.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const userId = userData.data[0].id;

    const detailsRes = await fetch(
      `https://users.roblox.com/v1/users/${userId}`
    );
    const details = await detailsRes.json();

    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const avatarData = await avatarRes.json();
    const thumbnail = avatarData.data[0]?.imageUrl;

    const createdDate = new Date(details.created);
    const unixTimestamp = Math.floor(createdDate.getTime() / 1000);

    res.json({
      username: details.name,
      description: details.description || "Sem descrição",
      created: `<t:${unixTimestamp}:f>`,
      thumbnail: thumbnail
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar informações" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
