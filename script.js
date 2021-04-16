let productData
let openButton

const fetchData = () => {
  fetch('./data/xbox.json')
  .then(res => res.json())
  .then(res => setData(res))
}

const setData = (data) => {
  productData = data
}

const getImages = () => {
  const images = []
  images.push(productData.product.icon)
  images.push(productData.product.firm.gfx)

  return images
}

const getButton = () => {
  openButton = document.querySelector('#createPopup')
  openButton.addEventListener('click', createModal)
}

const createModal = () => {
  const overlay = document.querySelector('.overlay')
  overlay.style.display = 'initial'

  const template = document.querySelector('#popupBox')
  const clone = template.content.cloneNode(true)

  const customSelect = clone.querySelector('.customSelect')
  customSelect.addEventListener('click', toggleDropdown)

  const images = getImages()
  const productImage = clone.querySelector('#productImage')
  productImage.src = images[0]

  const exitButton = clone.querySelector('#exitButton')
  exitButton.addEventListener('click', destroyModal)

  document.body.appendChild(clone)
}

const destroyModal = () => {
  const overlay = document.querySelector('.overlay')
  overlay.style.display = 'none'

  const modal = document.querySelector('.popup')
  document.body.removeChild(modal)
}

// const getCustomSelect = () => {
//   const customSelect = document.querySelector('.customSelect')
//   customSelect.addEventListener('click', toggleDropdown)
// }

const toggleDropdown = () => {
  const form = document.querySelector('.form__productVariant')
  form.addEventListener('click', () => {
    document.querySelector('.customSelect__options').classList.toggle('customSelect__options--visible')
    document.querySelector('.customSelect--default').classList.toggle('customSelect--default--border')
    document.querySelector('.customSelect__arrow').classList.toggle('customSelect__arrow--rotate')
  })
}

const runScript = () => {
  fetchData()
  setData()
  getButton()
  // getCustomSelect()
}

window.addEventListener('load', runScript)