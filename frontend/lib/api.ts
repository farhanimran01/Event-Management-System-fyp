import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies
});

// Add a request interceptor to attach the token if available (though cookies handle it usually, 
// if we use localStorage or want to be explicit we add Authorization header)
api.interceptors.request.use(
    (config) => {
        // If we were using localStorage:
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        // Since we are using cookies handled by backend for browser, we might not need this 
        // BUT if we want to read the cookie manually if it's not httpOnly:
        // const token = Cookies.get('token');
        // if (token) {
        //    config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login?)
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
