require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// ENV da impostare su Railway
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  TWILIO_APP_SID,
  TWILIO_CALLER_ID
} = process.env;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 1) Endpoint per generare token Voice JS SDK
app.get('/token', (req, res) => {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const identity = 'web-user'; // client identity fissa per demo

    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity, ttl: 3600 }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_APP_SID,
      incomingAllow: true
    });

    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt(), identity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cannot generate token' });
  }
});

// 2) Webhook Twilio: chiamata IN che viene inoltrata al client web
app.post('/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  // inoltra la chiamata al client "web-user" (browser)
  twiml.dial().client('web-user');

  res.type('text/xml');
  res.send(twiml.toString());
});

// 3) Endpoint semplice per outbound (se vuoi chiamare tu il numero Twilio)
app.post('/outbound', async (req, res) => {
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  try {
    const call = await client.calls.create({
      to: TWILIO_CALLER_ID,          // il tuo cellulare
      from: '+17752583966',          // tuo numero Twilio
      url: `${process.env.PUBLIC_URL}/twiml`
    });
    res.json({ sid: call.sid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Cannot create call' });
  }
});

// 4) Endpoint TwiML di test (non obbligatorio per la demo)
app.post('/twiml', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Ciao, questa è la demo di Aiflate su Twilio.');
  res.type('text/xml').send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
