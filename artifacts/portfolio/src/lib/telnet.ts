const IAC = 255;
const DONT = 254;
const DO = 253;
const WONT = 252;
const WILL = 251;
const SB = 250;
const GA = 249;
const SE = 240;

const ECHO = 1;
const SUPPRESS_GO_AHEAD = 3;

type TelnetCommand = typeof DONT | typeof DO | typeof WONT | typeof WILL;

function buildNegotiation(command: TelnetCommand, option: number): Uint8Array {
  return Uint8Array.from([IAC, command, option]);
}

function getNegotiationResponse(command: TelnetCommand, option: number): Uint8Array {
  switch (command) {
    case WILL:
      return buildNegotiation(option === ECHO || option === SUPPRESS_GO_AHEAD ? DO : DONT, option);
    case WONT:
      return buildNegotiation(DONT, option);
    case DO:
      return buildNegotiation(option === SUPPRESS_GO_AHEAD ? WILL : WONT, option);
    case DONT:
      return buildNegotiation(WONT, option);
  }
}

export function parseTelnetChunk(chunk: Uint8Array): {
  text: Uint8Array;
  responses: Uint8Array[];
  localEcho?: boolean;
} {
  const textBytes: number[] = [];
  const responses: Uint8Array[] = [];
  let localEcho: boolean | undefined;

  for (let index = 0; index < chunk.length; index += 1) {
    const byte = chunk[index];

    if (byte !== IAC) {
      textBytes.push(byte);
      continue;
    }

    const command = chunk[index + 1];
    if (command === undefined) {
      break;
    }

    index += 1;

    if (command === IAC) {
      textBytes.push(IAC);
      continue;
    }

    if (command === GA) {
      continue;
    }

    if (command === SB) {
      while (index + 1 < chunk.length) {
        index += 1;
        if (chunk[index] === IAC && chunk[index + 1] === SE) {
          index += 1;
          break;
        }
      }
      continue;
    }

    if (command === WILL || command === WONT || command === DO || command === DONT) {
      const option = chunk[index + 1];
      if (option === undefined) {
        break;
      }

      index += 1;
      responses.push(getNegotiationResponse(command, option));

      if (option === ECHO) {
        if (command === WILL) {
          localEcho = false;
        } else if (command === WONT) {
          localEcho = true;
        }
      }
    }
  }

  return {
    text: Uint8Array.from(textBytes),
    responses,
    localEcho,
  };
}

export function writeLocalInput(
  write: (value: string) => void,
  value: string,
  localEchoEnabled: boolean,
): void {
  if (!localEchoEnabled) {
    return;
  }

  for (const char of value) {
    if (char === "\r") {
      write("\r\n");
      continue;
    }

    if (char === "\u007f") {
      write("\b \b");
      continue;
    }

    if (char === "\u001b" || char < " " && char !== "\t") {
      continue;
    }

    write(char);
  }
}
