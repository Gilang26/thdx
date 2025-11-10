import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let { to, amount } = req.body;

    // 🧹 Bersihkan dan validasi input
    to = (to || "").toString().replace(/\s+/g, "").trim();
    amount = parseFloat(amount);
    console.log("Receiver input:", JSON.stringify(to));

    if (!to || isNaN(amount)) {
      return res.status(400).json({ error: "Alamat & jumlah wajib diisi" });
    }

    // Validasi alamat Solana
    try {
      new PublicKey(to);
    } catch {
      return res.status(400).json({ error: "Alamat penerima tidak valid atau salah format." });
    }

    const secretKeyJson = process.env.PRIVATE_KEY_JSON;
    if (!secretKeyJson) {
      return res.status(500).json({ error: "PRIVATE_KEY_JSON belum diset di environment Vercel." });
    }

    const secretKey = Uint8Array.from(JSON.parse(secretKeyJson));
    const from = Keypair.fromSecretKey(secretKey);
    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: new PublicKey(to),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, tx, [from]);
    const explorer = `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`;

    return res.status(200).json({ success: true, signature, explorer });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}
