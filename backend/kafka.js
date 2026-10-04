const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');

const kafka = new Kafka({
  clientId: 'trainu-app',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  retry: {
    initialRetryTime: 3000,
    retries: 10
  }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'email-group' });
const admin = kafka.admin();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function initKafka() {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await admin.connect();

      const topics = await admin.listTopics();
      if (!topics.includes('email-notifications')) {
        await admin.createTopics({
          topics: [{ topic: 'email-notifications', numPartitions: 1, replicationFactor: 1 }]
        });
        console.log('[Kafka] Topic email-notifications created');
      }

      await admin.disconnect();
      break;
    } catch (err) {
      console.warn(`[Kafka] Admin attempt ${attempt}/${maxAttempts} failed: ${err.message}`);
      if (attempt === maxAttempts) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  await producer.connect();

  await consumer.connect();
  await consumer.subscribe({ topics: ['email-notifications'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { to, subject, html } = JSON.parse(message.value.toString());
      try {
        await transporter.sendMail({
          from: `"TrainU+" <${process.env.SMTP_USER}>`,
          to, subject, html
        });
        console.log(`[Kafka] Email sent to ${to}`);
      } catch (err) {
        console.error('[Kafka] Email failed:', err.message);
      }
    }
  });

  console.log('[Kafka] Producer and consumer ready');
}

async function sendEmailEvent({ to, subject, html }) {
  await producer.send({
    topic: 'email-notifications',
    messages: [{ value: JSON.stringify({ to, subject, html }) }]
  });
}

module.exports = { initKafka, sendEmailEvent };