import postsData from './config/posts.json'
import flatpickr from 'flatpickr'

let currentView = 'list'
let allPosts = []
let filteredPosts = []
let dateFromValue = null
let dateToValue = null

function initDatePickers() {
  flatpickr('.date-from', {
    dateFormat: 'Y-m-d',
    onChange: function(selectedDates) {
      if (selectedDates[0]) {
        dateFromValue = selectedDates[0]
        document.querySelector('.date-from').value = formatDate(selectedDates[0])
        if (dateToValue) {
          filterByDate(dateFromValue, dateToValue)
        }
      }
    }
  })

  flatpickr('.date-to', {
    dateFormat: 'Y-m-d',
    onChange: function(selectedDates) {
      if (selectedDates[0]) {
        dateToValue = selectedDates[0]
        document.querySelector('.date-to').value = formatDate(selectedDates[0])
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
  return `${day}.${month}.${year}`
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
  renderPosts()
}



async function loadPosts() {
  allPosts = postsData.posts
  filteredPosts = [...allPosts]
  renderPosts()
}

function renderPosts() {
  const container = document.getElementById('posts-container')

  // Если посты уже отрендерены, просто меняем класс контейнера
  if (container.children.length > 0 && container.children.length === filteredPosts.length) {
    container.className = `posts-${currentView}`
    return
  }

  // Иначе рендерим посты заново
  container.innerHTML = ''
  container.className = `posts-${currentView}`

  filteredPosts.forEach(post => {
    const postElement = createPostElement(post)
    container.appendChild(postElement)
  })
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

// function sortPosts(sortType) {
//   switch (sortType) {
//     case 'date-desc':
//       filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date))
//       break
//     case 'date-asc':
//       filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date))
//       break
//     case 'likes':
//       filteredPosts.sort((a, b) => b.likes - a.likes)
//       break
//     case 'comments':
//       filteredPosts.sort((a, b) => b.comments - a.comments)
//       break
//   }
//   renderPosts()
// }

function changeView(view) {
  currentView = view
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  document.querySelector(`[data-view="${view}"]`).classList.add('active')
  renderPosts()
}

// document.getElementById('sort-select').addEventListener('change', (e) => {
//   sortPosts(e.target.value)
// })

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    changeView(e.currentTarget.dataset.view)
  })
})

document.getElementById('load-more').addEventListener('click', () => {
  console.log('Load more posts')
})


initDatePickers()
loadPosts()
