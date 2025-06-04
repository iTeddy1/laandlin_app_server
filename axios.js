import axios from 'axios'

export const API = axios.create({ withCredentials: true, baseURL: process.env.EXPO_API_URL })
