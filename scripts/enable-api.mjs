import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const key = JSON.parse(readFileSync("./service-account-key.json", "utf-8"));

async function main() {
  const auth = new GoogleAuth({
    credentials: key,
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const res = await fetch(
    `https://serviceusage.googleapis.com/v1/projects/${key.project_id}/services/firestore.googleapis.com:enable`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const result = await res.json();
  console.log("Enable API result:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
