import { type RefObject, useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import {
  resolveAlias,
  type AliasDefinition,
} from "@/features/static-chaos/aliases";
import { parseTelnetChunk, writeLocalInput } from "@/lib/telnet";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

function toSocketPayload(payload: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(payload.byteLength);
  copy.set(payload);
  return copy.buffer;
}

type UseStaticChaosTerminalArgs = {
  aliasMapRef: RefObject<Map<string, AliasDefinition>>;
  socketUrl: string;
};

export function useStaticChaosTerminal({
  aliasMapRef,
  socketUrl,
}: UseStaticChaosTerminalArgs) {
  const terminalHostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const localEchoRef = useRef(true);
  const currentInputRef = useRef("");
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number | null>(null);
  const historyDraftRef = useRef("");
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("Live browser gateway online.");
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    const mountNode = terminalHostRef.current;
    if (!mountNode) {
      return;
    }

    mountNode.innerHTML = "";

    const terminal = new Terminal({
      cursorBlink: true,
      convertEol: false,
      scrollOnUserInput: true,
      fontFamily:
        '"Cascadia Mono", "Fira Code", "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
      fontSize: 13,
      lineHeight: 1.1,
      theme: {
        background: "#08131a",
        foreground: "#d7f5ef",
        cursor: "#48f0d2",
        selectionBackground: "rgba(72, 240, 210, 0.28)",
        black: "#0f1f26",
        brightBlack: "#35505a",
        red: "#ff6b6b",
        green: "#48f0d2",
        yellow: "#f7d774",
        blue: "#78c7ff",
        magenta: "#e79cff",
        cyan: "#63f2ff",
        white: "#f5fffd",
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(mountNode);

    let viewportSyncTimer: number | null = null;

    const scheduleFit = () => {
      if (viewportSyncTimer !== null) {
        window.clearTimeout(viewportSyncTimer);
      }

      viewportSyncTimer = window.setTimeout(() => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            fitAddon.fit();
            terminal.scrollToBottom();
          });
        });
      }, 32);
    };

    scheduleFit();
    terminal.focus();
    terminal.writeln("\x1b[36m[static-chaos]\x1b[0m Booting remote terminal...");
    terminal.writeln("");

    const decoder = new TextDecoder();

    const sendToSocket = (payload: string | Uint8Array) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return;
      }

      socket.send(typeof payload === "string" ? payload : toSocketPayload(payload));
    };

    const replaceCurrentInput = (nextInput: string) => {
      const previousInput = currentInputRef.current;
      if (previousInput === nextInput) {
        return;
      }

      if (previousInput.length > 0) {
        const eraseSequence = "\u007f".repeat(previousInput.length);
        if (localEchoRef.current) {
          writeLocalInput((text) => terminal.write(text), eraseSequence, true);
        }
        sendToSocket(eraseSequence);
      }

      if (nextInput.length > 0) {
        if (localEchoRef.current) {
          writeLocalInput((text) => terminal.write(text), nextInput, true);
        }
        sendToSocket(nextInput);
      }

      currentInputRef.current = nextInput;
    };

    const browseHistory = (direction: "up" | "down") => {
      const history = commandHistoryRef.current;
      if (history.length === 0) {
        return false;
      }

      if (direction === "up") {
        if (historyIndexRef.current === null) {
          historyDraftRef.current = currentInputRef.current;
          historyIndexRef.current = history.length - 1;
        } else if (historyIndexRef.current > 0) {
          historyIndexRef.current -= 1;
        }

        replaceCurrentInput(history[historyIndexRef.current] ?? "");
        return true;
      }

      if (historyIndexRef.current === null) {
        return false;
      }

      if (historyIndexRef.current < history.length - 1) {
        historyIndexRef.current += 1;
        replaceCurrentInput(history[historyIndexRef.current] ?? "");
        return true;
      }

      historyIndexRef.current = null;
      replaceCurrentInput(historyDraftRef.current);
      historyDraftRef.current = "";
      return true;
    };

    terminal.attachCustomKeyEventHandler((event) => {
      if (event.type !== "keydown" || !localEchoRef.current) {
        return true;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return true;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        browseHistory("up");
        return false;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        browseHistory("down");
        return false;
      }

      return true;
    });

    const focusTerminal = () => {
      terminal.focus();
    };

    mountNode.addEventListener("click", focusTerminal);
    mountNode.addEventListener("mousedown", focusTerminal);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const connect = () => {
      const existingSocket = socketRef.current;
      if (existingSocket) {
        existingSocket.close();
      }

      setStatus("connecting");
      setStatusMessage("Opening WebSocket bridge to Railway gateway.");

      const socket = new WebSocket(socketUrl);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("connected");
        setStatusMessage("Connected. Type directly into the terminal.");
        terminal.writeln("\x1b[32m[bridge]\x1b[0m Connected.\r\n");
        scheduleFit();
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          terminal.write(event.data);
          scheduleFit();
          return;
        }

        const chunk = new Uint8Array(event.data);
        const parsed = parseTelnetChunk(chunk);

        if (parsed.localEcho !== undefined) {
          localEchoRef.current = parsed.localEcho;
          if (!parsed.localEcho) {
            currentInputRef.current = "";
            historyIndexRef.current = null;
            historyDraftRef.current = "";
          }
        }

        for (const response of parsed.responses) {
          if (socket.readyState === WebSocket.OPEN) {
            sendToSocket(response);
          }
        }

        if (parsed.text.length > 0) {
          const text = decoder.decode(parsed.text);
          terminal.write(text);
          scheduleFit();
        }
      };

      socket.onerror = () => {
        setStatus("error");
        setStatusMessage("WebSocket bridge failed. Retry or use the raw telnet endpoint.");
        terminal.writeln("\r\n\x1b[31m[bridge]\x1b[0m Connection error.\r\n");
      };

      socket.onclose = () => {
        setStatus((current) => (current === "error" ? "error" : "disconnected"));
        setStatusMessage("Session closed. Reconnect to start a fresh terminal.");
        terminal.writeln("\r\n\x1b[33m[bridge]\x1b[0m Session closed.\r\n");
      };

      const disposable = terminal.onData((value) => {
        if (socket.readyState !== WebSocket.OPEN) {
          return;
        }

        if (localEchoRef.current && value === "\r") {
          const rawInput = currentInputRef.current;
          const trimmed = rawInput.trim();

          if (trimmed.length > 0) {
            const history = commandHistoryRef.current;
            if (history[history.length - 1] !== rawInput) {
              history.push(rawInput);
            }
          }

          currentInputRef.current = "";
          historyIndexRef.current = null;
          historyDraftRef.current = "";

          writeLocalInput((text) => terminal.write(text), value, true);

          const resolvedAlias = resolveAlias(rawInput, aliasMapRef.current);
          if (resolvedAlias) {
            if (rawInput.length > 0) {
              sendToSocket("\u007f".repeat(rawInput.length));
            }

            terminal.writeln(
              `\x1b[36m[alias]\x1b[0m ${resolvedAlias.alias.key} -> ${resolvedAlias.preview}`,
            );
            sendToSocket(`${resolvedAlias.commands.join("\r")}\r`);
            scheduleFit();
            return;
          }

          sendToSocket(value);
          return;
        }

        if (localEchoRef.current) {
          if (value === "\u001b[A") {
            browseHistory("up");
            return;
          }

          if (value === "\u001b[B") {
            browseHistory("down");
            return;
          }
        }

        if (localEchoRef.current) {
          for (const char of value) {
            if (char === "\u007f") {
              currentInputRef.current = currentInputRef.current.slice(0, -1);
              historyIndexRef.current = null;
              historyDraftRef.current = "";
              continue;
            }

            if (char >= " " || char === "\t") {
              currentInputRef.current += char;
              historyIndexRef.current = null;
              historyDraftRef.current = "";
            }
          }
        }

        writeLocalInput((text) => terminal.write(text), value, localEchoRef.current);
        sendToSocket(value);
      });

      return () => {
        disposable.dispose();
        socket.close();
      };
    };

    const disconnect = connect();

    const handleResize = () => {
      scheduleFit();
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleFit();
    });
    resizeObserver.observe(mountNode);

    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        scheduleFit();
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (viewportSyncTimer !== null) {
        window.clearTimeout(viewportSyncTimer);
      }
      mountNode.removeEventListener("click", focusTerminal);
      mountNode.removeEventListener("mousedown", focusTerminal);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      disconnect?.();
      socketRef.current = null;
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [aliasMapRef, sessionKey, socketUrl]);

  return {
    terminalHostRef,
    status,
    statusMessage,
    reconnect: () => setSessionKey((current) => current + 1),
  };
}
