import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';
const SELLERS_CACHE_KEY = 'shopco-sellers-cache';
const TOKEN_STORAGE_KEY = 'token';

function readCachedSellers() {
  try {
    const saved = localStorage.getItem(SELLERS_CACHE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cacheSeller(seller) {
  if (!seller || (!seller.id && !seller._id && !seller.email)) return;

  const normalizedSeller = {
    id: seller.id || seller._id || seller.email,
    name: seller.name || 'Seller',
    email: (seller.email || '').toLowerCase(),
    logo: seller.logo || '',
    role: seller.role || 'user',
  };

  const current = readCachedSellers().filter(
    (item) =>
      item.email !== normalizedSeller.email && item.id !== normalizedSeller.id,
  );

  try {
    localStorage.setItem(
      SELLERS_CACHE_KEY,
      JSON.stringify([normalizedSeller, ...current]),
    );
  } catch (error) {
    console.error('Unable to cache seller info:', error);
  }
}

export async function registerAccount({ name, email, password, logo }) {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      name: name?.trim(),
      email: email?.trim(),
      password,
    });

    const { user, token } = response.data || {};
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }

    const account = {
      id: user?.id || user?._id,
      name: user?.name || name?.trim(),
      email: (user?.email || email || '').toLowerCase(),
      role: user?.role || 'user',
      logo: logo?.trim() || '',
    };

    cacheSeller(account);
    return account;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to create your account. Please try again.';
    throw new Error(message);
  }
}

export async function authenticateAccount({ email, password }) {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email: email?.trim(),
      password,
    });

    const { user, token } = response.data || {};
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }

    const cachedMatch = readCachedSellers().find(
      (item) => item.email === (user?.email || email || '').toLowerCase(),
    );

    const account = {
      id: user?.id || user?._id,
      name: user?.name || cachedMatch?.name || 'Seller',
      email: (user?.email || email || '').toLowerCase(),
      role: user?.role || cachedMatch?.role || 'user',
      logo: cachedMatch?.logo || '',
    };

    cacheSeller(account);
    return account;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Email or password is incorrect.';
    throw new Error(message);
  }
}

export function getPublicSellers() {
  return readCachedSellers().map(({ id, name, email, logo }) => ({
    id,
    name,
    email,
    logo: logo ?? '',
  }));
}