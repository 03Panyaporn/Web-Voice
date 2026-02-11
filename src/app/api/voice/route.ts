import { NextResponse } from "next/server";
import productsData from "@/data/products.json";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    let transcript = (text || "").trim().toLowerCase();

    if (!transcript) {
      return NextResponse.json({ error: "ไม่มีข้อความจากการพูด" }, { status: 400 });
    }

    const stopWords = ["มี", "ไหม", "ครับ", "ค่ะ", "อยากได้", "ขอ", "ดู", "หน่อย", "ราคา", "เท่าไหร่", "บ้าง", "แนะนำ", "ช่วย", "หา"];
    stopWords.forEach(word => {
        transcript = transcript.replaceAll(word, "");
    });
    transcript = transcript.trim(); 

    if (transcript.length === 0) transcript = text.trim().toLowerCase();

    const products = productsData as any[];
    let filteredProducts: any[] = [];

    if (transcript.length > 0) {
      const matches = products.filter((p: any) => {
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const tags = p.tags ? p.tags.map((t: string) => t.toLowerCase()) : [];
      
        if (name.includes(transcript) || category.includes(transcript)) return true;

        const hasTag = tags.some((tag: string) => tag.includes(transcript) || transcript.includes(tag));
        if (hasTag) return true;

        return false;
      });

      if (matches.length > 0) {
        filteredProducts = matches;
      } else {
        
        filteredProducts = products.filter(p => p.category === "Gadget" || p.category === "Accessory").slice(0, 5);
      }
    } else {
        filteredProducts = products.slice(0, 5);
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    let aiAnswer = "";

    
    if (filteredProducts.length > 0 && filteredProducts[0].category !== "Gadget") { // เช็คว่าไม่ใช่ตัว Fallback
        aiAnswer = `เจอสินค้าเกี่ยวกับ "${text}" จำนวน ${filteredProducts.length} รายการครับ`;
    } else {
        aiAnswer = `ไม่พบ "${text}" ครับ แต่อาจจะสนใจสินค้าเหล่านี้`;
    }

    if (n8nUrl) {
        try {
            const resp = await fetch(n8nUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript: text,
                    products: filteredProducts,
                    lang: "th",
                }),
            });
            const data = await resp.json();
            
            if (data.answer) aiAnswer = data.answer;
            if (data.matches && data.matches.length > 0) filteredProducts = data.matches;
            
        } catch (err) {
            console.error("N8N Error:", err);
        }
    }

    return NextResponse.json({
        transcript: text,
        answer: aiAnswer,
        matches: filteredProducts
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}