// api/send-sol.js
import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { to, amount } = req.body;
    if (!to || !amount) {
      return res.status(400).json({ error: "Alamat & jumlah wajib diisi" });
    }

    // 🔑 Kunci rahasia wallet pengirim (gunakan wallet burn)
    const secretKey = Uint8Array.from([2S52tbSt2fUpbwzsQj5kgJpshNdBfx7vPJX8hTs3fv3VYpGKyHNjn81hmmdjmPdYjwPr4Hv47REoTQjeu2cf9ByB]);
    const from = Keypair.fromSecretKey(secretKey);

    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: new PublicKey(to),
        lamports: Number(amount) * LAMPORTS_PER_SOL
      })
    );

    const sig = await sendAndConfirmTransaction(connection, tx, [from]);
    return res.status(200).json({ success: true, signature: sig });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
