// routes/user/forgotReset.js
import { fpGetRequest, fpClearRequest, updateUserPasswordWithPolicy } from '../../models/User.js';
import { handleOptionsRequest, createResponse } from '../../utils/cors.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptionsRequest();
  try {
    const { requestId, newPassword } = JSON.parse(event.body || '{}');
    if (!requestId || !newPassword) return createResponse(400, { msg: 'Missing fields' });
    if (newPassword.length < 10) return createResponse(400, { msg: 'Password too short' });

    const req = await fpGetRequest(requestId);
    if (!req || !req.bothVerified) return createResponse(400, { msg: 'Verification required' });

    await updateUserPasswordWithPolicy(req.userId, newPassword);
    await fpClearRequest(requestId);

    return createResponse(200, { ok: true });
  } catch (e) {
    console.error('forgotReset error', e);
    return createResponse(500, { msg: 'Reset failed' });
  }
};
