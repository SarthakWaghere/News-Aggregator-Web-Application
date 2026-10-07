import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// SVG Icons as inline functional components
const IconRefresh = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={{ width: '1.25rem', height: '1.25rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem', opacity: 0.6 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
  </svg>
);

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1rem', height: '1rem', marginRight: '0.25rem', verticalAlign: 'middle', display: 'inline-block' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const IconExternalLink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1rem', height: '1rem', marginLeft: '0.25rem', display: 'inline-block', verticalAlign: 'middle' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);

const IconBookmark = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.1rem', height: '1.1rem', marginRight: '0.35rem', verticalAlign: 'middle' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '1.1rem', height: '1.1rem', marginRight: '0.35rem', verticalAlign: 'middle' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

// Dynamic gradient placeholders for categories if no image exists
const CategoryPlaceholder = ({ category }) => {
  const gradients = {
    'top-stories': 'linear-gradient(135deg, #1e293b, #334155)',
    'sports': 'linear-gradient(135deg, #0f172a, #1e1b4b)',
    'politics': 'linear-gradient(135deg, #1e1b4b, #3b0764)',
    'entertainment': 'linear-gradient(135deg, #020617, #0f172a)',
    'business': 'linear-gradient(135deg, #1e293b, #475569)',
    'international': 'linear-gradient(135deg, #090d16, #1e293b)'
  };
  
  const textSymbols = {
    'top-stories': '🔥 Breaking News',
    'sports': '⚽ Sports News',
    'politics': '🏛️ Politics',
    'entertainment': '🎬 Showbiz',
    'business': '💼 Finance',
    'international': '🌍 World News'
  };

  const bg = gradients[category] || 'linear-gradient(135deg, #2c3e50, #3498db)';
  const label = textSymbols[category] || '📰 News';

  return (
    <div className="card-image-placeholder" style={{ background: bg }}>
      <div className="placeholder-text">{label}</div>
    </div>
  );
};

// API base path - defaults to empty string or dev server URL
const API_BASE = window.location.port === '5173' ? 'http://localhost:5000' : '';

function App() {
  // Navigation & View State: 'home', 'login', 'register', 'bookmarks'
  const [currentView, setCurrentView] = useState(() => {
    const savedToken = localStorage.getItem('news_app_token');
    return savedToken ? 'home' : 'login';
  });

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('news_app_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('news_app_user');
    return saved ? JSON.parse(saved) : null;
  });

  // News State
  const [articles, setArticles] = useState([]);
  const [sourcesList, setSourcesList] = useState([]);
  const [category, setCategory] = useState('top-stories');
  const [region, setRegion] = useState('india');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [importantOnly, setImportantOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState(new Set());
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  // Sync State
  const [loading, setLoading] = useState(true);
  const [syncingInProgress, setSyncingInProgress] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    nextSync: null,
    status: 'idle',
    error: null,
    syncCount: 0
  });

  // Form States
  const [authFormError, setAuthFormError] = useState('');
  const [authFormLoading, setAuthFormLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch current user details on load if token exists
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Token expired or invalid');
        })
        .then(data => {
          setUser(data.user);
          localStorage.setItem('news_app_user', JSON.stringify(data.user));
        })
        .catch(() => {
          // Clear invalid auth state
          handleLogout();
        });
    }
  }, [token]);

  // Fetch user bookmarks when logged in
  const fetchBookmarks = useCallback(async () => {
    if (!token) {
      setBookmarks([]);
      setBookmarkIds(new Set());
      return;
    }
    setBookmarksLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
        const ids = new Set(data.map(b => b.articleId));
        setBookmarkIds(ids);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setBookmarksLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
      setBookmarkIds(new Set());
    }
  }, [token, fetchBookmarks]);

  // Fetch sync status
  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/status`);
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
        setSyncingInProgress(!!data.isSyncing);
      }
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  }, []);

  // Fetch available sources
  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sources`);
      if (res.ok) {
        const data = await res.json();
        let filtered = data;
        if (region !== 'all') {
          filtered = data.filter(s => s.region.toLowerCase() === region.toLowerCase());
        }
        setSourcesList(filtered);
      }
    } catch (err) {
      console.error('Error fetching sources list:', err);
    }
  }, [region]);

  // Fetch news articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        category,
        region,
        source,
        search: debouncedSearch,
        importantOnly: importantOnly.toString(),
        page: page.toString(),
        limit: '12'
      });

      const res = await fetch(`${API_BASE}/api/news?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  }, [category, region, source, debouncedSearch, importantOnly, page]);

  // Trigger manual sync
  const triggerSync = async () => {
    if (syncingInProgress) return;
    setSyncingInProgress(true);
    try {
      const res = await fetch(`${API_BASE}/api/trigger-sync`, { method: 'POST' });
      if (res.ok) {
        await fetchSyncStatus();
        setPage(1);
        await fetchArticles();
      }
    } catch (err) {
      console.error('Error triggering sync:', err);
    } finally {
      setSyncingInProgress(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchSyncStatus]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Auth Functions
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthFormError('');
    if (!loginData.email || !loginData.password) {
      setAuthFormError('Please enter both email and password.');
      return;
    }
    setAuthFormLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('news_app_token', data.token);
      localStorage.setItem('news_app_user', JSON.stringify(data.user));
      setLoginData({ email: '', password: '' });
      setCurrentView('home');
    } catch (err) {
      setAuthFormError(err.message);
    } finally {
      setAuthFormLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthFormError('');
    const { name, email, password, confirmPassword } = registerData;

    if (!name || !email || !password || !confirmPassword) {
      setAuthFormError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setAuthFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthFormError('Password and Confirm Password do not match.');
      return;
    }

    setAuthFormLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('news_app_token', data.token);
      localStorage.setItem('news_app_user', JSON.stringify(data.user));
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
      setCurrentView('home');
    } catch (err) {
      setAuthFormError(err.message);
    } finally {
      setAuthFormLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('news_app_token');
    localStorage.removeItem('news_app_user');
    setBookmarks([]);
    setBookmarkIds(new Set());
    setCurrentView('login');
  };

  // Bookmark Toggle Function
  const toggleBookmark = async (article) => {
    if (!token) {
      setCurrentView('login');
      return;
    }

    const articleId = article.guid || article._id || article.link;
    const isBookmarked = bookmarkIds.has(articleId);

    if (isBookmarked) {
      // Remove Bookmark
      try {
        const res = await fetch(`${API_BASE}/api/bookmarks/${encodeURIComponent(articleId)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setBookmarkIds(prev => {
            const next = new Set(prev);
            next.delete(articleId);
            return next;
          });
          setBookmarks(prev => prev.filter(b => b.articleId !== articleId));
        }
      } catch (err) {
        console.error('Error deleting bookmark:', err);
      }
    } else {
      // Add Bookmark
      try {
        const res = await fetch(`${API_BASE}/api/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            articleId,
            title: article.title,
            description: article.description,
            url: article.link || article.url,
            image: article.image,
            source: article.source,
            category: article.category,
            publishedAt: article.pubDate || article.publishedAt
          })
        });
        if (res.ok) {
          const newB = await res.json();
          setBookmarkIds(prev => new Set(prev).add(articleId));
          setBookmarks(prev => [newB, ...prev]);
        }
      } catch (err) {
        console.error('Error adding bookmark:', err);
      }
    }
  };

  // Date Format Helpers
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = diffMs / (1000 * 60 * 60);

    if (diffHrs < 1) {
      const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
      return `${mins}m ago`;
    } else if (diffHrs < 24) {
      return `${Math.round(diffHrs)}h ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatLastSync = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const categories = [
    { id: 'top-stories', label: 'Top News', icon: '🔥' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'international', label: 'International', icon: '🌍' }
  ];

  return (
    <div className="app-container">
      {/* Background Ambient Glows */}
      <div className="bg-gradient-accent accent-1"></div>
      <div className="bg-gradient-accent accent-2"></div>

      {/* Main Header */}
      <header className="app-header">
        <div className="header-brand" onClick={() => setCurrentView(token ? 'home' : 'login')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon">📰</span>
          <div className="logo-text">
            <h1>Todays News</h1>
            <span className="logo-subtext">Real-time Smart Aggregator</span>
          </div>
        </div>

        {/* Global Header Navigation Bar */}
        <nav className="header-nav">
          {token ? (
            <>
              <button 
                className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentView('home')}
              >
                Home
              </button>
              <button 
                className={`nav-link ${currentView === 'bookmarks' ? 'active' : ''}`}
                onClick={() => setCurrentView('bookmarks')}
              >
                <IconBookmark filled={currentView === 'bookmarks'} /> Bookmarks
              </button>
              <div className="user-badge" title={`Logged in as ${user?.email || ''}`}>
                <IconUser /> {user?.name || 'User'}
              </div>
              <button className="nav-link logout-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                className={`nav-link ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthFormError(''); setCurrentView('login'); }}
              >
                Login
              </button>
              <button 
                className={`nav-link register-nav-btn ${currentView === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthFormError(''); setCurrentView('register'); }}
              >
                Register
              </button>
            </>
          )}
        </nav>

        <div className="header-sync-panel">
          <div className="sync-status-details">
            <span className="sync-badge" data-status={syncStatus.status}>
              ● {syncStatus.isSyncing ? 'Syncing...' : 'Updates Active'}
            </span>
            <span className="sync-timestamp">
              <IconClock /> Last Refreshed: {formatLastSync(syncStatus.lastSync)}
            </span>
          </div>
          <button 
            className={`sync-btn ${syncingInProgress || syncStatus.isSyncing ? 'syncing' : ''}`}
            onClick={triggerSync}
            disabled={syncingInProgress || syncStatus.isSyncing}
            title="Fetch latest updates from news feeds"
          >
            <IconRefresh className={syncingInProgress || syncStatus.isSyncing ? 'spin' : ''} />
            <span>Sync Now</span>
          </button>
        </div>
      </header>

      {/* Main Content Router View */}
      <main className="app-content">

        {/* VIEW 1: LOGIN PAGE */}
        {currentView === 'login' && (
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-card-header">
                <h2>Welcome Back</h2>
                <p>Log in to access your saved news bookmarks</p>
              </div>

              {authFormError && (
                <div className="auth-error-alert">
                  ⚠️ {authFormError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={authFormLoading}>
                  {authFormLoading ? 'Authenticating...' : 'Login'}
                </button>
              </form>

              <div className="auth-card-footer">
                <p>Don't have an account?{' '}
                  <button className="auth-switch-link" onClick={() => { setAuthFormError(''); setCurrentView('register'); }}>
                    Register here
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: REGISTER PAGE */}
        {currentView === 'register' && (
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-card-header">
                <h2>Create Account</h2>
                <p>Join Today's News to personalize and bookmark articles</p>
              </div>

              {authFormError && (
                <div className="auth-error-alert">
                  ⚠️ {authFormError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reg-confirm">Confirm Password</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="auth-input"
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={authFormLoading}>
                  {authFormLoading ? 'Creating Account...' : 'Register'}
                </button>
              </form>

              <div className="auth-card-footer">
                <p>Already have an account?{' '}
                  <button className="auth-switch-link" onClick={() => { setAuthFormError(''); setCurrentView('login'); }}>
                    Login here
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: BOOKMARKS PAGE */}
        {currentView === 'bookmarks' && (
          <section className="bookmarks-page">
            <div className="bookmarks-header">
              <div>
                <h2>My Saved Bookmarks</h2>
                <p>Your saved articles collection</p>
              </div>
              <button className="reset-btn" onClick={() => setCurrentView('home')}>
                ← Back to News Feed
              </button>
            </div>

            {!token ? (
              <div className="empty-state">
                <div className="empty-icon">🔒</div>
                <h3>Please log in to view your bookmarks.</h3>
                <p>Sign in with your account to access your saved reading list anytime.</p>
                <button className="reset-btn" onClick={() => setCurrentView('login')}>
                  Login
                </button>
              </div>
            ) : bookmarksLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your bookmarks...</p>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔖</div>
                <h3>You haven't saved any articles yet.</h3>
                <p>Click the "Save" button on any news article card to keep it here for later reading.</p>
                <button className="reset-btn" onClick={() => setCurrentView('home')}>
                  Browse News Feed
                </button>
              </div>
            ) : (
              <div className="news-grid">
                {bookmarks.map((bm) => (
                  <article key={bm._id || bm.articleId} className="news-card">
                    <div className="card-image-container">
                      {bm.image ? (
                        <img src={bm.image} alt={bm.title} className="card-image" />
                      ) : (
                        <CategoryPlaceholder category={bm.category} />
                      )}
                      <span className="region-badge global">
                        Saved
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="card-meta">
                        <span className="card-source">{bm.source || 'News Source'}</span>
                        <span className="card-time">
                          <IconClock /> {formatDate(bm.publishedAt)}
                        </span>
                      </div>

                      <h3 className="card-title" title={bm.title}>
                        <a href={bm.url} target="_blank" rel="noopener noreferrer">
                          {bm.title}
                        </a>
                      </h3>

                      <p className="card-description">
                        {bm.description}
                      </p>

                      <div className="card-footer bookmark-card-footer">
                        <a 
                          href={bm.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="read-more-link"
                        >
                          Read Article <IconExternalLink />
                        </a>
                        
                        <button 
                          className="bookmark-btn saved"
                          onClick={() => toggleBookmark({ guid: bm.articleId, link: bm.url })}
                        >
                          <IconBookmark filled={true} /> Remove Bookmark
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW 4: HOME NEWS FEED */}
        {currentView === 'home' && (
          <>
            {/* Navigation & Regions Toolbar */}
            <section className="toolbar-section">
              <div className="region-selector">
                <button 
                  className={`region-pill ${region === 'india' ? 'active' : ''}`}
                  onClick={() => { setRegion('india'); setSource('all'); setPage(1); }}
                >
                  🇮🇳 India
                </button>
                <button 
                  className={`region-pill ${region === 'global' ? 'active' : ''}`}
                  onClick={() => { setRegion('global'); setSource('all'); setPage(1); }}
                >
                  🌎 Global
                </button>
              </div>

              <nav className="category-navigation">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-tab ${category === cat.id ? 'active' : ''}`}
                    onClick={() => { setCategory(cat.id); setPage(1); }}
                  >
                    <span className="tab-icon">{cat.icon}</span>
                    <span className="tab-label">{cat.label}</span>
                  </button>
                ))}
              </nav>
            </section>

            {/* Search, Filter and Refinements Dashboard */}
            <section className="filters-section">
              <div className="filters-container">
                <div className="search-wrapper">
                  <IconSearch />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="search-input"
                  />
                  {search && (
                    <button className="search-clear" onClick={() => { setSearch(''); setPage(1); }}>×</button>
                  )}
                </div>

                <div className="filter-select-wrapper">
                  <label htmlFor="source-select">Source:</label>
                  <select
                    id="source-select"
                    value={source}
                    onChange={(e) => { setSource(e.target.value); setPage(1); }}
                    className="filter-select"
                  >
                    <option value="all">All Publications</option>
                    {sourcesList.map(src => (
                      <option key={src.id} value={src.id}>
                        {src.name} {src.region === 'India' ? '(IN)' : '(GL)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="important-toggle-wrapper">
                  <label className="checkbox-switch">
                    <input
                      type="checkbox"
                      checked={importantOnly}
                      onChange={(e) => { setImportantOnly(e.target.checked); setPage(1); }}
                    />
                    <span className="switch-slider"></span>
                  </label>
                  <span className="switch-label">Highlight Breaking Only</span>
                </div>
              </div>
              
              <div className="results-meta">
                {loading ? (
                  <span>Querying live database...</span>
                ) : (
                  <span>Found <strong>{totalCount}</strong> stories in this view</span>
                )}
              </div>
            </section>

            {/* News Cards Grid */}
            <section className="news-grid-section">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Fetching the latest updates...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Articles Found</h3>
                  <p>Try resetting your search query or selecting a different source or category.</p>
                  {(search || source !== 'all' || importantOnly) && (
                    <button 
                      className="reset-btn"
                      onClick={() => {
                        setSearch('');
                        setSource('all');
                        setImportantOnly(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="news-grid">
                  {articles.map((article) => {
                    const articleId = article.guid || article._id || article.link;
                    const isSaved = bookmarkIds.has(articleId);

                    return (
                      <article key={articleId} className="news-card">
                        <div className="card-image-container">
                          {article.image ? (
                            <img 
                              src={article.image} 
                              alt={article.title} 
                              className="card-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentNode;
                                const placeholderDiv = document.createElement('div');
                                placeholderDiv.className = 'card-image-placeholder-fallback';
                                placeholderDiv.style.background = 'linear-gradient(135deg, #1e293b, #334155)';
                                placeholderDiv.innerHTML = '<span style="font-size:1.5rem">📰</span>';
                                parent.appendChild(placeholderDiv);
                              }}
                            />
                          ) : (
                            <CategoryPlaceholder category={article.category} />
                          )}
                          <span className={`region-badge ${article.region ? article.region.toLowerCase() : 'global'}`}>
                            {article.region === 'India' ? '🇮🇳 India' : '🌎 Global'}
                          </span>
                        </div>

                        <div className="card-body">
                          <div className="card-meta">
                            <span className="card-source" title={`Feed: ${article.source}`}>
                              {article.source}
                            </span>
                            <span className="card-time">
                              <IconClock /> {formatDate(article.pubDate)}
                            </span>
                          </div>

                          <h3 className="card-title" title={article.title}>
                            <a href={article.link} target="_blank" rel="noopener noreferrer">
                              {article.title}
                            </a>
                          </h3>

                          <p className="card-description">
                            {article.description}
                          </p>

                          <div className="card-footer home-card-footer">
                            <a 
                              href={article.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="read-more-link"
                            >
                              Read Full Story <IconExternalLink />
                            </a>

                            <button
                              className={`bookmark-btn ${isSaved ? 'saved' : ''}`}
                              onClick={() => toggleBookmark(article)}
                              title={isSaved ? 'Remove from Bookmarks' : 'Save to Bookmarks'}
                            >
                              <IconBookmark filled={isSaved} />
                              {isSaved ? 'Saved' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Pagination Section */}
            {!loading && totalPages > 1 && (
              <section className="pagination-section">
                <button
                  className="pagination-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page <strong>{page}</strong> of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </section>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 Todays News. All rights reserved. Automatically updates every 3 hours.</p>
        <div className="footer-links">
          <span>Sources parsed: 30+ Reliable Feeds</span>
          <span className="divider">|</span>
          <span>Deduplication & Local Cache Enabled</span>
          <span className="divider">|</span>
          <span>User Authentication & Bookmark Enabled</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
