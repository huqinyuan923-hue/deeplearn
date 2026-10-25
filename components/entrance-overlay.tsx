'use client'

import { useEffect, useState } from 'react'

/**
 * 进站引导动画（学习平台风，每会话一次）：
 * 书本合开 → 学习线装载 → 章节计数 → 整层淡出揭示。
 * 会话标记由 layout 内联脚本在文档开头完成；prefers-reduced-motion 直接跳过。
 */
export function EntranceOverlay() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const onAnimEnd = (e: AnimationEvent) => {
      if (e.animationName === 'dl-exit') {
        document.documentElement.dataset.boot = 'done'
        setGone(true)
      }
    }
    document.addEventListener('animationend', onAnimEnd)
    const fallback = window.setTimeout(() => {
      document.documentElement.dataset.boot = 'done'
      setGone(true)
    }, 6000)
    return () => {
      document.removeEventListener('animationend', onAnimEnd)
      window.clearTimeout(fallback)
    }
  }, [])

  if (gone) return null

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
html[data-boot='done'] .dl-boot{display:none}
.dl-boot{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:radial-gradient(ellipse 80% 55% at 50% 30%,rgba(16,185,129,.1),transparent),#0b1220;font-family:system-ui,sans-serif;animation:dl-exit .55s cubic-bezier(.65,0,.35,1) 2.5s forwards}
.dl-boot .dl-logo{font-size:clamp(30px,6vw,56px);font-weight:800;letter-spacing:.04em;color:#ecfdf5;animation:dl-in .5s cubic-bezier(.22,1,.36,1) both}
.dl-boot .dl-logo em{font-style:normal;color:#34d399}
.dl-boot .dl-books{display:flex;gap:10px}
.dl-boot .dl-books span{font-size:34px;opacity:0;animation:dl-pop .4s cubic-bezier(.34,1.56,.64,1) both}
.dl-boot .dl-books span:nth-child(1){animation-delay:.4s}
.dl-boot .dl-books span:nth-child(2){animation-delay:.58s}
.dl-boot .dl-books span:nth-child(3){animation-delay:.76s}
.dl-boot .dl-books span:nth-child(4){animation-delay:.94s}
.dl-boot .dl-line{font-family:ui-monospace,monospace;font-size:13px;letter-spacing:.1em;color:#94a3b8;opacity:0;animation:dl-in .3s ease 1.15s both}
.dl-boot .dl-line b{color:#34d399;font-weight:600}
@keyframes dl-in{from{opacity:0;transform:translateY(10px)}}
@keyframes dl-pop{from{opacity:0;transform:scale(.3) rotate(-12deg)}}
@keyframes dl-exit{to{opacity:0;visibility:hidden;transform:scale(1.04)}}
@media (prefers-reduced-motion:reduce){.dl-boot{display:none}}
`,
        }}
      />
      <div className="dl-boot" aria-hidden="true">
        <div className="dl-logo">
          深学 <em>DeepLearn</em>
        </div>
        <div className="dl-books">
          <span>🤖</span>
          <span>⚛️</span>
          <span>🐍</span>
          <span>💻</span>
        </div>
        <div className="dl-line">
          {'> 装载 '}<b>4 条学习线 · 15 章</b>{' · 测验与抽认卡就绪 <b>READY</b>'}
        </div>
      </div>
    </>
  )
}
