// utils/cors.js
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json'
};

export const handleOptionsRequest = () => ({
  statusCode: 200,
  headers: {
    ...corsHeaders,
    'Access-Control-Max-Age': '86400'
  },
  body: ''
});

export const createResponse = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});
