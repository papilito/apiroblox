import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

async function getUserId(username) {
  const res = await fetch(`https://users.roblox.com/v1/usernames/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernames: [username] })
  });
  const data = await res.json();
  if (!data.data || data.data.length === 0) return null;
  return data.data[0].id;
}

app.get("/", (req, res) => {
  res.send("✅ API Roblox está funcionando!");
});

app.get("/username/:username", async (req, res) => {
  res.json({ username: req.params.username });
});

app.get("/description/:username", async (req, res) => {
  const userId = await getUserId(req.params.username);
  if (!userId) return res.status(404).json({ error: "Usuário não encontrado" });

  const r = await fetch(`https://users.roblox.com/v1/users/${userId}`);
  const d = await r.json();
  res.json({ description: d.description || "Sem descrição" });
});

app.get("/created/:username", async (req, res) => {
  const userId = await getUserId(req.params.username);
  if (!userId) return res.status(404).json({ error: "Usuário não encontrado" });

  const r = await fetch(`https://users.roblox.com/v1/users/${userId}`);
  const d = await r.json();

  const createdDate = new Date(d.created);
  const unixTime = Math.floor(createdDate.getTime() / 1000);

  res.json({ created: `<t:${unixTime}:f>` });
});

app.get("/thumbnail/:username", async (req, res) => {
  const userId = await getUserId(req.params.username);
  if (!userId) return res.status(404).json({ error: "Usuário não encontrado" });

  const r = await fetch(
    `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
  );
  const d = await r.json();

  res.json({ thumbnail: d.data[0].imageUrl });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
