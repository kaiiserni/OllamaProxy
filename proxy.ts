import { serve } from "bun";

// const ollamaProc = Bun.spawn({
//   cmd: ["ollama", "serve"],
//   env: {
//     ...process.env,
//     OLLAMA_HOST: "0.0.0.0",
//     OLLAMA_KEEP_ALIVE: "4h",
//     OLLAMA_NUM_PARALLEL: "2",
//     OLLAMA_MAX_LOADED_MODELS: "1",
//     OLLAMA_SCHED_SPREAD: "1",
//     OLLAMA_MULTIUSER_CACHE: "1"
//   },
//   stdout: "inherit",
//   stderr: "inherit"
// });
//
// const cleanup = () => {
//   console.log("Shutting down...");
//   try {
//     ollamaProc.kill("SIGTERM");
//   } catch (err) {
//     console.error("Failed to kill ollama serve process:", err);
//   }
//   process.exit(0);
// };
//
// process.on("SIGINT", cleanup);
// process.on("SIGTERM", cleanup);

serve({
  port: 11435,
  async fetch(req) {
    console.log(`${req.method} ${req.url}`);

    const url = new URL(req.url);

    // Optionally, you can add a secret key to the URL
    // if(url.pathname.indexOf("/supersecure") !== 0) {
    //     return new Response("NOT ALLOWED", { status: 401 });
    // }

    const path = url.pathname.replace(/^\/supersecure/, "");
    const forwardBase = "http://localhost:11434";
    const forwardURL = forwardBase + path;

    console.log(forwardURL + url.search);

    if (req.method === "GET") {
      // Just forward GET requests without modification
      const res = await fetch(forwardURL + url.search, {
        method: "GET",
        headers: req.headers,
      });
      return new Response(res.body, {
        status: res.status,
        headers: { ...res.headers },
      });
    }

    if (req.method === "POST") {
      let body;
      try {
        body = await req.json();
      } catch (err) {
        return new Response("Invalid JSON body", { status: 400 });
      }

      // Check if the endpoint supports num_ctx
      const endpointsThatSupportNumCtx = ["/api/generate", "/api/chat"];
      if (endpointsThatSupportNumCtx.includes(path)) {
        if (typeof body.options !== "object" || body.options === null) {
          body.options = {};
        }
        if (typeof body.options.num_ctx === "undefined") {
          // Optionally filter on which models to raise the context size
          // if(body.model === "llama3.2:latest" || body.model === "qwen2.5:3b"){
          console.log(body.model, "detected, setting context size");
          body.options.num_ctx = 8192;
          // }
        }
      }

      const res = await fetch(forwardURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      return new Response(res.body, {
        status: res.status,
        headers: { ...res.headers },
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
});
