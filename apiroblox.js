import express from "express";
import fetch from "node-fetch";

const app = express();

// Função para pegar UserId usando POST moderno
async function getUserId(username) {
  try {
    const res = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username] }),
    });
    const data = await res.json();
    return data.data[0]?.id || null;
  } catch (err) {
    console.error("Erro ao buscar UserId:", err);
    return null;
  }
}

app.get("/roblox/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // 1. Pegar UserId
    const userId = await getUserId(username);
    if (!userId) return res.status(404).json({ error: "Usuário não encontrado" });

    // 2. Pegar dados do usuário
    const userReq = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const userData = await userReq.json();

    // 3. Pegar avatar
    const avatarReq = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
    const avatarData = await avatarReq.json();
    const avatarUrl = avatarData.data?.[0]?.imageUrl || null;

    // 4. Retornar dados filtrados
    res.json({
      username: userData.name,
      nickname: userData.displayName,
      description: userData.description || "Nenhuma descrição",
      createdUnix: Math.floor(new Date(userData.created).getTime() / 1000), // unix timestamp
      avatar: avatarUrl,
      userId: userId
    });

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar dados", details: err.message });
  }
});

// Render usa process.env.PORT
app.listen(process.env.PORT || 3000, () => console.log("API rodando 🚀"));
