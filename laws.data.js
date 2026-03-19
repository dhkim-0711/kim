/* eslint-disable no-var */
// 데이터는 예시이며, 사용 목적에 맞게 수정하세요.
// - id: 고유키(문자열). 즐겨찾기 저장에 사용됩니다.
// - title: 법/정책명
// - industry: 산업 분류(예: AI반도체, 반도체, SW, 소재부품장비, 바이오 등)
// - ministry: 소관부처/기관
// - instruments: 지원수단 태그(예: R&D, 인력, 세제, 규제특례, 펀드, 인프라, 표준/인증, 실증)
// - support: 한 줄 요약(핵심 지원)
// - scope: 적용/대상(선택)
// - linkTitle/linkUrl: 참고 링크(선택, 다수 가능)
//
// 실제 법령 링크는 조직 정책/저작권/정확성 기준에 맞게 확인 후 입력하세요.
//
// (가칭)AI반도체 산업육성법 추진방안(2p) "기초조항 구성"을 클릭-비교하기 위한 카탈로그
var PROVISIONS = [
  {
    id: "purpose",
    group: "기본 조항",
    label: "목적",
    hint: "법의 제정 목적(산업 진흥/지원/규제개선 등)",
  },
  { id: "definitions", group: "기본 조항", label: "정의", hint: "핵심 용어(산업/기술/사업자 등) 정의" },
  { id: "duties", group: "기본 조항", label: "국가·지자체 책무", hint: "국가/지자체의 시책 수립·시행 책무" },
  { id: "relation", group: "기본 조항", label: "다른 법률과의 관계", hint: "특별규정 우선/준용 등" },
  { id: "basic-plan", group: "기본 조항", label: "기본계획(수립·시행)", hint: "중장기 기본계획/시행계획" },

  { id: "committee", group: "거버넌스/전담기관", label: "특별위원회(거버넌스)", hint: "위원회/협의체 설치" },
  { id: "dedicated-agency", group: "거버넌스/전담기관", label: "전담기관 지정(지원센터 포함)", hint: "전담기관/지원센터 지정·운영" },
  { id: "delegation", group: "거버넌스/전담기관", label: "권한·업무 위임/위탁", hint: "업무 대행/위탁 근거" },

  { id: "workforce", group: "인력양성", label: "전문인력 양성", hint: "전문인력 양성체계·교육훈련" },
  { id: "specialized-univ", group: "인력양성", label: "특성화대학(등) 지정", hint: "특성화 대학/대학원/기관 지정" },
  { id: "employment-subsidy", group: "인력양성", label: "고용 재정지원", hint: "채용/고용 관련 재정지원" },
  { id: "military", group: "인력양성", label: "병역지정업체", hint: "병역특례/지정업체 관련" },

  { id: "certified-firm", group: "기업 특례", label: "전문기업 지정·지원", hint: "전문기업/전문사업자 지정 및 지원" },
  { id: "rnd-special", group: "기업 특례", label: "국가R&D 지원 특례", hint: "국가연구개발 참여·평가·정산 등 특례" },
  { id: "finance", group: "기업 특례", label: "금융 지원", hint: "자금/금융/보증/융자 등" },
  { id: "tax", group: "기업 특례", label: "세제 지원", hint: "세액공제/감면 등" },
  { id: "priority-purchase", group: "기업 특례", label: "우선 구매", hint: "공공 우선구매/조달 연계" },
  { id: "infrastructure", group: "기업 특례", label: "인프라 구축·공동활용", hint: "시설/장비/클러스터/공동활용" },
  { id: "utilization", group: "기업 특례", label: "활용 촉진(공공/산업)", hint: "공공 활용 촉진/산업 활용 지원" },

  { id: "tech-dev", group: "기술개발·실증·해외진출", label: "기술개발 촉진", hint: "기술개발/연구/평가/이전 등" },
  { id: "demo-open", group: "기술개발·실증·해외진출", label: "실증기반 개방·활용", hint: "테스트베드/실증 인프라 활용" },
  { id: "test-support", group: "기술개발·실증·해외진출", label: "테스트 지원", hint: "시험·검증·평가 지원" },
  { id: "pilot", group: "기술개발·실증·해외진출", label: "시범사업", hint: "시범/실증 사업 근거" },
  { id: "overseas", group: "기술개발·실증·해외진출", label: "국제협력·해외진출", hint: "국제협력/해외시장 지원" },

  { id: "funding", group: "기타 조항", label: "재원의 확보", hint: "예산/기금 등 재원 근거" },
  { id: "standards", group: "기타 조항", label: "표준화 등", hint: "표준화/인증/품질" },
  { id: "demand-forecast", group: "기타 조항", label: "수요 예보", hint: "수요 예측/예보" },
  { id: "demand-survey", group: "기타 조항", label: "수요 조사·공개", hint: "수요조사, 공개" },
  { id: "fact-finding", group: "기타 조항", label: "실태 조사", hint: "실태조사/현황조사" },
  { id: "stats", group: "기타 조항", label: "산업 통계", hint: "산업 통계 작성·관리" },
];

var LAWS = [
  {
    id: "ai-semicon-act-draft",
    title: "AI반도체 산업진흥법(가칭)",
    industry: "AI반도체",
    ministry: "관계부처(가칭)",
    instruments: ["R&D", "인력", "실증", "인프라", "표준/인증", "전담기관", "재원/기금"],
    support:
      "AI반도체 연구개발·인력양성·실증/테스트베드·설계생태계 지원을 포괄하는 산업진흥 프레임(초안).",
    scope: "AI반도체(설계·SW·IP·검증·패키징/시스템 포함)",
    provisionRefs: {
      purpose: { article: "제n조", title: "목적" },
      definitions: { article: "제n조", title: "정의" },
      duties: { article: "제n조", title: "국가와 지방자치단체의 책무" },
      relation: { article: "제n조", title: "다른 법률과의 관계" },
      "basic-plan": { article: "제n조", title: "기본계획의 수립 및 시행" },
      committee: { article: "제n조", title: "인공지능반도체산업 특별위원회" },
      "dedicated-agency": { article: "제n조", title: "전담기관의 지정 등(지원센터 포함)" },
      delegation: { article: "제n조", title: "권한·업무의 위임·위탁" },
      workforce: { article: "제n조", title: "전문인력의 양성 등" },
      "specialized-univ": { article: "제n조", title: "특성화대학 등의 지정" },
      "employment-subsidy": { article: "제n조", title: "고용에 대한 재정지원 등" },
      military: { article: "제n조", title: "병역지정업체 선정 등" },
      "certified-firm": { article: "제n조", title: "인공지능반도체 전문기업의 지정 및 지원" },
      "rnd-special": { article: "제n조", title: "국가연구개발 지원에 대한 특례" },
      finance: { article: "제n조", title: "금융 지원" },
      tax: { article: "제n조", title: "세제 지원 등" },
      "priority-purchase": { article: "제n조", title: "우선 구매" },
      infrastructure: { article: "제n조", title: "인프라 구축 및 공동활용" },
      utilization: { article: "제n조", title: "활용 촉진(공공/산업)" },
      "tech-dev": { article: "제n조", title: "기술개발의 촉진" },
      "demo-open": { article: "제n조", title: "실증기반의 개방 및 활용" },
      "test-support": { article: "제n조", title: "테스트 지원 등" },
      pilot: { article: "제n조", title: "시범사업" },
      overseas: { article: "제n조", title: "국제협력 및 해외진출" },
      funding: { article: "제n조", title: "재원의 확보" },
      standards: { article: "제n조", title: "표준화 등" },
      "demand-forecast": { article: "제n조", title: "수요 예보" },
      "demand-survey": { article: "제n조", title: "수요 조사 및 공개" },
      "fact-finding": { article: "제n조", title: "실태 조사 등" },
      stats: { article: "제n조", title: "산업통계" },
    },
    provisions: [
      "purpose",
      "definitions",
      "duties",
      "relation",
      "basic-plan",
      "committee",
      "dedicated-agency",
      "delegation",
      "workforce",
      "specialized-univ",
      "employment-subsidy",
      "military",
      "certified-firm",
      "rnd-special",
      "finance",
      "tax",
      "priority-purchase",
      "infrastructure",
      "utilization",
      "tech-dev",
      "demo-open",
      "test-support",
      "pilot",
      "overseas",
      "funding",
      "standards",
      "demand-forecast",
      "demand-survey",
      "fact-finding",
      "stats",
    ],
    links: [
      { title: "자료 링크(추가)", url: "" }
    ]
  },
  {
    id: "metaverse-promotion-act",
    title: "가상융합산업 진흥법",
    industry: "가상융합/메타버스",
    ministry: "과학기술정보통신부",
    instruments: ["기본계획", "규제개선", "R&D", "인력", "표준/인증", "재원/기금", "전담기관"],
    support:
      "가상융합산업 진흥·지원 및 규제개선, 기본계획(3년), 인력양성·R&D·표준화·실태조사·재원(기금 포함) 등을 규정.",
    scope: "가상융합기술/서비스·기기·상품 등",
    provisionRefs: {
      purpose: { article: "제1조", title: "목적" },
      definitions: { article: "제2조", title: "정의" },
      duties: { article: "제3조", title: "국가의 책무" },
      relation: { article: "제5조", title: "다른 법률과의 관계" },
      "basic-plan": { article: "제6조", title: "기본계획의 수립 등" },
      funding: { article: "제7조", title: "재원의 확보" },
      "fact-finding": { article: "제8조", title: "실태조사 등" },
      workforce: { article: "제10조", title: "전문인력의 양성 등" },
      "tech-dev": { article: "제11조", title: "기술개발의 촉진" },
      standards: { article: "제13조", title: "표준화" },
      "dedicated-agency": { article: "제17조", title: "전담기관의 지정 등(추정)" },
    },
    provisions: [
      "purpose",
      "definitions",
      "duties",
      "relation",
      "basic-plan",
      "workforce",
      "tech-dev",
      "standards",
      "funding",
      "fact-finding",
      "dedicated-agency",
    ],
    links: [
      { title: "PDF", url: "./가상융합산업%20진흥법(법률)(제20352호)(20240828).pdf" }
    ]
  },
  {
    id: "industrial-technology-innovation-act",
    title: "산업기술혁신 촉진법",
    industry: "산업기술",
    ministry: "산업통상자원부",
    instruments: ["기본계획", "R&D", "사업화", "인력", "인프라", "전담기관", "국제협력"],
    support:
      "산업기술혁신 촉진 및 기반조성을 위한 혁신계획(5년)·시행계획, 산업기술개발/사업화/기반조성/국제협력 체계를 규정.",
    scope: "산업기술 전반(제품·서비스혁신/공정혁신 포함)",
    provisionRefs: {
      purpose: { article: "제1조", title: "목적" },
      definitions: { article: "제2조", title: "정의" },
      duties: { article: "제3조", title: "정부 및 기술혁신주체의 책무" },
      relation: { article: "제4조", title: "다른 법률과의 관계" },
      "basic-plan": { article: "제5조", title: "산업기술혁신계획" },
      committee: { article: "제6조", title: "혁신계획 등의 추진체계(전략기획단 포함)" },
      "dedicated-agency": { article: "제38조", title: "한국산업기술진흥원(전담/지원 조직 근거)" },
      "tech-dev": { article: "제11조", title: "산업기술개발사업(추정)" },
      infrastructure: { article: "제19조", title: "산업기술기반조성사업(추정)" },
      overseas: { article: "제27조", title: "국제산업기술협력사업(추정)" },
    },
    provisions: [
      "purpose",
      "definitions",
      "duties",
      "relation",
      "basic-plan",
      "committee",
      "dedicated-agency",
      "workforce",
      "tech-dev",
      "overseas",
      "infrastructure",
      "funding",
      "fact-finding",
      "stats",
    ],
    links: [
      { title: "PDF", url: "./산업기술혁신%20촉진법(법률)(제21065호)(20260102).pdf" }
    ]
  },
  {
    id: "3d-printing-industry-promotion-act",
    title: "삼차원프린팅산업 진흥법",
    industry: "제조/3D프린팅",
    ministry: "과학기술정보통신부",
    instruments: ["기본계획", "전담기관", "인력", "R&D", "표준/인증", "시범/실증", "해외진출", "재원/기금"],
    support:
      "삼차원프린팅 산업진흥 기본계획(3년), 전담기관 지정, 인력양성·기술개발·표준화·품질인증·시범사업·해외진출 등을 규정.",
    scope: "장비·소재·SW·콘텐츠 및 관련 서비스",
    provisionRefs: {
      purpose: { article: "제1조", title: "목적" },
      definitions: { article: "제2조", title: "정의" },
      duties: { article: "제3조", title: "정부의 책무" },
      relation: { article: "제4조", title: "다른 법률과의 관계" },
      "basic-plan": { article: "제5조", title: "기본계획의 수립 및 시행" },
      "dedicated-agency": { article: "제6조", title: "산업진흥 전담기관" },
      workforce: { article: "제7조", title: "전문인력의 양성 등" },
      "tech-dev": { article: "제8조", title: "기술개발의 촉진" },
      standards: { article: "제9조", title: "표준화의 추진" },
      pilot: { article: "제11조", title: "시범사업의 실시" },
      overseas: { article: "제12조", title: "국제협력 및 해외진출 촉진" },
    },
    provisions: [
      "purpose",
      "definitions",
      "duties",
      "relation",
      "basic-plan",
      "dedicated-agency",
      "workforce",
      "tech-dev",
      "standards",
      "pilot",
      "overseas",
      "funding",
    ],
    links: [
      { title: "PDF", url: "./삼차원프린팅산업%20진흥법(법률)(제19348호)(20230418).pdf" }
    ]
  },
  {
    id: "software-promotion-act",
    title: "소프트웨어 진흥법",
    industry: "ICT/SW",
    ministry: "과학기술정보통신부",
    instruments: ["기본계획", "전담기관", "R&D", "인력/교육", "창업", "지역진흥", "실태/통계"],
    support:
      "소프트웨어 진흥 기본계획·시행계획, 산업 지원(전담기관 지정), 인력·교육, R&D·보급, 창업/해외진출, 지역진흥 등을 규정.",
    scope: "SW 전반(융합 포함)",
    provisionRefs: {
      purpose: { article: "제1조", title: "목적" },
      definitions: { article: "제2조", title: "정의" },
      duties: { article: "제3조", title: "국가와 지방자치단체의 책무" },
      relation: { article: "제4조", title: "다른 법률과의 관계" },
      "basic-plan": { article: "제5조", title: "기본계획의 수립 등" },
      "fact-finding": { article: "제6조", title: "실태조사" },
      "dedicated-agency": { article: "제8조", title: "소프트웨어산업 진흥 전담기관 등" },
      workforce: { article: "제5조(기본계획)", title: "인력양성(기본계획 포함 항목)" },
      stats: { article: "제7조", title: "소프트웨어산업정보 관리 등" },
    },
    provisions: [
      "purpose",
      "definitions",
      "duties",
      "relation",
      "basic-plan",
      "dedicated-agency",
      "workforce",
      "tech-dev",
      "overseas",
      "fact-finding",
      "stats",
      "funding",
    ],
    links: [
      { title: "PDF", url: "./소프트웨어%20진흥법(법률)(제20476호)(20250423).pdf" }
    ]
  },
  {
    id: "ict-industry-promotion-act",
    title: "정보통신산업 진흥법",
    industry: "ICT",
    ministry: "과학기술정보통신부",
    instruments: ["진흥계획", "R&D", "표준/인증", "인력", "창업/성장", "자금공급", "국제협력", "재원/기금"],
    support:
      "정보통신산업 진흥 기반 조성: 진흥계획, 기술 R&D·사업화, 표준화/인증, 전문인력, 창업/성장 및 자금공급 활성화, 기금 등을 규정.",
    scope: "정보통신제품/서비스 및 관련 산업",
    provisionRefs: {
      purpose: { article: "제1조", title: "목적" },
      definitions: { article: "제2조", title: "정의" },
      duties: { article: "제3조", title: "국가 및 지방자치단체의 책무" },
      relation: { article: "제4조", title: "다른 법률과의 관계" },
      "basic-plan": { article: "제5조", title: "정보통신산업 진흥계획" },
      stats: { article: "제6조", title: "통계의 작성" },
      "demand-forecast": { article: "—", title: "수요 예보(별도 조항은 데이터에 미기재)" },
      "demand-survey": { article: "—", title: "수요 조사·공개(별도 조항은 데이터에 미기재)" },
      "tech-dev": { article: "제7조~", title: "정보통신기술의 진흥(시행계획 등)" },
      standards: { article: "제12조", title: "정보통신표준화의 촉진(추정)" },
    },
    provisions: [
      "purpose",
      "definitions",
      "duties",
      "relation",
      "basic-plan",
      "tech-dev",
      "standards",
      "workforce",
      "funding",
      "stats",
      "demand-forecast",
      "demand-survey",
    ],
    links: [
      { title: "PDF", url: "./정보통신산업%20진흥법(법률)(제21065호)(20251001).pdf" }
    ]
  },
  {
    id: "sme-technology-innovation-promotion-act",
    title: "중소기업 기술혁신 촉진법",
    industry: "중소기업/혁신",
    ministry: "중소벤처기업부",
    instruments: ["촉진계획", "기술금융", "R&D", "사업화", "인력", "산학연", "전문기관", "실태/통계"],
    support:
      "중소기업 기술혁신 기반 확충: 촉진계획(5년), 전문기관 지정, 기술금융·자금지원, 수요연계·사업화, 인력·산학연 협력 등을 규정.",
    scope: "중소기업 기술혁신 전반",
    provisionRefs: {
      purpose: { article: "제1조", title: "목적" },
      definitions: { article: "제2조", title: "정의" },
      duties: { article: "제3조", title: "정부 등의 책무" },
      relation: { article: "제4조", title: "다른 법률과의 관계" },
      "basic-plan": { article: "제5조", title: "중소기업 기술혁신 촉진계획의 수립" },
      "dedicated-agency": { article: "제7조", title: "중소기업 기술진흥 전문기관의 지정 등" },
      stats: { article: "제8조", title: "중소기업 기술통계의 작성" },
      "fact-finding": { article: "제8조의2", title: "기술혁신형 중소기업 실태조사 및 통계조사" },
      finance: { article: "제9조", title: "기술혁신 촉진 지원사업(자금/금융 포함)" },
    },
    provisions: [
      "purpose",
      "definitions",
      "duties",
      "relation",
      "basic-plan",
      "dedicated-agency",
      "workforce",
      "finance",
      "tech-dev",
      "utilization",
      "fact-finding",
      "stats",
      "demand-survey",
    ],
    links: [
      { title: "PDF", url: "./중소기업%20기술혁신%20촉진법(법률)(제20727호)(20260201).pdf" }
    ]
  }
];
