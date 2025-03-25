import axios from 'axios';

const BASE_URL = "https://api.example.com";

const ENDPOINTS = {
    getModel: "/user/{id}",
  };

  const sendRequest = async (endpointKey, params = {}, method = 'GET') => {
    let endpoint = ENDPOINTS[endpointKey];
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointKey} not found in API configuration`);
    }
  
    for (const key in params) {
      endpoint = endpoint.replace(`{${key}}`, params[key]);
    }
  
    const url = BASE_URL + endpoint;
  
    const options = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    if (method !== 'GET' && params.body) {
      options.data = params.body;
    }
  
    try {
      const response = await axios(options);
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };
  
  export { sendRequest };
