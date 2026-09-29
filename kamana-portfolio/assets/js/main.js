(function() {
  "use strict";

  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = { hero: false }

  const select = (el, all = false) => {
    el = el.trim()
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el)
  }
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) selectEl.forEach(e => e.addEventListener(type, listener))
      else selectEl.addEventListener(type, listener)
    }
  }

  /** Header state, progress bar, back to top */
  const header = select('#header'), toTop = select('.to-top'), bar = select('.progress')
  const onPageScroll = () => {
    const y = window.scrollY
    const h = document.documentElement.scrollHeight - window.innerHeight
    if (header) header.classList.toggle('scrolled', y > 30)
    if (toTop) toTop.classList.toggle('show', y > 500)
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%'
  }
  window.addEventListener('scroll', onPageScroll, { passive: true })
  window.addEventListener('load', onPageScroll)
  onPageScroll()

  /** Mobile nav */
  const nav = select('#navbar'), toggle = select('.nav-toggle')
  const closeNav = () => {
    if (!nav || !toggle) return
    nav.classList.remove('open')
    toggle.setAttribute('aria-expanded', 'false')
    toggle.firstElementChild.className = 'bi bi-list'
  }
  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open')
      toggle.setAttribute('aria-expanded', open)
      toggle.firstElementChild.className = open ? 'bi bi-x' : 'bi bi-list'
    })
    select('#navbar a', true).forEach(a => a.addEventListener('click', closeNav))
  }

  /** Active nav link on scroll */
  const links = select('#navbar a', true)
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id))
      })
    }, { rootMargin: '-45% 0px -50% 0px' })
    links.forEach(a => { const s = a.hash && select(a.hash); if (s) spy.observe(s) })
  }

  /** Hero name: split into letters (staggered entrance + hover) */
  const h1 = select('.hero h1')
  if (h1) {
    const txt = h1.textContent.trim()
    h1.textContent = ''
    ;[...txt].forEach((c, i) => {
      const s = document.createElement('span')
      s.className = 'ch'; s.style.setProperty('--i', i); s.textContent = c; s.setAttribute('aria-hidden', 'true')
      h1.appendChild(s)
    })
  }

  /** Intro type effect */
  const typed = select('.typed')
  if (typed) {
    const items = typed.getAttribute('data-typed-items').split(',').map(s => s.trim())
    let i = 0, j = 0, del = false
    if (reduce) typed.textContent = items[0]
    else (function tick() {
      if (state.hero) return void setTimeout(tick, 250)
      const word = items[i]
      typed.textContent = word.slice(0, del ? --j : ++j)
      let t = del ? 50 : 100
      if (!del && j === word.length) { del = true; t = 2000 }
      else if (del && j === 0) { del = false; i = (i + 1) % items.length; t = 350 }
      setTimeout(tick, t)
    })()
  }

  /** Hero glow + parallax layers follow pointer */
  const hero = select('#hero')
  if (hero && !reduce) {
    const layers = select('.layer', true)
    hero.addEventListener('pointermove', e => {
      if (state.hero) return
      const r = hero.getBoundingClientRect()
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px')
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px')
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5
      layers.forEach(l => {
        const d = +l.dataset.depth || 0
        l.style.setProperty('--tx', (nx * d) + 'px')
        l.style.setProperty('--ty', (ny * d) + 'px')
      })
    })
  }

  /** Services: expanding panels */
  const panels = select('.panel', true)
  const activate = p => panels.forEach(o => o.classList.toggle('active', o === p))
  panels.forEach(p => {
    p.addEventListener('mouseenter', () => activate(p))
    p.addEventListener('focus', () => activate(p))
    p.addEventListener('click', () => activate(p))
  })

  /** Reveal on scroll */
  const reveals = select('.reveal', true)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    reveals.forEach(r => io.observe(r))
  } else reveals.forEach(r => r.classList.add('in'))

  /** Education / Experience tabs */
  const tabs = select('.tab', true)
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(o => {
      const isOn = o === t
      o.setAttribute('aria-selected', isOn)
      const panel = document.getElementById(o.getAttribute('aria-controls'))
      if (panel) panel.hidden = !isOn
    })
  }))

  /** Work: filter + live preview */
  const filters = select('.filter', true), rows = select('.work-row', true)
  const pvBody = select('#pv-body'), pvImg = select('#pv-img'), pvSite = select('#pv-site')
  const pvUrl = select('#pv-url'), pvTag = select('#pv-tag'), pvLink = select('#pv-link')
  const showRow = r => {
    if (!r || !pvBody) return
    rows.forEach(o => o.classList.toggle('on', o === r))
    const img = r.dataset.img
    pvSite.textContent = r.dataset.name
    pvTag.textContent = r.dataset.tag
    pvLink.href = r.href
    pvUrl.textContent = img ? img.split('/').pop() : new URL(r.href).host
    pvImg.hidden = !img
    if (img) pvImg.src = img
    pvBody.classList.toggle('has-img', !!img)
    pvBody.classList.remove('flip'); void pvBody.offsetWidth; pvBody.classList.add('flip')
  }
  rows.forEach(r => {
    r.addEventListener('mouseenter', () => showRow(r))
    r.addEventListener('focus', () => showRow(r))
  })
  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(o => { o.classList.toggle('active', o === f); o.setAttribute('aria-pressed', o === f) })
    const k = f.getAttribute('data-filter')
    rows.forEach(r => r.classList.toggle('hide', k !== '*' && !r.classList.contains(k)))
    showRow(rows.find(r => !r.classList.contains('hide')))
  }))
  showRow(rows[0])

  /** Work: keep list height equal to preview height */
  const wList = select('.work-list'), wPrev = select('.work-preview')
  if (wList && wPrev && 'ResizeObserver' in window) {
    const sync = () => { wList.style.maxHeight = window.innerWidth >= 992 ? wPrev.offsetHeight + 'px' : '' }
    new ResizeObserver(sync).observe(wPrev); window.addEventListener('resize', sync); sync()
  }

  /** Timeline (horizontal): staggered reveal, swipe/scroll controls, edge state */
  const tls = select('.tl', true)
  const tlBar = select('.tl-bar')
  const tlPrev = select('[data-tl="-1"]')
  const tlNext = select('[data-tl="1"]')
  const activeTl = () => tls.find(t => !t.hidden)
  const updateTl = () => {
    const t = activeTl(); if (!t) return
    const max = t.scrollWidth - t.clientWidth, x = Math.round(t.scrollLeft)
    const canPrev = x > 2, canNext = x < max - 2
    if (tlBar) tlBar.classList.toggle('is-scroll', max > 2)
    t.classList.toggle('can-prev', canPrev)
    t.classList.toggle('can-next', canNext)
    if (tlPrev) tlPrev.disabled = !canPrev
    if (tlNext) tlNext.disabled = !canNext
  }
  tls.forEach(t => {
    t.addEventListener('scroll', updateTl, { passive: true })
    t.querySelectorAll('.tl-item').forEach((i, n) => i.style.setProperty('--d', (n * .12) + 's'))
  })
  if ('IntersectionObserver' in window) {
    const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); tio.unobserve(e.target) } }), { threshold: .3 })
    select('.tl-item', true).forEach(i => tio.observe(i))
  } else select('.tl-item', true).forEach(i => i.classList.add('in'))
  ;[tlPrev, tlNext].forEach(b => b && b.addEventListener('click', () => {
    const t = activeTl(); if (!t) return
    t.scrollBy({ left: +b.dataset.tl * t.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' })
  }))
  tabs.forEach(t => t.addEventListener('click', () => { const a = activeTl(); if (a) a.scrollLeft = 0; setTimeout(updateTl, 30) }))
  if ('ResizeObserver' in window) tls.forEach(t => new ResizeObserver(updateTl).observe(t))
  window.addEventListener('resize', updateTl)
  updateTl()

  /** Contact: copy email */
  select('[data-copy]', true).forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.copy, done = () => toast('Email copied')
    navigator.clipboard ? navigator.clipboard.writeText(v).then(done, done) : done()
  }))

  /** Custom cursor ring (mouse only) */
  const cursor = select('.cursor')
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      cursor.classList.add('on')
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      cursor.classList.toggle('big', !!e.target.closest('a, button, .panel, .row'))
    })
    document.addEventListener('mouseleave', () => cursor.classList.remove('on'))
  }

  /** Toast */
  const toastEl = select('.toast'); let toastT
  const toast = msg => {
    if (!toastEl) return
    toastEl.textContent = msg; toastEl.classList.add('show')
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1800)
  }

  /** Play / pause controls */
  const setCtrl = (btn, paused) => {
    btn.setAttribute('aria-pressed', paused)
    btn.setAttribute('aria-label', paused ? 'Play animations' : 'Pause animations')
    btn.querySelector('i').className = 'bi ' + (paused ? 'bi-play-fill' : 'bi-pause-fill')
    const t = btn.querySelector('span'); if (t) t.textContent = paused ? 'Play' : 'Pause'
  }
  const toggleGroup = (name, force) => {
    let paused
    if (name === 'hero') {
      paused = force === undefined ? !state.hero : force
      state.hero = paused; hero && hero.classList.toggle('paused', paused)
      document.documentElement.classList.toggle('anim-paused', paused)
    }
    select('[data-ctrl="' + name + '"]', true).forEach(b => setCtrl(b, paused))
  }
  select('[data-ctrl]', true).forEach(b => b.addEventListener('click', () => toggleGroup(b.dataset.ctrl)))

  /** Hero: draggable chips, copy swatch, inspect mode, live cursor tag */
  const stage = select('.stage')
  if (stage) {
    select('.layer', true).forEach(l => {
      if (l.classList.contains('win') || l.classList.contains('pointer')) return
      let sx, sy, ox = 0, oy = 0, moved = false, down = false
      l.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sy = e.clientY; l.setPointerCapture(e.pointerId) })
      l.addEventListener('pointermove', e => {
        if (!down) return
        const dx = e.clientX - sx, dy = e.clientY - sy
        if (!moved && Math.hypot(dx, dy) < 5) return
        moved = true; l.classList.add('dragging')
        l.style.setProperty('--dx', (ox + dx) + 'px'); l.style.setProperty('--dy', (oy + dy) + 'px')
      })
      const end = e => {
        if (!down) return
        down = false
        if (moved) { ox = parseFloat(l.style.getPropertyValue('--dx')) || 0; oy = parseFloat(l.style.getPropertyValue('--dy')) || 0 }
        l.classList.remove('dragging')
        try { l.releasePointerCapture(e.pointerId) } catch (_) {}
      }
      l.addEventListener('pointerup', end); l.addEventListener('pointercancel', end)
      l.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } }, true)
    })
    select('.sw', true).forEach(s => s.addEventListener('click', () => {
      const hex = s.dataset.hex
      const done = () => toast('Copied ' + hex)
      navigator.clipboard ? navigator.clipboard.writeText(hex).then(done, done) : done()
    }))
    const ins = select('[data-inspect]')
    if (ins) ins.addEventListener('click', () => {
      const v = hero.classList.toggle('inspect'); ins.setAttribute('aria-pressed', v)
      toast(v ? 'Inspect mode on' : 'Inspect mode off')
    })
    const tag = select('.pointer')
    if (tag && !reduce) stage.addEventListener('pointermove', e => {
      if (state.hero) return
      const r = stage.getBoundingClientRect()
      tag.style.setProperty('--dx', (e.clientX - r.left - r.width * .44) + 'px')
      tag.style.setProperty('--dy', (e.clientY - r.top - r.height * .46) + 'px')
    })
  }

  /** Quick nav palette (Ctrl/Cmd + K) */
  const pal = select('.palette'), palIn = select('#pal-input'), palList = select('#pal-list')
  if (pal) {
    const cv = select('a[href$=".pdf"]')
    const cmds = select('#navbar a', true).map(a => ({ label: 'Go to ' + a.textContent, icon: 'bi-arrow-right-short', run: () => { location.hash = a.hash } }))
    cmds.push({ label: 'Download CV', icon: 'bi-download', run: () => cv && window.open(cv.href, '_blank') })
    cmds.push({ label: 'Send email', icon: 'bi-envelope', run: () => { location.href = 'mailto:kamanawebdesigner@gmail.com' } })
    cmds.push({ label: 'Play / pause animations', icon: 'bi-pause-circle', run: () => { const p = !state.hero; toggleGroup('hero', p) } })
    let shown = [], idx = 0
    const render = () => {
      const q = palIn.value.trim().toLowerCase()
      shown = cmds.filter(c => c.label.toLowerCase().includes(q)); idx = 0
      palList.innerHTML = shown.length ? '' : '<li class="palette-empty">No match</li>'
      shown.forEach((c, i) => {
        const li = document.createElement('li'); li.className = i === 0 ? 'on' : ''
        li.innerHTML = '<button type="button"><i class="bi ' + c.icon + '"></i>' + c.label + '</button>'
        li.firstChild.addEventListener('click', () => choose(c))
        palList.appendChild(li)
      })
    }
    const mark = () => [...palList.children].forEach((li, i) => li.classList.toggle('on', i === idx))
    const close = () => { pal.hidden = true }
    const open = () => { pal.hidden = false; palIn.value = ''; render(); palIn.focus() }
    const choose = c => { close(); c.run() }
    palIn.addEventListener('input', render)
    pal.addEventListener('click', e => { if (e.target === pal) close() })
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? open() : close(); return }
      if (pal.hidden) return
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowDown') { e.preventDefault(); idx = (idx + 1) % (shown.length || 1); mark() }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx = (idx - 1 + shown.length) % (shown.length || 1); mark() }
      else if (e.key === 'Enter' && shown[idx]) choose(shown[idx])
    })
    select('[data-open-palette]', true).forEach(b => b.addEventListener('click', open))
  }

  /** Preloader (only if present) */
  const preloader = select('#preloader')
  if (preloader) window.addEventListener('load', () => preloader.remove())

})()