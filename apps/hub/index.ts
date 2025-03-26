import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { prismaClient } from "db/client";
import { randomUUIDv7 } from "bun";
import type {
  IncomingMessage,
  SignupIncomingMessage,
  ValidateIncomingMessage,
} from "common/types";

const totalValidators: any = [];
const callbacks: {
  [callbackId: string]: (data: ValidateIncomingMessage) => void;
} = {};
let COST_PER_VALIDATION = 5;
//websocket server starts here

Bun.serve({
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  port: 5050,
  websocket: {
    async message(ws: any, message: string) {
      const data: IncomingMessage = JSON.parse(message);

      if (data.type === "signup") {
        const verfied = verifyMessage(
          data.data.publicKey,
          `Signed Message For ${data.data.callbackId} ${data.data.publicKey}`,
          data.data.signedMessage
        );
        // console.log(verfied);
        if (verfied) {
          await signupHandler(ws, data.data);
        }
      } else if (data.type === "validate") {
        // console.log(data)
        callbacks[data.data.callbackId]?.(data.data);
        delete callbacks[data.data.callbackId];
      }
    },
  }, // handlers
});

setInterval(async () => {
  const totalWebsites = await prismaClient.website.findMany({});
  for (const website of totalWebsites) {
    totalValidators.forEach((validator: any) => {
      const callbackId = randomUUIDv7();
      validator.ws.send(
        JSON.stringify({
          type: "validate",
          data: {
            callbackId,
            url: website.url,
          },
        })
      );

      callbacks[callbackId] = async ({
        validatorId,
        callbackId,
        status,
        latency,
        signedMessage,
      }: ValidateIncomingMessage) => {
        const verification = verifyMessage(
          validator.publicKey,
          `Validation Message For ${callbackId} and ${validator.publicKey}`,
          signedMessage
        );

        if (!verification) {
          return;
        }
        await prismaClient.$transaction(async (prisma) => {
          await prisma.websiteTick.create({
            data: {
              websiteId: website.id,
              validatorId,
              createdAt: new Date(),

              status,
              latency,
            },
          });

          await prismaClient.validator.update({
            where: { id: validatorId },
            data: {
              pendingPayouts: { increment: COST_PER_VALIDATION },
            },
          });
        });
      };
    });
  }
}, 5000);

const signupHandler = async (ws: any, data: SignupIncomingMessage) => {
  const { ip, location, callbackId, publicKey } = data;

  const validatorFromDB = await prismaClient.validator.findFirst({
    where: {
      publicKey,
    },
  });

  if (validatorFromDB) {
    ws.send(
      JSON.stringify({
        type: "signup",
        data: {
          callbackId,
          validatorId: validatorFromDB.id,
        },
      })
    );

    totalValidators.push({ publicKey, ws, validatorId: validatorFromDB.id });
    return;
  }

  const validator = await prismaClient.validator.create({
    data: {
      ip,
      location,
      publicKey,
    },
  });

  ws.send(
    JSON.stringify({
      type: "signup",
      data: {
        callbackId,
        validatorId: validator.id,
      },
    })
  );
  totalValidators.push({ publicKey, ws, validatorId: validator.id });
};

export function verifyMessage(
  publicKeyString: string,
  message: string,
  signatureHex: any
) {
  const messageUint8 = new TextEncoder().encode(message);
  const signatureUint8 = new Uint8Array(Buffer.from(signatureHex, "hex"));
  const publicKey = new PublicKey(publicKeyString);

  return nacl.sign.detached.verify(
    messageUint8,
    signatureUint8,
    publicKey.toBytes()
  );
}
