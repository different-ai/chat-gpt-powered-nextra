const glob = require("glob");
const fs = require("fs");
const fetch = require("node-fetch");

const url = "https://embedbase-hosted-usx5gpslaq-uc.a.run.app";
const vaultId = "documentation";
try {
    require("dotenv").config();
} catch (e) {
    console.log("No .env file found" + e);
}
const apiKey = process.env.EMBEDBASE_API_KEY;
const sync = async () => {
    // read all files under pages/* with .mdx extension
    // for each file, read the content
    const documents = glob.sync("pages/**/*.mdx").map((path) => ({
        id: path.replace("pages/", "/").replace("index.mdx", "").replace(".mdx", ""),
        // content of the file
        data: fs.readFileSync(path, "utf-8")
    }));
    // split documents into chunks of 100 lines
    // and use id like path/chunkIndex
    const chunks = [];
    documents.forEach((document) => {
        const lines = document.data.split("\n");
        const chunkSize = 100;
        for (let i = 0; i < lines.length; i += chunkSize) {
            const chunk = lines.slice(i, i + chunkSize).join("\n");
            chunks.push({
                id: document.id + "/" + i,
                data: chunk
            });
        }
    });

    console.log("Syncing " + chunks.map((d) => d.id).join(", "));
    const response = await fetch(url + "/v1/" + vaultId, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            documents: documents
        })
    });
    const data = await response.json();
    console.log(data);
}

sync();