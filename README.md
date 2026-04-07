# 오늘의집 AI 채팅 프로토타입

자연어 기반 AI 채팅 검색 + 사진 합성 + 3D 배치 인터랙티브 웹 프로토타입.

## 구성

- `index.html` — 단일 HTML (CSS/JS 인라인)
- `api/[...path].js` — 오늘의집 RP-Chat API 프록시 (Vercel Serverless Function)
- `vercel.json` — 캐시 비활성 헤더 설정

## 로컬 개발

```bash
npx vercel dev
```

또는 단순 정적 서버:

```bash
python3 -m http.server 3000
```

(API 프록시는 vercel dev에서만 동작)

## 배포

GitHub repo 연결 후 Vercel에서 자동 배포.
