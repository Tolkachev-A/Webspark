import './style.scss'

console.log('Webspark app loaded')

// Здесь будет логика датапикера
document.getElementById('datepicker').addEventListener('change', (e) => {
  console.log('Selected date:', e.target.value)
})