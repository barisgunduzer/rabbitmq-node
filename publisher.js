import { connect } from "amqplib";
import { readFile } from "fs/promises";

const message = {
  id: 0,
};

const data = JSON.parse(
  await readFile(new URL("./data.json", import.meta.url))
);

const queueName = process.argv[2] || "jobsQueue";

const connection = await connect("amqp://localhost:5672");
const channel = await connection.createChannel();
const assertion = await channel.assertQueue(queueName);

async function publish() {
  try {
    data.map((object) => {
      message.id = object.id;
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
      console.log("Message Id: ", object.id);
    });
  } catch (error) {
    console.log("Error: ", error);
  }
}

publish().then(() => {
  console.log("Queue Name: ", assertion.queue);
  console.log("Total Consumer Count: ", assertion.consumerCount);
});
