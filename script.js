/* ============================================================
   script.js — 合并版
   包含：① 华夫饼 Scroll-jacking（waffle）
         ② 地图 Scroll-jacking（map）
   ============================================================ */


/* ============================================================
   ① 华夫饼部分
   ============================================================ */
(function () {
  'use strict';

  const WAFFLE_FRAMES = document.querySelectorAll('.frame');
  const DOTS = document.querySelectorAll('#dots .dot');
  const TOTAL         = WAFFLE_FRAMES.length;
  let current         = 0;

  /* 切换到指定帧 */
  function goTo(index) {
    if (index === current) return;
    WAFFLE_FRAMES[current].classList.remove('active');
    DOTS[current].classList.remove('active');
    current = index;
    WAFFLE_FRAMES[current].classList.add('active');
    DOTS[current].classList.add('active');
    updateUI();
  }

  /* 更新进度条和滚动提示 */
  function updateUI() {
    var pct = TOTAL > 1 ? (current / (TOTAL - 1)) * 100 : 100;
    document.getElementById('progress-bar').style.width = pct + '%';
    var hint = document.getElementById('scroll-Hint');  
    if (hint) {
        if (current > 0) hint.classList.add('hidden');
        else hint.classList.remove('hidden');
    }
  }

  /* 核心：根据 scrollY 计算当前帧 */
  function onScroll() {
    var stage       = document.getElementById('scrollStage1');
    if (!stage) return;
    var stageTop    = stage.offsetTop;
    var frameHeight = window.innerHeight * 0.3;

    var scrolled = window.scrollY - stageTop;
    scrolled = Math.max(0, scrolled);

    var index = Math.floor(scrolled / frameHeight);
    index = Math.max(0, Math.min(index, TOTAL - 1));
    goTo(index);
  }

  /* 导航点点击 */
  DOTS.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx    = parseInt(dot.dataset.index, 10);
      var stage  = document.getElementById('scrollStage1');
      var frameH = stage.offsetHeight / TOTAL;
      var targetY = stage.offsetTop + idx * frameH;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('load', function () {
    updateUI();
  });

}());


/* ============================================================
   ② 地图部分
   ============================================================ */
(function () {
  'use strict';

  // ── 数据：每一帧对应的日期和活动数量 ──────────────────────────
  const MAP_FRAMES = [
    { date: '3月4日',  dateEn: '0304', count: 2,  note: '赛前预热期，首批品牌快闪与展览已陆续开幕。' },
    { date: '3月5日',  dateEn: '0305', count: 4,  note: '' },
    { date: '3月6日',  dateEn: '0306', count: 6,  note: '' },
    { date: '3月7日',  dateEn: '0307', count: 8,  note: '' },
    { date: '3月8日',  dateEn: '0308', count: 11, note: '' },
    { date: '3月9日',  dateEn: '0309', count: 10, note: '' },
    { date: '3月10日', dateEn: '0310', count: 12, note: '' },
    { date: '3月11日', dateEn: '0311', count: 12, note: '' },
    { date: '3月12日', dateEn: '0312', count: 12, note: '' },
    { date: '3月13日', dateEn: '0313', count: 17, note: '' },
    { date: '3月14日', dateEn: '0314', count: 17, note: '乐高集团将通往上海赛车场的地铁11号线临时改造为沉浸式的F1主题“痛车”专列，在徐家汇站用积木重构F1的赛事名场面。' },
    { date: '3月15日', dateEn: '0315', count: 17, note: '赛事最后一天，活动数量维持峰值。' },
    { date: '3月16日', dateEn: '0316', count: 8,  note: '' },
    { date: '3月17日', dateEn: '0317', count: 6,  note: '' },
  ];

  const SCROLL_PER_FRAME = 105;

  // ── DOM 引用 ──────────────────────────────────────────────────
  const stage         = document.getElementById('scrollStage');
  const mapImg        = document.getElementById('mapImg');
  const placeholder   = document.getElementById('mapPlaceholder');
  const dateBadge     = document.getElementById('dateBadge');
  const countBadge    = document.getElementById('countBadge');
  const progressBar   = document.getElementById('progressBar');
  const scrollHint    = document.getElementById('map-scroll-hint');
  const frameNote     = document.getElementById('frameNote');
  const frameNoteText = document.getElementById('frameNoteText');

  let currentFrame = -1;
  let imgCache = {};

  // ── 初始化 ────────────────────────────────────────────────────
  function init() {
    if (!stage) return;
    const stageHeight = window.innerHeight + MAP_FRAMES.length * SCROLL_PER_FRAME;
    stage.style.height = stageHeight + 'px';

    MAP_FRAMES.forEach(function (f) {
      var img = new Image();
      img.src = 'images/map_' + f.dateEn + '.jpg';
      img.onload  = function () { imgCache[f.dateEn] = true; };
      img.onerror = function () { imgCache[f.dateEn] = false; };
    });

    updateFrame(0);
  }

  // ── 核心：根据滚动位置计算当前帧 ─────────────────────────────
  function onScroll() {
    if (!stage) return;
    var stageTop    = stage.getBoundingClientRect().top + window.scrollY;
    var stageBottom = stageTop + stage.offsetHeight - window.innerHeight;
    var scrollY     = window.scrollY;

    if (scrollY < stageTop || scrollY > stageBottom) return;

    var relativeScroll = scrollY - stageTop;
    var rawIndex       = relativeScroll / SCROLL_PER_FRAME;
    var frameIndex     = Math.min(Math.floor(rawIndex), MAP_FRAMES.length - 1);

    if (frameIndex !== currentFrame) updateFrame(frameIndex);

    var progress = (relativeScroll / (MAP_FRAMES.length * SCROLL_PER_FRAME)) * 100;
    if (progressBar) progressBar.style.width = Math.min(progress, 100) + '%';

    if (scrollHint) {
      if (frameIndex > 0) scrollHint.classList.add('hidden');
      else scrollHint.classList.remove('hidden');
    }
  }

  // ── 更新帧内容 ────────────────────────────────────────────────
  function updateFrame(index) {
    currentFrame = index;
    var frame = MAP_FRAMES[index];

    if (dateBadge)  dateBadge.innerHTML = '<span class="year">2026</span>' + frame.date;
    if (countBadge) {
      countBadge.textContent = frame.count + ' 个活动进行中';
      countBadge.className = 'count-badge';
      if (frame.count <= 4)       countBadge.classList.add('low');
      else if (frame.count <= 8)  countBadge.classList.add('medium');
      else if (frame.count <= 12) countBadge.classList.add('high');
      else                        countBadge.classList.add('peak');
    }

    if (frameNote && frameNoteText) {
      if (frame.note) {
        frameNoteText.textContent = frame.note;
        frameNote.classList.remove('hidden');
      } else {
        frameNote.classList.add('hidden');
      }
    }

    var newSrc = 'images/map_' + frame.dateEn + '.jpg';
    if (mapImg && !mapImg.src.endsWith(newSrc.replace('images/', ''))) {
      mapImg.classList.add('fading');
      setTimeout(function () {
        mapImg.src = newSrc;
        mapImg.alt = frame.date + '活动分布地图';
        mapImg.classList.remove('fading');
        mapImg.onload = function () {
          if (placeholder) placeholder.style.display = 'none';
          mapImg.style.display = 'block';
        };
        mapImg.onerror = function () {
          if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.querySelector('p').textContent =
              '等待图片：images/map_' + frame.dateEn + '.jpg';
          }
          mapImg.style.display = 'none';
        };
      }, 120);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('resize', function () {
    if (!stage) return;
    stage.style.height = (window.innerHeight + MAP_FRAMES.length * SCROLL_PER_FRAME) + 'px';
  });

  document.addEventListener('DOMContentLoaded', init);

}());

// ── coco内容 ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

  /* ── 获取所有元素 ── */
  const steps     = document.querySelectorAll('.step');          // 右侧文字步骤
  const slides    = document.querySelectorAll('.viz-slide');     // 左侧图片
  const dots      = document.querySelectorAll('.dot');           // 进度点

  let currentIndex = 0;

  /* ── 切换图片函数 ── */
  function showSlide(index) {
    if (index === currentIndex && slides[index].classList.contains('active')) return;

    // 隐藏所有图片
    slides.forEach(function (s) {
      s.classList.remove('active');
      s.style.position = 'absolute';
    });

    // 显示目标图片
    if (slides[index]) {
      slides[index].classList.add('active');
      slides[index].style.position = 'relative';
    }

    // 更新文字步骤高亮
    steps.forEach(function (s) { s.classList.remove('active'); });
    if (steps[index]) steps[index].classList.add('active');

    // 更新进度点
    dots.forEach(function (d) { d.classList.remove('active'); });
    if (dots[index]) dots[index].classList.add('active');

    currentIndex = index;
  }

  /* ── IntersectionObserver：监听右侧文字步骤进入视口 ── */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.getAttribute('data-step'), 10);
        showSlide(index);
      }
    });
  }, {
    /*
     * rootMargin: 让触发点在视口中间偏上的位置
     * 上边距 -30% = 元素进入视口上方 30% 处才触发
     * 下边距 -50% = 元素超过视口中点才失效
     */
    rootMargin: '-30% 0px -50% 0px',
    threshold: 0
  });

  steps.forEach(function (step) {
    observer.observe(step);
  });

  /* ── 点击进度点直接跳转 ── */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = parseInt(dot.getAttribute('data-dot'), 10);
      if (steps[index]) {
        steps[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* ── 初始化：显示第一张图 ── */
  showSlide(0);

  /* ── 图片加载失败时显示占位符 ── */
  document.querySelectorAll('.viz-img-wrap img').forEach(function (img) {
    img.addEventListener('error', function () {
      // 图片加载失败，显示占位符
      const placeholder = img.nextElementSibling;
      if (placeholder && placeholder.classList.contains('viz-placeholder')) {
        placeholder.style.display = 'flex';
      }
      img.style.display = 'none';
    });

    img.addEventListener('load', function () {
      // 图片加载成功，隐藏占位符
      const placeholder = img.nextElementSibling;
      if (placeholder && placeholder.classList.contains('viz-placeholder')) {
        placeholder.style.display = 'none';
      }
    });
  });

});/* ============================================================
   F1 Scrollytelling · main.js
   功能：
   1. 滚动时监听右侧文字步骤，切换左侧对应图片
   2. 更新进度点
   3. 图片加载失败时显示占位符
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── 获取所有元素 ── */
  const steps     = document.querySelectorAll('.step');          // 右侧文字步骤
  const slides    = document.querySelectorAll('.viz-slide');     // 左侧图片
  const dots      = document.querySelectorAll('.dot');           // 进度点

  let currentIndex = 0;

  /* ── 切换图片函数 ── */
  function showSlide(index) {
    if (index === currentIndex && slides[index].classList.contains('active')) return;

    // 隐藏所有图片
    slides.forEach(function (s) {
      s.classList.remove('active');
      s.style.position = 'absolute';
    });

    // 显示目标图片
    if (slides[index]) {
      slides[index].classList.add('active');
      slides[index].style.position = 'relative';
    }

    // 更新文字步骤高亮
    steps.forEach(function (s) { s.classList.remove('active'); });
    if (steps[index]) steps[index].classList.add('active');

    // 更新进度点
    dots.forEach(function (d) { d.classList.remove('active'); });
    if (dots[index]) dots[index].classList.add('active');

    currentIndex = index;
  }

  /* ── IntersectionObserver：监听右侧文字步骤进入视口 ── */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.getAttribute('data-step'), 10);
        showSlide(index);
      }
    });
  }, {
    /*
     * rootMargin: 让触发点在视口中间偏上的位置
     * 上边距 -30% = 元素进入视口上方 30% 处才触发
     * 下边距 -50% = 元素超过视口中点才失效
     */
    rootMargin: '-30% 0px -50% 0px',
    threshold: 0
  });

  steps.forEach(function (step) {
    observer.observe(step);
  });

  /* ── 点击进度点直接跳转 ── */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = parseInt(dot.getAttribute('data-dot'), 10);
      if (steps[index]) {
        steps[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* ── 初始化：显示第一张图 ── */
  showSlide(0);

  /* ── 图片加载失败时显示占位符 ── */
  document.querySelectorAll('.viz-img-wrap img').forEach(function (img) {
    img.addEventListener('error', function () {
      // 图片加载失败，显示占位符
      const placeholder = img.nextElementSibling;
      if (placeholder && placeholder.classList.contains('viz-placeholder')) {
        placeholder.style.display = 'flex';
      }
      img.style.display = 'none';
    });

    img.addEventListener('load', function () {
      // 图片加载成功，隐藏占位符
      const placeholder = img.nextElementSibling;
      if (placeholder && placeholder.classList.contains('viz-placeholder')) {
        placeholder.style.display = 'none';
      }
    });
  });

});