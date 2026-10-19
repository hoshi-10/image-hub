export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
}
export const PIC_REVIEW_STATUS_MAP: Record<string, string> = {
  0: '待审核',
  1: '通过',
  2: '拒绝',
}

export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  return {
    label: PIC_REVIEW_STATUS_MAP[key], //在 PIC_REVIEW_STATUS_MAP 这个对象里，取叫 key 的那个属性的值。
    value: key,
  }
})
