export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Night Bot AI is running!", {
        status: 200
      });
    }

    try {
      const data = await request.json();
      const message = String(data.message || "").trim();

      if (!message.toLowerCase().startsWith("nb ")) {
        return Response.json({
          reply: null,
          ignored: true
        });
      }

      const question = message.slice(3).trim();

      if (!question) {
        return Response.json({
          reply: "Haan bolo 😊"
        });
      }

      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct",
        {
          messages: [
            {
              role: "system",
              content:
                "You are Night Bot AI for a YouTube live chat. Reply briefly, naturally and friendly. Answer in the same language as the viewer. Do not mention that you are an AI unless asked."
            },
            {
              role: "user",
              content: question
            }
          ],
          max_tokens: 150
        }
      );

      return Response.json({
        reply: result.response
      });

    } catch (error) {
      return Response.json(
        {
          error: "Night Bot AI error",
          details: error.message
        },
        { status: 500 }
      );
    }
  }
};
