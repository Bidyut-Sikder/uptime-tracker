import { Keypair } from "@solana/web3.js";
import { randomUUIDv7 } from "bun";
import nacl from "tweetnacl";
import type {
  OutgoingMessage,
  SignupOutgoingMessage,
  ValidateOutgoingMessage,
} from "common/types";
const callbacks: { [calbackId: string]: (data: SignupOutgoingMessage) => void } = {};
let validatorId: string | null = null;

const main = async () => {
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.SOLANA_PRIVATE_KEY as string))
  );
  const ws = new WebSocket("ws://localhost:5050");

  ws.onopen = async () => {
    const callbackId = randomUUIDv7();
    console.log("connencted");
    const signedMessage = signMessage(
      keypair,
      `Signed Message For ${callbackId} ${keypair.publicKey}`
    );

    ws.send(
      JSON.stringify({
        type: "signup",
        data: {
          callbackId,
          signedMessage,
          publicKey: keypair.publicKey,
          ip: "192.168.1.1",
          location: "Dhaka",
        },
      })
    );

    callbacks[callbackId] = (data: SignupOutgoingMessage) => {
      validatorId = data.validatorId;
    };
  };

  ws.onmessage = async (event) => {
    const data: OutgoingMessage = JSON.parse(event.data);

    if (data.type === "signup") {
      callbacks[data.data.callbackId]?.(data.data);
      delete callbacks[data.data.callbackId];
    } else if (data.type === "validate") {
      await validateHandler(ws, data.data, keypair);
    }
  };
};

main();

const validateHandler = async (
  ws: any,
  { callbackId, url }: ValidateOutgoingMessage,
  keypair: any
) => {
  const signedMessage = signMessage(
    keypair,
    `Validation Message For ${callbackId} and ${keypair.publicKey}`
  );

  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    const duration = endTime - startTime;

    ws.send(
      JSON.stringify({
        type: "validate",
        data: {
          callbackId,
          signedMessage,
          latency: duration,
          status: response.status === 200 ? "Good" : "Bad",
          validatorId,
        },
      })
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: "validate",
        data: {
          callbackId,
          signedMessage,
          latency: 100,
          status: "Bad",
          validatorId,
        },
      })
    );
  }
};

export function signMessage(keypair: any, message: string) {
  const messageUint8 = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageUint8, keypair.secretKey);
  return Buffer.from(signature).toString("hex"); // Convert signature to hex for easy transport
}
