import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // сам си взима ключа от .env

const msg = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 50,
    messages: [
        { role: "user", content: "Отговори само с: връзката работи" }
    ],
});

console.log(msg.content[0].text);