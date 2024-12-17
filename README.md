# OllamaProxy

A lightweight, portable proxy server built with [Bun](https://bun.sh) that sits in front of Ollama to enhance its capabilities. Perfect for situations where you can't directly modify Ollama's parameters or need additional control over its behavior.

The proxy is designed to be highly portable - you can simply copy `proxy.ts` to any directory (including your Ollama installation directory) and run it directly with `bun ./proxy.ts`. No additional setup required!

## Features

- Automatically sets context window size (num_ctx) to 8192 for supported endpoints
- Optional built-in Ollama process management
- Configurable very simple and rudimentary secret key protection for endpoints
- Transparent proxying of all Ollama endpoints

## Installation

```bash
bun install
```

## Usage

Basic usage:

```bash
# If installed as a project:
bun run index.ts

# Or run proxy.ts directly from any directory:
bun ./proxy.ts
```

The proxy will start on port 11435 and forward requests to Ollama running on port 11434.

## Optional Features

The proxy includes several optional features that can be enabled by uncommenting the relevant code:

### Built-in Ollama Process Management

Uncomment the `ollamaProc` section to have the proxy automatically start and manage the Ollama process with custom environment variables.

### Endpoint Security

Uncomment the URL security check section to require a minimum of a "/supersecure" prefix on all requests.

### Context Window Size

By default, the proxy sets `num_ctx=8192` for supported endpoints (/api/generate, /api/chat). You can modify this behavior or add model-specific conditions in the code. There is also a commented "if" function to filter out on which models it applies, because you may not want a larger context size on large llm's when you don't have much VRAM to spare.
