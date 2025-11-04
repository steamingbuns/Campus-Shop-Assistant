const DEFAULT_BASE_URL = 'http://localhost:5000/api';
const { VITE_API_BASE_URL } = import.meta.env;
const BASE_URL = (VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

function ensureLeadingSlash(path = '') {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

function hasOptionKeys(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return ['data', 'token', 'params', 'headers'].some((key) => Object.prototype.hasOwnProperty.call(value, key));
}

function normalizeReadOptions(optionsOrToken) {
  if (hasOptionKeys(optionsOrToken)) {
    return { ...optionsOrToken };
  }
  if (optionsOrToken !== null && optionsOrToken !== undefined) {
    return { token: optionsOrToken };
  }
  return {};
}

function normalizeMutationOptions(dataOrOptions, tokenOrOptions) {
  let options = {};

  if (hasOptionKeys(dataOrOptions)) {
    options = { ...dataOrOptions };
  } else if (dataOrOptions !== undefined && dataOrOptions !== null) {
    options.data = dataOrOptions;
  }

  if (hasOptionKeys(tokenOrOptions)) {
    options = { ...options, ...tokenOrOptions };
  } else if (tokenOrOptions !== undefined && tokenOrOptions !== null) {
    options.token = tokenOrOptions;
  }

  return options;
}

function buildUrl(endpoint, params) {
  const resolvedEndpoint = ensureLeadingSlash(endpoint);
  const url = new URL(`${BASE_URL}${resolvedEndpoint}`);

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.append(key, value);
    });
  }

  return url.toString();
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204 || !contentType) {
    return null;
  }
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : null;
}

async function request(method, endpoint, options = {}) {
  const { data, token, params, headers: extraHeaders } = options;

  const headers = {
    Accept: 'application/json',
    ...(extraHeaders || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const hasBody = data !== undefined && data !== null;
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
    credentials: 'include',
    mode: 'cors',
  };

  if (hasBody) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(buildUrl(endpoint, params), config);
    const result = await parseResponseBody(response);

    if (!response.ok) {
      const message = result?.error || result?.message || `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.body = result;
      throw error;
    }

    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the API server. Please check your connection and try again.');
    }
    throw error;
  }
}

const api = {
  request,
  get(endpoint, options) {
    return request('GET', endpoint, normalizeReadOptions(options));
  },
  post(endpoint, dataOrOptions, tokenOrOptions) {
    return request('POST', endpoint, normalizeMutationOptions(dataOrOptions, tokenOrOptions));
  },
  put(endpoint, dataOrOptions, tokenOrOptions) {
    return request('PUT', endpoint, normalizeMutationOptions(dataOrOptions, tokenOrOptions));
  },
  patch(endpoint, dataOrOptions, tokenOrOptions) {
    return request('PATCH', endpoint, normalizeMutationOptions(dataOrOptions, tokenOrOptions));
  },
  delete(endpoint, options) {
    return request('DELETE', endpoint, normalizeReadOptions(options));
  },
};

export default api;