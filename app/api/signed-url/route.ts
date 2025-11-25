// Speicherort: src/app/api/signed-url/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentKey = searchParams.get("agentKey");

  // Mapping von agentKey zu Umgebungsvariablen-Namen
  const candidateKeys = (() => {
    if (!agentKey) return ["AGENT_ID", "agent_id"];

    // ═══════════════════════════════════════════════════════════════
    // BESTEHENDE AGENTS
    // ═══════════════════════════════════════════════════════════════
    if (agentKey === "distribution") {
      return [
        "DISTRIBUTION_AGENT_ID",
        "DISTRUBITION_AGENT_ID", // typo fallback
        "distribution_agent_id",
        "distrubition_agent_id"
      ];
    }
    if (agentKey === "finance") {
      return ["FINANCE_AGENT_ID", "finance_agent_id"];
    }
    if (agentKey === "impact") {
      return ["IMPACT_AGENT_ID", "impact_agent_id"];
    }
    if (agentKey === "marketing") {
      return ["MARKETING_AGENT_ID", "marketing_agent_id"];
    }

    // ═══════════════════════════════════════════════════════════════
    // NEU: PHARMAZIE-TRAINING AGENTS
    // ═══════════════════════════════════════════════════════════════

    // B-Vitamine & Energie
    if (agentKey === "pharmacy_b_vitamins") {
      return [
        "PHARMACY_B_VITAMINS_AGENT_ID",
        "pharmacy_b_vitamins_agent_id",
        "B_VITAMINS_AGENT_ID"
      ];
    }

    // Magnesiumcitrat 130
    if (agentKey === "pharmacy_magnesium") {
      return [
        "PHARMACY_MAGNESIUM_AGENT_ID",
        "pharmacy_magnesium_agent_id",
        "MAGNESIUM_AGENT_ID"
      ];
    }

    // Perenterol forte
    if (agentKey === "pharmacy_perenterol") {
      return [
        "PHARMACY_PERENTEROL_AGENT_ID",
        "pharmacy_perenterol_agent_id",
        "PERENTEROL_AGENT_ID"
      ];
    }

    // Generischer Pharmacy-Agent (Fallback)
    if (agentKey === "pharmacy") {
      return [
        "PHARMACY_AGENT_ID",
        "pharmacy_agent_id"
      ];
    }

    // ═══════════════════════════════════════════════════════════════
    // DEFAULT FALLBACK
    // ═══════════════════════════════════════════════════════════════
    return ["AGENT_ID", "agent_id"];
  })();

  const agentId = candidateKeys
    .map(k => process.env[k as keyof NodeJS.ProcessEnv])
    .find(Boolean);

  if (!agentId) {
    console.error(`❌ Keine Agent-ID gefunden für key: ${agentKey}`);
    console.error(`   Geprüfte Variablen: ${candidateKeys.join(", ")}`);
    throw Error(`${candidateKeys.join("/")} is not set`);
  }

  try {
    const client = new ElevenLabsClient();
    const response = await client.conversationalAi.getSignedUrl({
      agent_id: agentId,
    });

    console.log(`✅ Signed URL generiert für: ${agentKey || 'default'}`);

    return NextResponse.json({ signedUrl: response.signed_url });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to get signed URL" },
      { status: 500 }
    );
  }
}