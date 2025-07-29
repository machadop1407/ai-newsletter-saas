import { Inngest } from "inngest";

// Create the Inngest client
export const inngest = new Inngest({
  id: "personalized-newsletter",
  name: "Personalized Newsletter Generator",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
