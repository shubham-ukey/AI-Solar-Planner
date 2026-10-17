import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAdminSession } from '../services/adminAuth.js';
export default function AdminRoute(){const location=useLocation();const [session,setSession]=useState(()=>getAdminSession());useEffect(()=>{const check=()=>setSession(getAdminSession());const timer=setInterval(check,5000);window.addEventListener('focus',check);return()=>{clearInterval(timer);window.removeEventListener('focus',check);};},[]);return session?<Outlet/>:<Navigate to="/admin" replace state={{from:location.pathname}}/>;}
