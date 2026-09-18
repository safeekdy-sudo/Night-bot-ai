export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const message = String(req.query.message || "").trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!message) {
    return res.status(400).send("Sawal ya message likho.");
  }

  if (!apiKey) {
    return res.status(500).send("GEMINI_API_KEY missing in Vercel.");
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You are Night Bot AI for a YouTube live chat. Reply naturally, politely and briefly. Keep answers suitable for a live chat. Do not use markdown. Usually answer in 1 or 2 short sentences.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res
        .status(502)
        .send("Gemini API error: " + (data?.error?.message || "Request failed"));
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      console.error("Empty Gemini response:", data);
      return res.status(502).send("Gemini returned no reply.");
    }

    return res.status(200).send(reply);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send("Server error: AI request failed.");
  }
}
