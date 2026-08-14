/**
 * Product hotspots.
 *
 * Anchors are expressed in *cane space*: a normalised coordinate system where
 * the cane stands upright, its tip at y = -1, the top of the handle at y = +1
 * and the shaft on the y axis. `SmartCaneModel` normalises whatever geometry
 * it renders — procedural placeholder or a real GLB — into that space, so
 * these anchors keep working when the real model arrives.
 *
 * If a supplied GLB contains empties named after `nodeName`, those are used
 * instead of the fallback anchor, letting the 3D artist re-place hotspots
 * without touching code.
 */

export type Vec3 = [number, number, number];

export type ProductFeature = {
  id: string;
  /** Short label rendered on the hotspot marker and in the rail. */
  label: string;
  /** Headline of the information panel. */
  title: string;
  /** One or two calm sentences. No medical or safety claims. */
  body: string;
  /** Optional supporting spec line. */
  detail: string;
  /** Anchor in cane space. */
  anchor: Vec3;
  /** Optional empty/node name looked up in a supplied GLB. */
  nodeName: string;
  /** Camera placement when this feature is focused, in cane space. */
  focus: {
    camera: Vec3;
    /** Look-at point; defaults to the anchor when omitted. */
    target?: Vec3;
    /**
     * Cane rotation (radians, Y axis) that turns this feature toward the
     * camera during focus.
     */
    rotation: number;
  };
};

/*
 * Anchors and focus cameras are measured off the product reference. They run
 * top to bottom down the cane, which is also the order the markers are
 * numbered in: 01 at the grip, 06 at the port in the base.
 */
export const PRODUCT_FEATURES: readonly ProductFeature[] = [
  {
    id: "handle",
    label: "스마트 손잡이",
    title: "스마트 손잡이",
    body: "손이 자연스럽게 닿는 자리에 센서와 조작부를 담았습니다. 새로 익힐 것은 없습니다.",
    detail: "알루미늄 코어 · 소프트터치 그립",
    anchor: [0.0, 0.8, 0.036],
    nodeName: "hotspot_handle",
    focus: {
      camera: [0.27, 0.884, 0.528],
      rotation: 0.42,
      target: [0, 0.8, 0],
    },
  },
  {
    id: "haptics",
    label: "진동 피드백",
    title: "진동 피드백",
    body: "손잡이의 작은 진동으로 정보를 전합니다. 소리에만 기대지 않아도 되도록.",
    detail: "상단 칼라에 내장된 광대역 액추에이터",
    anchor: [0.0, 0.62, 0.036],
    nodeName: "hotspot_haptics",
    focus: {
      camera: [0.212, 0.686, 0.414],
      rotation: 0.5,
      target: [0, 0.62, 0],
    },
  },
  {
    id: "sensors",
    label: "센서",
    title: "센서",
    body: "앞을 향한 모듈이 걸어가는 길의 형태를 읽도록 설계했습니다.",
    detail: "ToF · 관성 센서",
    anchor: [0.0, 0.548, 0.041],
    nodeName: "hotspot_sensors",
    focus: {
      camera: [0.171, 0.601, 0.334],
      rotation: 0.44,
      target: [0, 0.548, 0],
    },
  },
  {
    id: "detection",
    label: "주변 감지",
    title: "주변 감지",
    body: "센서가 읽은 정보를 기기 안에서 처리해, 간결한 신호로 알맞은 때에 전달합니다.",
    detail: "조작 키 안쪽에서 기기가 직접 처리",
    anchor: [0.0, 0.444, 0.038],
    nodeName: "hotspot_detection",
    focus: {
      camera: [0.153, 0.492, 0.299],
      rotation: 0.47,
      target: [0, 0.444, 0],
    },
  },
  {
    id: "body",
    label: "가벼운 디자인",
    title: "가벼운 디자인",
    body: "가늘어지는 알루미늄 바디. 손이 예상하는 자리에 무게가 오도록 균형을 잡았습니다.",
    detail: "아노다이징 알루미늄",
    anchor: [0.0, -0.1, 0.034],
    nodeName: "hotspot_body",
    focus: {
      camera: [0.756, 0.005, 0.725],
      rotation: 0.8,
      target: [0, -0.1, 0],
    },
  },
  {
    id: "battery",
    label: "배터리",
    title: "배터리",
    body: "하루가 아니라 며칠간의 일상적인 사용을 기준으로 설계했습니다. 충전은 하단 포트로.",
    detail: "일체형 셀 · 하단 서비스 포트",
    anchor: [0.0, -0.895, 0.038],
    nodeName: "hotspot_battery",
    focus: {
      camera: [0.162, -0.845, 0.317],
      rotation: 0.4,
      target: [0, -0.895, 0],
    },
  },
] as const;

export const FEATURE_IDS = PRODUCT_FEATURES.map((feature) => feature.id);

export function getFeature(id: string | null): ProductFeature | null {
  if (!id) return null;
  return PRODUCT_FEATURES.find((feature) => feature.id === id) ?? null;
}

/** Technology section — concept-level claims only. */
export type TechnologyCard = {
  id: string;
  title: string;
  body: string;
};

export const TECHNOLOGY_CARDS: readonly TechnologyCard[] = [
  {
    id: "detection",
    title: "주변 감지",
    body: "주변 상황을 감지해 필요한 정보를 전달하도록 설계했습니다.",
  },
  {
    id: "haptics",
    title: "진동 피드백",
    body: "소리뿐 아니라 촉각을 통해 정보를 자연스럽게 전달합니다.",
  },
  {
    id: "connected",
    title: "스마트 기술",
    body: "지팡이에 새로운 기술을 더해 더 넓은 이동 경험을 만들어갑니다.",
  },
  {
    id: "everyday",
    title: "일상을 위한 디자인",
    body: "매일 사용하는 지팡이인 만큼 익숙하고 편안한 형태를 생각했습니다.",
  },
] as const;;
