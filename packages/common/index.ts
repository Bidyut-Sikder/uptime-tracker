export interface SignupIncomingMessage {
  //initiated from the validator
  ip: string;
  publicKey: string;
  signedMessage: string;
  callbackId: string;
  location:string
}

export interface ValidateIncomingMessage {
  //initiated from the websoket client

  callbackId: string;
  signedMessage: string;
  status: "Good" | "Bad";
  latency: number;
  // websiteId: string;
  validatorId: string;
}

export interface SignupOutgoingMessage {
  //response from the hub
  validatorId: string;
  callbackId: string;
}

export interface ValidateOutgoingMessage {
  //response from the validator

  url: string;
  callbackId: string;
  // websiteId: string;
}

export type IncomingMessage =
  | {
      type: "signup";
      data: SignupIncomingMessage;
    }
  | {
      type: "validate";
      data: ValidateIncomingMessage;
    };

export type OutgoingMessage =
  | {
      type: "signup";
      data: SignupOutgoingMessage;
    }
  | {
      type: "validate";
      data: ValidateOutgoingMessage;
    };
