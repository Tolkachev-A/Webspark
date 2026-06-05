import postsData from './config/posts.json'
import flatpickr from 'flatpickr'

let currentView = 'list'
let allPosts = []
let filteredPosts = []
let dateFromValue = null
let dateToValue = null
let visibleCount = 9
let fromPicker = null
let toPicker = null

const POSTS_PER_LOAD = 9

const postsContainer = document.getElementById('posts-container')
const loadMoreBtn = document.getElementById('load-more')
const dateFromInput = document.querySelector('.date-from')
const dateToInput = document.querySelector('.date-to')
const viewButtons = document.querySelectorAll('.view-btn')
const clearButtons = document.querySelectorAll('.date-btn.clear')

function initDatePickers() {
  fromPicker = flatpickr(dateFromInput, {
    dateFormat: 'd_m_Y',
    onChange(selectedDates) {
      if (!selectedDates[0]) return

      dateFromValue = selectedDates[0]

      if (dateToValue && dateFromValue > dateToValue) {
        dateToValue = dateFromValue
        toPicker.setDate(dateToValue)
      }

      toPicker.set('minDate', dateFromValue)

      if (dateToValue) {
        filterByDate(dateFromValue, dateToValue)
      }
    }
  })

  toPicker = flatpickr(dateToInput, {
    dateFormat: 'd_m_Y',
    onChange(selectedDates) {
      if (!selectedDates[0]) return

      dateToValue = selectedDates[0]

      if (dateFromValue && dateToValue < dateFromValue) {
        dateFromValue = dateToValue
        fromPicker.setDate(dateFromValue)
      }

      fromPicker.set('maxDate', dateToValue)

      if (dateFromValue) {
        filterByDate(dateFromValue, dateToValue)
      }
    }
  })
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${day}_${month}_${year}`
}

function resetFilters() {
  dateFromValue = null
  dateToValue = null

  dateFromInput.value = ''
  dateToInput.value = ''

  filteredPosts = [...allPosts]
  visibleCount = POSTS_PER_LOAD

  renderPosts()
}

function filterByDate(startDate, endDate) {
  if (startDate > endDate) {
    ;[startDate, endDate] = [endDate, startDate]
  }

  filteredPosts = allPosts.filter(post => {
    const [day, month, year] = post.date.split('-')
    const postDate = new Date(year, month - 1, day)

    return postDate >= startDate && postDate <= endDate
  })

  visibleCount = POSTS_PER_LOAD

  renderPosts()
}

async function loadPosts() {
  allPosts = postsData.posts
  filteredPosts = [...allPosts]
  visibleCount = POSTS_PER_LOAD

  renderPosts()
}

function renderPosts() {
  const postsToShow = filteredPosts.slice(0, visibleCount)

  if (
      postsContainer.children.length > 0 &&
      postsContainer.children.length === postsToShow.length
  ) {
    postsContainer.className = `posts-${currentView}`
    updateLoadMoreButton()
    return
  }

  postsContainer.innerHTML = ''
  postsContainer.className = `posts-${currentView}`

  const fragment = document.createDocumentFragment()

  postsToShow.forEach(post => {
    fragment.appendChild(createPostElement(post))
  })

  postsContainer.appendChild(fragment)

  updateLoadMoreButton()
}

function updateLoadMoreButton() {
  loadMoreBtn.style.display =
      visibleCount >= filteredPosts.length
          ? 'none'
          : 'block'
}

function loadMore() {
  loadMoreBtn.disabled = true
  loadMoreBtn.textContent = 'Loading...'

  setTimeout(() => {
    visibleCount += POSTS_PER_LOAD

    renderPosts()

    loadMoreBtn.disabled = false
    loadMoreBtn.textContent = 'Load More'
  }, 3000)
}

function createPostElement(post) {
  const article = document.createElement('article')

  article.className = 'post'

  article.innerHTML = `
    <div class="post__gallery">
      ${createPictureElement(post.srcSet)}
    </div>

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

function createPictureElement(srcSet) {
  const {
    srcJpg,
    srcJpg2x,
    srcWebp,
    srcWebp2x
  } = srcSet

  return `
    <picture class="post__image">
      <source
        srcset="${srcWebp} 1x, ${srcWebp2x} 2x"
        type="image/webp"
      >

      <source
        srcset="${srcJpg} 1x, ${srcJpg2x} 2x"
      >

      <img
        loading="lazy"
        srcset="${srcJpg} 1x, ${srcJpg2x} 2x"
        src="${srcJpg}"
        alt="Post image"
      >
    </picture>
  `
}

function changeView(view) {
  currentView = view

  viewButtons.forEach(btn => {
    btn.classList.remove('active')
  })

  document
      .querySelector(`[data-view="${view}"]`)
      .classList.add('active')

  visibleCount = POSTS_PER_LOAD

  renderPosts()
}

function handleResize() {
  if (window.innerWidth < 480 && currentView === 'list') {
    changeView('grid')
  }
}

function initResizeListener() {
  window.addEventListener('resize', handleResize)

  handleResize()
}

viewButtons.forEach(btn => {
  btn.addEventListener('click', event => {
    changeView(event.currentTarget.dataset.view)
  })
})

loadMoreBtn.addEventListener('click', loadMore)

clearButtons.forEach(btn => {
  btn.addEventListener('click', resetFilters)
})

initDatePickers()

const calendarButtons = document.querySelectorAll('.date-btn[aria-label="Open calendar"]')
calendarButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (index === 0 && fromPicker) {
      fromPicker.open()
    } else if (index === 1 && toPicker) {
      toPicker.open()
    }
  })
})

loadPosts()
initResizeListener()