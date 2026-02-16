import Image from "next/image";

export default function TopBar({ user, profileOpen, setProfileOpen, signOut }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Image src="/tradewise.svg" width={36} height={36} alt="Tradewise logo" />
        <div className="brand-text">
          <h1>Tradewise</h1>
          <p>Market Intelligence</p>
        </div>
      </div>
      <div className="profile">
        <button
          className="profile-btn"
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setProfileOpen((v) => !v);
          }}
        >
          <span className="profile-avatar">{(user.name || "U").charAt(0).toUpperCase()}</span>
          <span className="profile-name">{user.name || "User"}</span>
        </button>
        {profileOpen && (
          <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="profile-menu-head">
              <div className="profile-menu-name">{user.name || "User"}</div>
              <div className="profile-menu-username">@{user.username || "-"}</div>
            </div>
            <button type="button" onClick={() => setProfileOpen(false)}>Profile</button>
            <button type="button" className="danger-btn" onClick={signOut}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
