import { connect } from "amqplib";
import { readFile } from "fs/promises";

const queueName = process.argv[2] || "jobsQueue";

const data = JSON.parse(
  await readFile(new URL("./data.json", import.meta.url))
);

const connection = await connect("amqp://localhost:5672");
const channel = await connection.createChannel();

async function consume() {
  try {
    console.log("Incoming Messages ...");
    channel.consume(queueName, (message) => {
      const incomingMessage = JSON.parse(message.content.toString());
      const predicateCb = (message) => message.id === incomingMessage.id;
      const messageInfo = data.find(predicateCb);
      if (messageInfo) {
        console.log("Processed Message : \n", messageInfo);
        channel.ack(message);
      }
    });
  } catch (error) {
    console.log("Error: ", error);
  }
}

await consume();
