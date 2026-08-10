/* ═══════════════════════════════════════════════════════════════
   ADK Agent API client — SSE streaming client for POST /api/chat
   ═══════════════════════════════════════════════════════════════ */

const AdkApi = (() => {
  const SESSION_KEY = "adk_session_id";
  const USER_KEY = "adk_user_id";

  function getOrCreate(key, factory) {
    let val = localStorage.getItem(key);
    if (!val) {
      val = factory();
      localStorage.setItem(key, val);
    }
    return val;
  }

  function getSessionId() {
    return getOrCreate(SESSION_KEY, () => crypto.randomUUID());
  }

  function getUserId() {
    return getOrCreate(USER_KEY, () => "user-" + crypto.randomUUID().slice(0, 8));
  }

  const AGENT_BASE = window.GEAP_AGENT_URL || "";

  async function sendMessage(text, onChunk, onDone, onError) {
    try {
      const response = await fetch(`${AGENT_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": getSessionId(),
          "X-User-ID": getUserId(),
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        onError(`Server error (${response.status}): ${errBody || response.statusText}`);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE frames separated by \r\n\r\n or \n\n
        // sse_starlette uses \r\n delimiters and chunked encoding,
        // so we need to handle both formats robustly.
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() || ""; // keep incomplete frame in buffer

        for (const frame of frames) {
          // Skip SSE comment lines (": ping ...") and empty frames
          if (!frame.trim() || frame.startsWith(":")) continue;

          const dataMatch = frame.match(/^data: (.+)$/m);
          if (!dataMatch) continue;

          // Strip trailing \r that may come from \r\n line endings
          let dataStr = dataMatch[1].trim();

          try {
            const event = JSON.parse(dataStr);
            const type = event.type;

            if (type === "text" && event.content) {
              fullText += event.content;
              onChunk(event.content);
            } else if (type === "tool_call") {
              // Silently log tool calls — ADK handles everything server-side
              console.log("[ADK] Tool call:", event.name, event.args);
            } else if (type === "done") {
              onDone(fullText);
              return;
            } else if (type === "error") {
              onError(event.content || "Unknown server error");
              return;
            }
          } catch (parseErr) {
            console.warn("[ADK] Failed to parse SSE frame:", frame, parseErr);
          }
        }
      }

      // Stream ended without "done" event
      onDone(fullText);
    } catch (netErr) {
      onError(`Network error: ${netErr.message}. Is the server running?`);
    }
  }

  return { sendMessage, getSessionId, getUserId };
})();
