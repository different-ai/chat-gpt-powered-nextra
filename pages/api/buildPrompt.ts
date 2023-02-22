// import cors from "../../utils/cors";
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";
import { get_encoding } from "@dqbd/tiktoken";

if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing env var from OpenAI");
}

// Load the tokenizer which is designed to work with the embedding model
const enc = get_encoding('cl100k_base');
const url = "https://embedbase-hosted-usx5gpslaq-uc.a.run.app";
const vaultId = "documentation";
const apiKey = process.env.EMBEDBASE_API_KEY;

const search = async (query: string) => {
    return fetch(url + "/v1/" + vaultId + "/search", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: query
        })
    }).then(response => response.json());
};

const createContext = async (question: string, maxLen = 1800) => {
    const searchResponse = await search(question);
    let curLen = 0;
    const returns = [];
    for (const similarity of searchResponse["similarities"]) {
        const sentence = similarity["data"];
        const nTokens = enc.encode(sentence).length;
        curLen += nTokens + 4;
        if (curLen > maxLen) {
            break;
        }
        returns.push(sentence);
    }
    return returns.join("\n\n###\n\n");
}


export default async function buildPrompt(req, res) {
    const prompt = req.body.prompt;

    const context = await createContext(prompt);
    const newPrompt = `Answer the question based on the context below, and if the question can't be answered based on the context, say "I don't know"\n\nContext: ${context}\n\n---\n\nQuestion: ${prompt}\nAnswer:`;

    res.status(200).json({ prompt: newPrompt });
}