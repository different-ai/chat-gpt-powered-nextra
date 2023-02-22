// import cors from "../../utils/cors";
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";
import { get_encoding } from "@dqbd/tiktoken";

if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing env var from OpenAI");
}

export const config = {
    //   runtime: "edge",
};

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


const handler = async (req: Request, res: Response): Promise<Response> => {
    // console.log("prompt", req.body);

    // const {
    //     prompt,
    //     temperature = 0.7,
    //     top_p = 1,
    //     frequency_penalty = 0,
    //     presence_penalty = 0,
    //     max_tokens = 200,
    //     n = 1,
    // } = (await req.json()) as OpenAIStreamPayload;
    // @ts-ignore
    const prompt = req.body.prompt;
    if (!prompt) {
        return new Response("No prompt in the request", { status: 400 });
    }
    const context = await createContext(prompt);
    const newPrompt = `Answer the question based on the context below, and if the question can't be answered based on the context, say "I don't know"\n\nContext: ${context}\n\n---\n\nQuestion: ${prompt}\nAnswer:`;

    const payload: OpenAIStreamPayload = {
        // model: "text-davinci-003",
        model: "ada",
        prompt: newPrompt,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1000,
        stream: true,
        n: 1,
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
    //   return cors(req, new Response(stream));
};

export default handler;