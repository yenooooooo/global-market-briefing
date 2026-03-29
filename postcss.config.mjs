/**
 * postcss.config.mjs — PostCSS 설정 파일
 *
 * Tailwind CSS v4는 @tailwindcss/postcss 플러그인을 통해 PostCSS와 연동됩니다.
 * CSS 파일에서 @import "tailwindcss" 로 Tailwind를 로드합니다.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // Tailwind CSS v4 PostCSS 플러그인
  },
};

export default config;
