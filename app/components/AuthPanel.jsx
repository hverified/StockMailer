export default function AuthPanel({ authMode, authForm, setAuthForm, setAuthMode, onAuthSubmit, error }) {
  return (
    <main className="app auth-only">
      <section className="auth-wrap">
        <div className="auth-visual">
          <div className="auth-visual-badge">Tradewise</div>
          <h2>{authMode === "signin" ? "Trade with clarity." : "Build your edge."}</h2>
          <p>
            {authMode === "forgot"
              ? "Reset your password and continue your market workflow."
              : "Access scan history, market signals and report insights in one place."}
          </p>
        </div>
        <div className="auth-card">
          <div className="auth-head">
            <div className="auth-kicker">{authMode === "forgot" ? "Recovery" : "Account"}</div>
            <h3>
              {authMode === "signin"
                ? "Welcome back"
                : authMode === "signup"
                ? "Create your account"
                : "Reset password"}
            </h3>
          </div>
          {authMode !== "forgot" && (
            <div className="auth-switch">
              <button type="button" className={authMode === "signin" ? "active" : ""} onClick={() => setAuthMode("signin")}>
                Sign in
              </button>
              <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")}>
                Sign up
              </button>
            </div>
          )}
          <form onSubmit={onAuthSubmit} className="auth-form">
            {authMode === "signup" && (
              <>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  placeholder="Enter your full name"
                  value={authForm.name}
                  onChange={(e) => setAuthForm((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </>
            )}
            <label htmlFor="username">Username</label>
            <input
              id="username"
              placeholder="Enter username"
              value={authForm.username}
              onChange={(e) => setAuthForm((s) => ({ ...s, username: e.target.value }))}
              required
            />
            {authMode !== "forgot" && (
              <>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  placeholder="Minimum 5 characters"
                  type="password"
                  minLength={5}
                  value={authForm.password}
                  onChange={(e) => setAuthForm((s) => ({ ...s, password: e.target.value }))}
                  required
                />
                <div className="auth-password-hint">Password must be at least 5 characters.</div>
              </>
            )}
            {authMode === "forgot" && (
              <>
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  placeholder="Minimum 5 characters"
                  type="password"
                  minLength={5}
                  value={authForm.newPassword}
                  onChange={(e) => setAuthForm((s) => ({ ...s, newPassword: e.target.value }))}
                  required
                />
                <div className="auth-password-hint">Password must be at least 5 characters.</div>
              </>
            )}
            {authMode !== "forgot" && (
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={authForm.rememberMe}
                  onChange={(e) => setAuthForm((s) => ({ ...s, rememberMe: e.target.checked }))}
                />
                <span>Keep me signed in</span>
              </label>
            )}
            <button type="submit" className="auth-submit-btn">
              {authMode === "signin" ? "Sign In" : authMode === "signup" ? "Create Account" : "Reset Password"}
            </button>
          </form>
          <div className="auth-links">
            {authMode === "forgot" ? (
              <button type="button" onClick={() => setAuthMode("signin")}>Back to sign in</button>
            ) : (
              <button type="button" onClick={() => setAuthMode("forgot")}>Forgot password?</button>
            )}
          </div>
          {error && <p className={error.startsWith("Password reset") ? "muted" : "danger"}>{error}</p>}
        </div>
      </section>
    </main>
  );
}
