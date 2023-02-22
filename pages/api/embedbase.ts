
const url = "https://embedbase-hosted-usx5gpslaq-uc.a.run.app";
const vaultId = "documentation";
const apiKey = process.env.EMBEDBASE_API_KEY;

export default async function search(req, res) {
    const { query } = req.body;

    const r = await fetch(url + "/v1/" + vaultId + "/search", {
        method: "POST",
        headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: query
        })
    });
    const data = await r.json();
    res.status(200).json(data);
};
