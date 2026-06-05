import postsData from './config/posts.json'
import flatpickr from 'flatpickr'

let currentView = 'list'
let allPosts = []
let filteredPosts = []
let dateFromValue = null
let dateToValue = null
let visibleCount = 9
const POSTS_PER_LOAD = 9

function initDatePickers() {
  const dateFromInput = document.querySelector('.date-from')
  const dateToInput = document.querySelector('.date-to')

  const fromPicker = flatpickr(dateFromInput, {
    dateFormat: 'd_m_Y',
    onChange: function(selectedDates) {
      if (selectedDates[0]) {
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
    }
  })

  const toPicker = flatpickr(dateToInput, {
    dateFormat: 'd_m_Y',
    onChange: function(selectedDates) {
      if (selectedDates[0]) {
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
  document.querySelector('.date-from').value = ''
  document.querySelector('.date-to').value = ''
  filteredPosts = [...allPosts]
  visibleCount = POSTS_PER_LOAD
  renderPosts()
}

function filterByDate(startDate, endDate) {
  if (startDate > endDate) {
    const temp = startDate
    startDate = endDate
    endDate = temp
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
  const container = document.getElementById('posts-container')
  const loadMoreBtn = document.getElementById('load-more')

  // Ограничиваем количество отображаемых постов
  const postsToShow = filteredPosts.slice(0, visibleCount)

  // Если посты уже отрендерены, просто меняем класс контейнера
  if (container.children.length > 0 && container.children.length === postsToShow.length) {
    container.className = `posts-${currentView}`
    updateLoadMoreButton()
    return
  }

  // Иначе рендерим посты заново
  container.innerHTML = ''
  container.className = `posts-${currentView}`

  postsToShow.forEach(post => {
    const postElement = createPostElement(post)
    container.appendChild(postElement)
  })

  updateLoadMoreButton()
}

function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById('load-more')
  if (visibleCount >= filteredPosts.length) {
    loadMoreBtn.style.display = 'none'
  } else {
    loadMoreBtn.style.display = 'block'
  }
}

function loadMore() {
  const loadMoreBtn = document.getElementById('load-more')
  loadMoreBtn.disabled = true
  loadMoreBtn.textContent = 'Loading...'

  setTimeout(() => {
    visibleCount += POSTS_PER_LOAD
    renderPosts()
    loadMoreBtn.disabled = false
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
  const { srcJpg, srcJpg2x, srcWebp, srcWebp2x } = srcSet

  return `
    <picture class="post__image">
      <source srcset="${srcWebp} 1x, ${srcWebp2x} 2x" type="image/webp">
      <source srcset="${srcJpg} 1x, ${srcJpg2x} 2x">
      <img srcset="${srcJpg} 1x, ${srcJpg2x} 2x" src="${srcJpg}" alt="Post image">
    </picture>
  `
}



function changeView(view) {
  currentView = view
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  document.querySelector(`[data-view="${view}"]`).classList.add('active')
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
  // Проверяем при загрузке
  handleResize()
}

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    changeView(e.currentTarget.dataset.view)
  })
})

document.getElementById('load-more').addEventListener('click', loadMore)

initDatePickers()

document.querySelectorAll('.date-btn.clear').forEach(btn => {
  btn.addEventListener('click', resetFilters)
})

loadPosts()
initResizeListener()
