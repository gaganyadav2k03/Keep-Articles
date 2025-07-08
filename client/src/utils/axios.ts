import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6050/api',
  withCredentials: true,
});

export default instance;
