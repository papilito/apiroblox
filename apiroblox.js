import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Função para pegar ID pelo username
async function getUserId(username) {
  try {
    const res = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username] }),
    });
    const data = await res.json();
    return data.data[0]?.id;
  } catch (err) {
    console.error("Erro ao buscar UserId:", err);
    return null;
  }
}

// Função para formatar a data
function formatDate(isoString) {
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// 🔹 Rota unificada: informações do usuário
app.get("/user/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const userId = await getUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const infoRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const info = await infoRes.json();

    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    );
    const avatarData = await avatarRes.json();
    const avatarUrl = avatarData.data[0]?.imageUrl;

    res.json({
      username: info.name,
      displayName: info.displayName,
      description: info.description || "Sem descrição",
      created: formatDate(info.created),
      avatar: avatarUrl,
    });
  } catch (err) {
    console.error("Erro na rota /user/:username:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// 🔹 Rota só para avatar
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
    console.error("Erro na rota /avatar/:username:", err);
    res.status(500).send("Erro interno");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
