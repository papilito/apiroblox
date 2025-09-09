import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/roblox/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const idReq = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
    const idData = await idReq.json();

    if (!idData.Id) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const userId = idData.Id;

    const userReq = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const userData = await userReq.json();

    const avatarReq = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
    const avatarData = await avatarReq.json();

    const avatarUrl = avatarData.data?.[0]?.imageUrl || null;

    res.json({
      username: userData.name,
      nickname: userData.displayName,
      description: userData.description,
      created: `<t:${Math.floor(new Date(userData.created).getTime() / 1000)}:F>`,
      avatar: avatarUrl
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar dados", details: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("API rodando 🚀"));
