import postsData from './config/posts.json'
import flatpickr from 'flatpickr'

const POSTS_PER_LOAD = 9

let state = {
  currentView: 'list',
  allPosts: [],
  filteredPosts: [],
  dateFromValue: null,
  dateToValue: null,
  visibleCount: POSTS_PER_LOAD
}

const dom = {
  container: document.getElementById('posts-container'),
  loadMoreBtn: document.getElementById('load-more'),
  dateFromInput: document.querySelector('.date-from'),
  dateToInput: document.querySelector('.date-to'),
  viewButtons: document.querySelectorAll('.view-btn'),
  clearButtons: document.querySelectorAll('.date-btn.clear'),
  calendarButtons: document.querySelectorAll('.date-btn[aria-label="Open calendar"]')
}

let fromPicker = null
let toPicker = null

function parsePostDate(dateStr) {
  const [day, month, year] = dateStr.split('-')
  return new Date(year, month - 1, day)
}

function applyDateFilter(startDate, endDate) {
  if (!startDate || !endDate) return

  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate]
  }

  state.filteredPosts = state.allPosts.filter(post => {
    const postDate = parsePostDate(post.date)
    return postDate >= startDate && postDate <= endDate
  })

  state.visibleCount = POSTS_PER_LOAD
  renderPosts()
}

function resetFilters() {
  state.dateFromValue = null
  state.dateToValue = null
  state.filteredPosts = [...state.allPosts]
  state.visibleCount = POSTS_PER_LOAD

  if (dom.dateFromInput) {
    dom.dateFromInput.value = ''
    dom.dateFromInput._flatpickr?.clear()
  }
  if (dom.dateToInput) {
    dom.dateToInput.value = ''
    dom.dateToInput._flatpickr?.clear()
  }

  // Сбрасываем ограничения пикеров
  if (fromPicker) {
    fromPicker.clear()
    fromPicker.set('minDate', null)
    fromPicker.set('maxDate', null)
  }
  if (toPicker) {
    toPicker.clear()
    toPicker.set('minDate', null)
    toPicker.set('maxDate', null)
  }

  renderPosts()
}

function initDatePickers() {
  if (!dom.dateFromInput || !dom.dateToInput) return

  fromPicker = flatpickr(dom.dateFromInput, {
    dateFormat: 'd_m_Y',
    allowInput: true,
    onChange: ([selectedDate]) => {
      if (!selectedDate) return

      state.dateFromValue = selectedDate

      if (state.dateToValue && selectedDate > state.dateToValue) {
        state.dateToValue = selectedDate
        toPicker.setDate(state.dateToValue)
      }

      toPicker.set('minDate', selectedDate)

      if (state.dateToValue) {
        applyDateFilter(selectedDate, state.dateToValue)
      }
    }
  })

  toPicker = flatpickr(dom.dateToInput, {
    dateFormat: 'd_m_Y',
    allowInput: true,
    onChange: ([selectedDate]) => {
      if (!selectedDate) return

      state.dateToValue = selectedDate

      if (state.dateFromValue && selectedDate < state.dateFromValue) {
        state.dateFromValue = selectedDate
        fromPicker.setDate(state.dateFromValue)
      }

      fromPicker.set('maxDate', selectedDate)

      if (state.dateFromValue) {
        applyDateFilter(state.dateFromValue, selectedDate)
      }
    }
  })
}

function createPictureElement(srcSet) {
  const { srcJpg, srcJpg2x, srcWebp, srcWebp2x } = srcSet

  return `
    <picture class="post__image">
      <source srcset="${srcWebp} 1x, ${srcWebp2x} 2x" type="image/webp">
      <source srcset="${srcJpg} 1x, ${srcJpg2x} 2x">
      <img loading="lazy" srcset="${srcJpg} 1x, ${srcJpg2x} 2x" src="${srcJpg}" alt="Post image">
    </picture>
  `
}

function createPostElement(post) {
  const article = document.createElement('article')
  article.className = 'post'

  article.innerHTML = `
    <div class="post__gallery">${createPictureElement(post.srcSet)}</div>
    <div class="post__content">
      <div>
        <h2 class="post__title">${post.title}</h2>
        <div class="post__meta">
          <p class="post__like">${post.likes}</p>
          <p class="post__messages">${post.comments}</p>
        </div>
      </div>
      <div>
        <h2 class="post__title">${post.date}</h2>
        <div class="post__meta">
          <span class="post__like">${post.shares}</span>
          <span class="post__messages">${post.views}</span>
        </div>
      </div>
      <div class="post__upload">
        <h2 class="post__title">Image upload</h2>
        <time class="post__upload-date">${post.uploadDate}</time>
      </div>
    </div>
  `

  return article
}

function updateLoadMoreButton() {
  const isVisible = state.visibleCount < state.filteredPosts.length
  dom.loadMoreBtn.style.display = isVisible ? 'block' : 'none'
}

function renderPosts() {
  const postsToShow = state.filteredPosts.slice(0, state.visibleCount)

  dom.container.innerHTML = ''
  dom.container.className = `posts-${state.currentView}`

  const fragment = document.createDocumentFragment()
  postsToShow.forEach(post => fragment.appendChild(createPostElement(post)))
  dom.container.appendChild(fragment)

  updateLoadMoreButton()
}

function changeView(view) {
  state.currentView = view
  state.visibleCount = POSTS_PER_LOAD

  dom.viewButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view)
  })

  renderPosts()
}

function handleResize() {
  if (window.innerWidth < 480 && state.currentView === 'list') {
    changeView('grid')
  }
}

function loadMore() {
  if (dom.loadMoreBtn.disabled) return

  dom.loadMoreBtn.disabled = true
  dom.loadMoreBtn.textContent = 'Loading...'

  setTimeout(() => {
    state.visibleCount += POSTS_PER_LOAD
    renderPosts()
    dom.loadMoreBtn.disabled = false
    dom.loadMoreBtn.textContent = 'Load More'
  }, 300)
}

function loadPosts() {
  state.allPosts = postsData.posts
  state.filteredPosts = [...state.allPosts]
  state.visibleCount = POSTS_PER_LOAD
  renderPosts()
}

function bindEvents() {
  dom.viewButtons.forEach(btn => {
    btn.addEventListener('click', () => changeView(btn.dataset.view))
  })

  dom.loadMoreBtn.addEventListener('click', loadMore)

  dom.clearButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      resetFilters()
    })
  })

  dom.calendarButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (index === 0 && fromPicker) fromPicker.open()
      if (index === 1 && toPicker) toPicker.open()
    })
  })

  window.addEventListener('resize', handleResize)
  handleResize()
}

function init() {
  initDatePickers()
  bindEvents()
  loadPosts()
}

init()