import axios from 'axios';

// Read environment directly from process.env (populated by dotenv in nuxt.config.ts)
function loadEnvFromProcess() {
  return {
    // Prefer un-prefixed vars if you want to keep them server-only.
    // For client-side availability during build, also support NUXT_PUBLIC_* fallbacks.
    BACKEND_URL:
      process.env.BACKEND_URL ||
      process.env.NUXT_PUBLIC_BACKEND_URL ||
      'https://meridian.mpanel.app/api/webV3',
    COMMENT_BACKEND_URL:
      process.env.COMMENT_BACKEND_URL ||
      process.env.NUXT_PUBLIC_COMMENT_BACKEND_URL ||
      'https://meridian.mpanel.app/api/v1/ios',
    API_KEY:
      process.env.API_KEY ||
      process.env.NUXT_PUBLIC_API_KEY ||
      // When bundled for client, use the Vite-injected value if present
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) ||
      ''
  }
}

function resolveConfig() {
  const env = loadEnvFromProcess()
  return {
    BACKEND_URL: env.BACKEND_URL,
    COMMENT_BACKEND_URL: env.COMMENT_BACKEND_URL,
    API_KEY: env.API_KEY
  }
}

const RESOLVED = resolveConfig()
const BASE_URL = RESOLVED.BACKEND_URL
const COMMENT_BASE_URL = RESOLVED.COMMENT_BACKEND_URL
const API_KEY = RESOLVED.API_KEY

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: API_KEY,
  }
});

const commentApiClient = axios.create({
  baseURL: COMMENT_BASE_URL,
  headers: {
    Authorization: API_KEY,
  }
});

const authApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: API_KEY,
  }
});

// Ensure Authorization is attached using the latest runtime/env on every request
function attachAuthInterceptor(client) {
  client.interceptors.request.use((config) => {
    const { API_KEY: LATEST_API_KEY } = resolveConfig();
    config.headers = config.headers || {};
    if (LATEST_API_KEY) {
      config.headers.Authorization = LATEST_API_KEY;
    }
    return config;
  });
}

attachAuthInterceptor(apiClient);
attachAuthInterceptor(commentApiClient);
attachAuthInterceptor(authApiClient);

export const fetchFromApi = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

export const postComment = async (articleId, commentData) => {
  try {
    const response = await commentApiClient.post(`/setComment/${articleId}`, {
      name: commentData.name,
      content: commentData.content,
      type: commentData.type,
      email: commentData.email || '',
      ...(commentData.commentId && { commentId: commentData.commentId })
    });
    return response.data;
  } catch (error) {
    console.error(`Error posting comment:`, error);
    throw error;
  }
};

export const registerUser = async (registrationData) => {
  try {
    const response = await authApiClient.post('/auth/register', {
      email: registrationData.email,
      password: registrationData.password,
      repeat_password: registrationData.repeatPassword,
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      phone_number: registrationData.phoneNumber || '',
      city: registrationData.city
    });
    return response.data;
  } catch (error) {
    console.error(`Error registering user:`, error);
    throw error;
  }
};

export const loginUser = async (loginData) => {
  try {
    const response = await authApiClient.post('/auth/login', {
      email: loginData.email,
      password: loginData.password
    });
    return response.data;
  } catch (error) {
    console.error(`Error logging in user:`, error);
    throw error;
  }
};

export const updateUserProfile = async (profileData, jwtToken) => {
  try {
    const response = await authApiClient.post('/profile/update/data', {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      city: profileData.city,
      phone_number: profileData.phoneNumber
    }, {
      headers: {
        Authorization: API_KEY,
        'Jwt-token': jwtToken
      }
    });
    console.log("response.data", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating user profile:`, error);
    throw error;
  }
};

export const updateUserPassword = async (passwordData, jwtToken) => {
  try {
    const response = await authApiClient.post('/profile/update/password', {
      old_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      repeat_password: passwordData.confirmPassword
    }, {
      headers: {
        Authorization: API_KEY,
        'Jwt-token': jwtToken
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating user password:`, error);
    throw error;
  }
};

export const fetchCustomCategories = async (jwtToken) => {
  try {
    const response = await apiClient.get('/getCustomCategories', {
      headers: {
        Authorization: API_KEY,
        'Jwt-token': jwtToken
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching custom categories:`, error);
    throw error;
  }
};

export const fetchFooterMenu = async () => {
  try {
    const response = await apiClient.get('/getFooterMenu', {
      headers: {
        Authorization: API_KEY,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching footer menu:`, error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    const response = await apiClient.get('/getOrders', {
      headers: {
        Authorization: API_KEY,
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders:`, error);
    throw error;
  }
};

// Example usage:
// fetchFromApi('/getArticles', { articleLimit: 7 }) 

// Fetch authenticated user data after login
export const fetchUserData = async (jwtToken, email, password) => {
  try {
    const response = await authApiClient.get('/profile/get/data', {
      headers: {
        Authorization: API_KEY,
        'Jwt-token': jwtToken,
      },
      data: { email, password },
      params: { email, password },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user data:`, error);
    throw error;
  }
};

export const addNewsletterEmail = async (email) => {
  try {
    const response = await apiClient.post('/nwsl/subscribe', {
      email
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding newsletter email:`, error);
    throw error;
  }
};

