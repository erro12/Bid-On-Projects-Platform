import axios from 'axios';

export const employerInstance = axios.create({
    baseURL: 'http://3.133.60.237:3001/employer',
    withCredentials: true
})

export const studentInstance = axios.create({
    baseURL: 'http://3.133.60.237:3001/student',
    withCredentials: true
})

export const adminInstance = axios.create({
    baseURL: 'http://3.133.60.237:3001/admin',
    withCredentials: true
})

export const userInstance = axios.create({
    baseURL: 'http://3.133.60.237:3001/user',
    withCredentials: true
})