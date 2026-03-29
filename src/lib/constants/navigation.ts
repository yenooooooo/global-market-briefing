/**
 * lib/constants/navigation.ts — 사이드바 네비게이션 메뉴 상수
 *
 * 대시보드 사이드바에 표시할 메뉴 항목을 정의합니다.
 * - label: 한국어 메뉴명 (타겟 유저가 한국인이므로 한글 필수)
 * - href: 이동할 경로
 * - icon: Lucide React 아이콘 이름
 *
 * 순서가 곧 사이드바에 표시되는 순서입니다.
 */
import type { NavItem } from '@/types'

/** 사이드바 메뉴 목록 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: '홈',              // 오늘의 요약 대시보드
    href: '/home',
    icon: 'Home',
  },
  {
    label: '매출 현황',        // 국가별 매출 차트 + 테이블
    href: '/sales',
    icon: 'BarChart3',
  },
  {
    label: '환율',             // 실시간 환율 현황 + 추이
    href: '/exchange',
    icon: 'ArrowLeftRight',
  },
  {
    label: 'AI 브리핑',        // AI 주간 경영 브리핑 생성
    href: '/briefing',
    icon: 'Bot',
  },
  {
    label: '경쟁사',           // 경쟁사 메모 입력/조회
    href: '/competitors',
    icon: 'Building2',
  },
  {
    label: '설정',             // 국가/법인 관리
    href: '/settings',
    icon: 'Settings',
  },
]
