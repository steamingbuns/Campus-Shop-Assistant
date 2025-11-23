const BASE_URL = "http://localhost:5000/api";

const api = {
  // Generic request method
  async request(method, endpoint, data = null, token = null) {
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Try to get token from localStorage
      try {
        const savedUser = localStorage.getItem('campusShopUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.token) {
            headers["Authorization"] = `Bearer ${userData.token}`;
          }
        }
      } catch (e) {
        console.error("Error reading token from localStorage", e);
      }
    }

    const config = {
      method,
      headers,
      credentials: "include", // Include cookies for session management
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }

    console.log(`API ${method} ${BASE_URL}${endpoint}`, data ? { data } : '');

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      console.log(`API Response ${response.status}:`, endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Request failed" }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.message || "Request failed");
      }
      
      // Handle 204 No Content responses (no body to parse)
      if (response.status === 204) {
        console.log('API Success: 204 No Content');
        return null;
      }
      
      const result = await response.json();
      console.log('API Success:', result);
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