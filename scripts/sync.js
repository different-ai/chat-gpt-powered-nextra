const glob = require("glob");
const fs = require("fs");
const fetch = require("node-fetch");

const url = "https://embedbase-hosted-usx5gpslaq-uc.a.run.app";
const vaultId = "documentation";
const apiKey = process.env.EMBEDBASE_API_KEY;
const sync = async () => {
    // read all files under pages/* with .mdx extension
    // for each file, read the content
    const documents = glob.sync("pages/**/*.mdx").map((path) => ({
        id: path.replace("pages/", "/").replace("index.mdx", "").replace(".mdx", ""),
        // content of the file
        data: fs.readFileSync(path, "utf-8")
    }));
    console.log(documents);
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