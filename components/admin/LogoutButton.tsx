'use client';

export default function LogoutButton() {
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-soft"
    >
      Déconnexion
    </button>
  );
}