// Единый стиль звездного фона для всех компонентов
export const starryBackgroundStyle = {
  background: `
    radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%),
    radial-gradient(ellipse at center, rgba(25,25,112,0.3) 0%, rgba(0,0,0,0.9) 100%),
    linear-gradient(45deg, #000428 0%, #004e92 25%, #000428 50%, #004e92 75%, #000428 100%)
  `,
  backgroundSize: '100% 100%, 100% 100%, 200% 200%',
  animation: 'starryNight 20s ease-in-out infinite',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(2px 2px at 20px 30px, #eee, transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 90px 40px, #fff, transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 160px 30px, #ddd, transparent),
      radial-gradient(2px 2px at 200px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 250px 40px, #fff, transparent),
      radial-gradient(1px 1px at 290px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 320px 30px, #ddd, transparent),
      radial-gradient(2px 2px at 360px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 410px 40px, #fff, transparent),
      radial-gradient(1px 1px at 450px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 480px 30px, #ddd, transparent),
      radial-gradient(2px 2px at 520px 70px, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 570px 40px, #fff, transparent),
      radial-gradient(1px 1px at 610px 80px, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 640px 30px, #ddd, transparent),
      radial-gradient(2px 2px at 680px 70px, rgba(255,255,255,0.8), transparent)
    `,
    backgroundRepeat: 'repeat',
    backgroundSize: '700px 700px',
    animation: 'twinkle 4s ease-in-out infinite alternate',
    zIndex: 0
  }
};

// CSS анимации для звездного неба
export const starryBackgroundCSS = `
  @keyframes starryNight {
    0%, 100% { background-position: 0% 0%, 0% 0%, 0% 0%; }
    25% { background-position: 0% 0%, 0% 0%, 50% 50%; }
    50% { background-position: 0% 0%, 0% 0%, 100% 100%; }
    75% { background-position: 0% 0%, 0% 0%, 50% 50%; }
  }
  
  @keyframes twinkle {
    0% { opacity: 0.3; }
    100% { opacity: 1; }
  }
`;

// Простой звездный фон без анимации (для компонентов, где анимация может мешать)
export const simpleStarryBackground = {
  background: `
    radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%),
    radial-gradient(ellipse at center, rgba(25,25,112,0.3) 0%, rgba(0,0,0,0.9) 100%),
    linear-gradient(45deg, #000428 0%, #004e92 25%, #000428 50%, #004e92 75%, #000428 100%)
  `,
  backgroundSize: '100% 100%, 100% 100%, 200% 200%'
};

