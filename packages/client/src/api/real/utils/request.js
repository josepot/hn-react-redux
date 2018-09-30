const N_TRIES = 3;

const headers = {'Content-Type': 'application/json; charset=utf-8'};
const BASE_URL = process.env.API_BASE_URL;

const buildQs = obj =>
  Object.keys(obj)
    .filter(key => obj[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${obj[key]}`)
    .join('&');

const request = async (
  path,
  payload,
  method = 'GET',
  retriesLeft = N_TRIES
) => {
  const queryString = method === 'GET' && payload ? buildQs(payload) : '';
  const uri = `${BASE_URL}${path}${queryString}`;
  const body =
    method !== 'GET' && payload ? JSON.stringify(payload, null, 2) : undefined;
  const response = await fetch(uri, {headers, method, body});
  if (!response.ok && retriesLeft === 0) {
    throw new Error(
      `Request to ${uri} failed with code ${response.code} and response: ${
        response.body
      }`
    );
  }

  if (!response.ok) {
    return request(uri, method, payload, retriesLeft - 1);
  }

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    throw new Error(
      `Malformatted Error Exception while requesting ${uri}. The server returned an invalid response: ${
        response.body
      }`
    );
  }
};
