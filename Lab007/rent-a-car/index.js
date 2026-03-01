const express = require('express');
const cors = require('cors');
const { DefaultAzureCredential } = require('@azure/identity');
const { ServiceBusClient } = require('@azure/service-bus');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/rent', async (req, res) => {
  const { name, email, model, year, rentPeriod } = req.body;

  const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING || '';

  const vehicle = {
    model,
    year,
    rentPeriod,
  };

  const message = {
    name,
    email,
    vehicle,
    date: new Date().toISOString(),
  };

  try {
    const credential = new DefaultAzureCredential();
    const queueName = 'queue-locacoes';
    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(queueName);
    const sbMessage = {
      body: message,
      contentType: 'application/json',
    };
    await sender.sendMessages(sbMessage);
    await sender.close();
    await sbClient.close();
    res.status(201).json({ message: 'Rental request sent successfully!' });
  } catch (error) {
    console.error('Error sending rental request:', error);
    res.status(500).json({ error: 'Failed to send rental request' });
  }
});

app.listen(3000, () => {
  console.log('Rent-a-Car API is running on http://localhost:3000');
});
