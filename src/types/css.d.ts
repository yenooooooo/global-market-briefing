/**
 * types/css.d.ts — CSS 모듈 타입 선언
 *
 * TypeScript가 .css 파일의 import를 인식할 수 있도록 하는 타입 선언 파일입니다.
 * Next.js에서 globals.css를 layout.tsx에 import할 때 타입 에러를 방지합니다.
 */

/** .css 파일을 모듈로 인식하도록 선언 */
declare module '*.css'
