const GROQ_API_KEY = process.env.GROQ_API_KEY ?? ""
const GROQ_BASE_URL = process.env.GROQ_BASE_URL ?? ""
const GROQ_MODEL = process.env.GROQ_MODEL ?? ""

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: GroqMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

export interface BeautAiProfile {
  favorite_brands?: string[];
  routine_time?: string;
  beauty_vibe?: string;
  xp_points?: number;
}

export function buildSystemPrompt(profile: BeautAiProfile): string {
  return `You are Beaut.ai, a friendly and expert beauty advisor.

USER'S BEAUTY PROFILE:
- Favorite Brands: ${profile.favorite_brands?.join(", ") || "Not specified"}
- Daily Routine Time: ${profile.routine_time || "Not specified"} minutes  
- Beauty Vibe: ${profile.beauty_vibe || "Not specified"}
- XP Points: ${profile.xp_points || 0}

PERSONALITY:
- Warm, encouraging, and knowledgeable
- Give concise answers (2-4 sentences)
- Reference user's profile when relevant
- Suggest products from their favorite brands
- Match advice to their beauty vibe

When asked about their profile, confirm what you know about them.`;
}

// ─── Non-streaming chat ───────────────────────────────────────────────────────

export async function chatWithGroq(
  messages: GroqMessage[],
  options?: {
    temperature?: number;
    max_tokens?: number;
  },
): Promise<string> {
  const response = await fetch(GROQ_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content ?? "";
}

// ─── Streaming chat ───────────────────────────────────────────────────────────

/**
 * Streams a chat response from Groq using XMLHttpRequest.
 *
 * WHY XHR instead of fetch + ReadableStream:
 * React Native's fetch does NOT expose response.body as a ReadableStream
 * (it returns null). XHR's onprogress fires as chunks arrive and works
 * correctly in both Expo Go (Hermes) and standalone builds.
 *
 * onChunk  — called for each text delta as it streams in
 * onDone   — called with the full text once the stream ends
 * onError  — called if the request fails
 */
export function streamChatWithGroq(
  messages: GroqMessage[],
  onChunk: (chunk: string) => void,
  onDone: (fullText: string) => void,
  onError?: (err: Error) => void,
  options?: {
    temperature?: number;
    max_tokens?: number;
  },
): Promise<void> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", GROQ_BASE_URL, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${GROQ_API_KEY}`);

    let fullText = "";
    let processedLength = 0; // track how much of responseText we've already parsed

    // Parse SSE lines from a text chunk
    const parseSSEChunk = (raw: string) => {
      const lines = raw.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta: string = json.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {
          // Malformed JSON line — skip
        }
      }
    };

    // Called progressively as chunks arrive
    xhr.onprogress = () => {
      const newText = xhr.responseText.slice(processedLength);
      processedLength = xhr.responseText.length;
      parseSSEChunk(newText);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Parse any remaining text that onprogress may have missed
        const remaining = xhr.responseText.slice(processedLength);
        if (remaining) parseSSEChunk(remaining);
        onDone(fullText);
        resolve();
      } else {
        const err = new Error(
          `Groq API error: ${xhr.status} - ${xhr.responseText}`,
        );
        onError?.(err);
        resolve();
      }
    };

    xhr.onerror = () => {
      onError?.(new Error("Network error while streaming from Groq"));
      resolve();
    };

    xhr.send(
      JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1024,
        stream: true,
      }),
    );
  });
}
