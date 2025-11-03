const BASE_URL = "http://localhost:5000/api";

const api = {
  // Generic request method
  async request(method, endpoint, data = null, token = null) {
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      credentials: "include", // Include cookies for session management
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Request failed");
      }
      
      return result;
    }
    catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  get(endpoint, token = null) {
    return this.request("GET", endpoint, null, token);
  },

  post(endpoint, data, token = null) {
    return this.request("POST", endpoint, data, token);
  },

  patch(endpoint, data, token = null) {
    return this.request("PATCH", endpoint, data, token);
  },

  put(endpoint, data, token = null) {
    return this.request("PUT", endpoint, data, token);
  },

  delete(endpoint, token = null) {
    return this.request("DELETE", endpoint, null, token);
  },
};

export default api;