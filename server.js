const express = require('express');
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say('Benvenuto. Chiamando Twilio con n8n.', { language: 'it-IT' });
  twiml.redirect('TUO_WEBHOOK_N8N_URL');  // n8n gestirà Cartesia e risposta
  res.type('text/xml');
  res.send(twiml.toString());
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server su porta ${port}`));
