import { describe, expect, it } from 'vitest'
import { en } from './en'
import { zhTW } from './zhTW'
import { translate } from './translate'

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('i18n dictionaries', () => {
  it('en and zhTW have exactly the same keys', () => {
    expect(Object.keys(zhTW).sort()).toEqual(Object.keys(en).sort())
  })

  it('no translation is empty', () => {
    for (const [key, value] of Object.entries(zhTW)) {
      expect(value.trim(), key).not.toBe('')
    }
  })

  it('each translation uses the same {placeholders} as English', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(zhTW[key]), key).toEqual(placeholders(en[key]))
    }
  })

  it('uses Taiwan wording, not Simplified forms', () => {
    const all = Object.values(zhTW).join('')
    for (const simplified of ['缓存', '设置', '模型比较', '输入', '输出', '货币', '汇率']) {
      expect(all.includes(simplified), simplified).toBe(false)
    }
  })
})

describe('translate', () => {
  it('fills placeholders', () => {
    expect(translate('en', 'compare.pick', { n: 2 })).toBe('Model 2')
    expect(translate('zh-TW', 'compare.pick', { n: 2 })).toBe('模型 2')
  })

  it('leaves unknown placeholders as they are', () => {
    expect(translate('en', 'compare.pick')).toBe('Model {n}')
  })
})
