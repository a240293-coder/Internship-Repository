import React, { useState, useEffect } from 'react';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../../lib/api';
import './Auth.css';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';







// This page is intentionally disabled for security.
// Admin login is only available at the unique URL after deployment.
export default function DisabledAdminLogin() {
  return <h1>404 - Not Found</h1>;
}
