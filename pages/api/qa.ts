// import cors from "../../utils/cors";
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing env var from OpenAI");
}

export const config = {
    runtime: "edge",
};


interface RequestPayload {
    prompt: string;
}

const handler = async (req: Request, res: Response): Promise<Response> => {
    const { prompt } = (await req.json()) as RequestPayload;
    // @ts-ignore
    if (!prompt) {
      return new Response("No prompt in the request", { status: 400 });
    }
  
    const payload: OpenAIStreamPayload = {
      model: "gpt-3.5-turbo",
      // model: "ada",
      messages: [{ role: "user", content: prompt }],
      // temperature,
      // top_p,
      // frequency_penalty,
      // presence_penalty,
      // max_tokens,
      stream: true,
      // n,
    };
  
    const stream = await OpenAIStream(payload);
    return new Response(stream);
    //   return cors(req, new Response(stream));
};

export default handler;