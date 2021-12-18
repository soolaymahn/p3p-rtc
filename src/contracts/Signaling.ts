import { AbiItem } from "web3-utils";

export const SignalingAddress = "0xdf9E7449C21657240d5A98a206492D9763e0DB65";

export const SignalingABI: AbiItem[] = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_type",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_message",
        type: "string",
      },
    ],
    name: "Message",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "string",
        name: "messageType",
        type: "string",
      },
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
