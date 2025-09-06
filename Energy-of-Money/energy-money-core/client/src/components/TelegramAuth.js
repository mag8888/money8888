import React, { useEffect, useRef } from 'react';

const TelegramAuth = ({ botUsername, onAuth }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!botUsername || !ref.current) return;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername.replace(/^@/, ''));
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramAuth');
    ref.current.innerHTML = '';
    ref.current.appendChild(script);

    window.onTelegramAuth = async (user) => {
      try {
        const resp = await fetch('/auth/telegram/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        const data = await resp.json();
        if (data.success && onAuth) onAuth(data.user);
      } catch (e) { console.error('TG login failed', e); }
    };
    return () => { delete window.onTelegramAuth; };
  }, [botUsername, onAuth]);

  return <div ref={ref} />;
};

export default TelegramAuth;

