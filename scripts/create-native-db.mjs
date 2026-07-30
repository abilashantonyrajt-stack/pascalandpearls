import { readFileSync } from "fs";

const key = JSON.parse(readFileSync("./service-account-key.json", "utf-8"));

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const sig = Buffer.from(
    key.private_key.replace("-----BEGIN PRIVATE KEY-----\n", "").replace("\n-----END PRIVATE KEY-----\n", "").replace(/\n/g, ""),
    "base64"
  );
  const sign = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    await crypto.subtle.importKey("pkcs8", sig, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]),
    Buffer.from(`${b64(header)}.${b64(claim)}`)
  );
  const assertion = `${b64(header)}.${b64(claim)}.${Buffer.from(sign).toString("base64url")}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  return (await res.json()).access_token;
}

async function main() {
  const token = await getToken();
  const project = key.project_id;

  // List existing databases
  const listRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const dbs = await listRes.json();
  console.log("Existing databases:", dbs.databases?.map((d) => ({ name: d.name, type: d.type, firestoreMode: d.firestoreDataAccessMode })));

  // Check if we already have a FIRESTORE_NATIVE database
  const hasNative = dbs.databases?.some(
    (d) => d.type === "FIRESTORE_NATIVE" && d.firestoreDataAccessMode === "DATA_ACCESS_MODE_ENABLED"
  );

  if (hasNative) {
    console.log("A Firestore Native database already exists.");
    return;
  }

  // Create a new Firestore Native database with a unique name
  const dbId = "pnp-firestore";
  console.log(`Creating Firestore Native database '${dbId}'...`);
  const createRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases?databaseId=${dbId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "FIRESTORE_NATIVE",
        locationId: "asia-south1",
      }),
    }
  );
  const result = await createRes.json();
  console.log("Create result:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
