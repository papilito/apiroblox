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

    const userReq = await fetch(`https://users.roblox.com/v1/users/${idData.Id}`);
    const userData = await userReq.json();

    res.json({
      username: userData.name,
      nickname: userData.displayName,
      description: userData.description,
      created: `<t:${Math.floor(new Date(userData.created).getTime() / 1000)}:F>`
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar dados", details: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("API rodando no Render 🚀"));
