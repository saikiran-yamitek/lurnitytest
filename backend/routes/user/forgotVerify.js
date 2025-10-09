// routes/user/forgotVerify.js
import { fpGetRequest, fpVerifyChannel, fpMarkBothVerified } from '../../models/User.js';
import { handleOptionsRequest, createResponse } from '../../utils/cors.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();
  try {
    const { requestId, emailOtp, smsOtp } = JSON.parse(event.body || '{}');
    if (!requestId || !emailOtp || !smsOtp) return createResponse(400, { msg: 'Missing fields' });

    const req = await fpGetRequest(requestId);
    if (!req) return createResponse(400, { msg: 'Invalid request' });

    const rE = await fpVerifyChannel({ request: req, channel: 'email', code: emailOtp });
    const rS = await fpVerifyChannel({ request: req, channel: 'sms', code: smsOtp });
    if (!rE.ok || !rS.ok) return createResponse(400, { msg: 'Invalid or expired code' });

    await fpMarkBothVerified(requestId);
    return createResponse(200, { ok: true });
  } catch (e) {
    console.error('forgotVerify error', e);
    return createResponse(500, { msg: 'Verification failed' });
  }
};
