// routes/user/forgotRequest.js
import { v4 as uuidv4 } from 'uuid';
import { findUserByEmail, fpCreateAndStoreOtps, fpSendEmailOtp, fpSendSmsOtp } from '../../models/User.js';
import { handleOptionsRequest, createResponse } from '../../utils/cors.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) return createResponse(400, { msg: 'Email required' });

    const user = await findUserByEmail(email);
    // non-enumerating response
    if (!user || !user.phone) {
      return createResponse(200, { msg: 'If the account exists, OTPs were sent' });
    }

    const requestId = uuidv4();
    const { emailCode, smsCode } = await fpCreateAndStoreOtps({ requestId, userId: user.id });

    await Promise.all([
      fpSendEmailOtp(user.email, emailCode),
      fpSendSmsOtp(user.phone, smsCode),
    ]);

    return createResponse(200, {
      requestId,
      maskedEmail: maskEmail(user.email),
      maskedPhone: maskPhone(user.phone),
      msg: 'OTPs sent',
    });
  } catch (e) {
    console.error('forgotRequest error', e);
    return createResponse(500, { msg: 'Unable to process reset request' });
  }
};

function maskEmail(e) {
  const [u, d] = String(e).split('@');
  if (!u || !d) return '***';
  return `${u[0]}****@${d}`;
}

function maskPhone(p) {
  const s = String(p);
  // +CC ******** 12
  return s.replace(/^(\+\d{1,3})(\d+)(\d{2})$/, (_, c, mid, last) => `${c}${'*'.repeat(mid.length)}${last}`);
}
