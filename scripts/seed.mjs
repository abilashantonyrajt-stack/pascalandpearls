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
    key.private_key
      .replace("-----BEGIN PRIVATE KEY-----\n", "")
      .replace("\n-----END PRIVATE KEY-----\n", "")
      .replace(/\n/g, ""),
    "base64"
  );
  const sign = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    await crypto.subtle.importKey(
      "pkcs8",
      sig,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    ),
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

const products = [
  { name: "Classic Freshwater Pearl Necklace", price: 2499, description: "A timeless strand of lustrous freshwater pearls, hand-knotted with silk thread and finished with a 14K gold-plated clasp. Each pearl is individually selected for its luster and uniformity.", images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", "https://images.unsplash.com/photo-1515562141589-1e9989e9e9c9?w=600"], category: "necklaces", stock: 15, featured: true, material: "Freshwater Pearls, 14K Gold-Plated Clasp, Silk Thread", createdAt: Date.now() },
  { name: "Golden Beaded Choker Set", price: 1899, description: "An exquisite choker set featuring hand-beaded gold-toned glass beads with a matching pair of drop earrings.", images: ["https://images.unsplash.com/photo-1611591437281-460305be6b03?w=600", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600"], category: "sets", stock: 10, featured: true, material: "Gold-Plated Glass Beads, Brass Alloy", createdAt: Date.now() - 1e5 },
  { name: "Rose Quartz Beaded Bracelet", price: 899, description: "A delicate bracelet featuring genuine rose quartz beads with gold spacers.", images: ["https://images.unsplash.com/photo-1611605698335-8b1563e53b32?w=600", "https://images.unsplash.com/photo-1635767798638-3665ea50e7c1?w=600"], category: "bracelets", stock: 25, featured: false, material: "Rose Quartz, Gold-Plated Spacers", createdAt: Date.now() - 2e5 },
  { name: "Pearl Drop Earrings", price: 1299, description: "Elegant drop earrings featuring baroque freshwater pearls suspended from gold-filled hooks.", images: ["https://images.unsplash.com/photo-1535632066927-ab7c8ab60908?w=600", "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600"], category: "earrings", stock: 20, featured: true, material: "Baroque Freshwater Pearls, Gold-Filled Hooks", createdAt: Date.now() - 3e5 },
  { name: "Multicolor Gemstone Necklace", price: 3199, description: "A vibrant statement necklace handcrafted with alternating amethyst, citrine, and peridot beads.", images: ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"], category: "necklaces", stock: 8, featured: false, material: "Amethyst, Citrine, Peridot", createdAt: Date.now() - 4e5 },
  { name: "Pearl & Crystal Bridal Set", price: 4999, description: "A complete bridal ensemble featuring a pearl and crystal necklace, matching earrings, and a coordinating bracelet.", images: ["https://images.unsplash.com/photo-1515562141589-1e9989e9e9c9?w=600", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600"], category: "sets", stock: 5, featured: true, material: "Freshwater Pearls, Swarovski Crystals", createdAt: Date.now() - 5e5 },
  { name: "Layered Pearl Bracelet Stack", price: 1499, description: "A set of three stackable bracelets combining freshwater pearls, gold beads, and clear crystals.", images: ["https://images.unsplash.com/photo-1635767798638-3665ea50e7c1?w=600", "https://images.unsplash.com/photo-1611591437281-460305be6b03?w=600"], category: "bracelets", stock: 18, featured: false, material: "Freshwater Pearls, Crystal Beads", createdAt: Date.now() - 6e5 },
  { name: "Turquoise Bead Drop Earrings", price: 1099, description: "Southwest-inspired drop earrings featuring natural turquoise beads with silver accent spacers.", images: ["https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600", "https://images.unsplash.com/photo-1535632066927-ab7c8ab60908?w=600"], category: "earrings", stock: 22, featured: false, material: "Natural Turquoise, Sterling Silver", createdAt: Date.now() - 7e5 },
  { name: "Gold Pearl Lariat Necklace", price: 2799, description: "A modern lariat-style necklace combining cultured pearls with gold-plated chain.", images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600"], category: "necklaces", stock: 12, featured: false, material: "Cultured Pearls, Gold-Plated Chain", createdAt: Date.now() - 8e5 },
  { name: "Beaded Wrap Bracelet", price: 699, description: "A versatile wrap bracelet featuring tiny seed beads in earthy tones.", images: ["https://images.unsplash.com/photo-1611605698335-8b1563e53b32?w=600", "https://images.unsplash.com/photo-1635767798638-3665ea50e7c1?w=600"], category: "bracelets", stock: 30, featured: false, material: "Glass Seed Beads, Waxed Cotton Cord", createdAt: Date.now() - 9e5 },
  { name: "Pearl Stud Earrings Set", price: 799, description: "A set of three pearl stud earrings in graduated sizes.", images: ["https://images.unsplash.com/photo-1535632066927-ab7c8ab60908?w=600", "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600"], category: "earrings", stock: 35, featured: false, material: "Freshwater Pearls, Sterling Silver Posts", createdAt: Date.now() - 1e6 },
  { name: "Ruby & Pearl Combo Set", price: 3999, description: "A striking combination set featuring ruby-red glass beads alternating with lustrous pearls.", images: ["https://images.unsplash.com/photo-1515562141589-1e9989e9e9c9?w=600", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600"], category: "sets", stock: 7, featured: true, material: "Ruby Glass Beads, Freshwater Pearls", createdAt: Date.now() - 1.1e6 },
];

async function seed() {
  const token = await getToken();
  const project = key.project_id;
  const dbName = "default";

  for (const product of products) {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${project}/databases/${dbName}/documents/products`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: Object.entries(product).reduce((acc, [k, v]) => {
            if (typeof v === "string") acc[k] = { stringValue: v };
            else if (typeof v === "number") acc[k] = { integerValue: v.toString() };
            else if (typeof v === "boolean") acc[k] = { booleanValue: v };
            else if (Array.isArray(v)) acc[k] = { arrayValue: { values: v.map((s) => ({ stringValue: s })) } };
            return acc;
          }, {}),
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      console.error(`Failed to add ${product.name}:`, JSON.stringify(err));
      return;
    }
    console.log(`Added: ${product.name}`);
  }
  console.log(`Seeded ${products.length} products successfully.`);
}

seed().catch(console.error);
