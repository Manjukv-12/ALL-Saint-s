/** Default CSI parish areas — custom areas saved on families are merged in at runtime. */
export const CHURCH_AREAS = [
  'CSI-Kuriachira Area',
  'CSI-Paravattani/Mannuthy',
  'CSI East Fort - Chembukavu',
  'CSI-Westfort Ayyanthole',
  'CSI-Kolazhy Poomala Area',
  'CSI-Kannamkulangara Kanimangalam',
  'CSI-Chelakott Kuttanellur',
  'CSI-Mission Quarters',
  'CSI-Chiyyaram Area',
  'CSI-Ollur/Pudukad',
  'CSI-Poonkunnam',
] as const;

export type ChurchArea = (typeof CHURCH_AREAS)[number];

export function isChurchArea(value: string): value is ChurchArea {
  return (CHURCH_AREAS as readonly string[]).includes(value);
}
