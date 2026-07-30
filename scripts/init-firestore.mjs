import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const key = JSON.parse(readFileSync("./service-account-key.json", "utf-8"));

async function main() {
  const auth = new GoogleAuth({
    credentials: key,
    scopes: "https://www.googleapis.com/auth/datastore",
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const project = key.project_id;

  // Check existing databases
  const listRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases`,
    { headers: { Authorization: `Bearer ${token.token}` } }
  );
  const databases = await listRes.json();
  console.log("Existing databases:", JSON.stringify(databases, null, 2));

  const exists = databases.databases?.some(
    (d) => d.name === `projects/${project}/databases/(default)`
  );

  if (exists) {
    console.log("Firestore database already exists. Run seed: node scripts/seed.mjs");
    return;
  }

  console.log("Creating Firestore database (this takes ~1 min)...");
  const createRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `projects/${project}/databases/(default)`,
        locationId: "asia-south1",
        type: "FIRESTORE_NATIVE",
      }),
    }
  );
  const result = await createRes.json();
  console.log("Result:", JSON.stringify(result, null, 2));

  if (result.name) {
    console.log("Database creation started. Check Firebase Console in a minute, then run: node scripts/seed.mjs");
  }
}

main().catch(console.error);
