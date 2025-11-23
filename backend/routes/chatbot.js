import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  const reply = `You said: ${message}. How can I help?`;

  res.json({ reply });
});

export default router;
