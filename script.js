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

const switchImage = (images, arrow) => {
  const imageContainer = document.querySelector('#productImage')
  let arrayElement = images.indexOf(imageContainer.getAttribute('src'))
  if (arrow === 'arrowRightContainer') {
    arrayElement++
    if (arrayElement === images.length) arrayElement = 0
    imageContainer.src = images[arrayElement]
  } else {
    arrayElement--
    if (arrayElement < 0) arrayElement = images.length - 1
    imageContainer.src = images[arrayElement]
  }
}

const getButton = () => {
  openButton = document.querySelector('#createPopup')
  openButton.addEventListener('click', createModal)
}


const fillSizes = (productInfo) => {
  for (const [key, value] of Object.entries(productData.sizes.items)) {
    productInfo.sizes[key] = {
      name: value.name,
      description: value.description,
      amount: value.amount
    }
  }
}

const fillVariants = (productInfo) => {
  for (const [key, value] of Object.entries(productData.multiversions[0].items)) {
    productInfo.variants[key] = {
      product_id: value.products[0].product_id,
      value_id: value.values_id,
      name: {}
    }
    productInfo.variants[key].name = value.values[productInfo.variants[key].value_id].name
  }
}

const appendSizes = (clone, productInfo) => {
  const templateOption = document.querySelector('#option')
  const options = clone.querySelector('.productSize__options')

  for (const [key, value] of Object.entries(productInfo.sizes)) {
    const cloneOption = templateOption.content.cloneNode(true)
    cloneOption.querySelector('input').id = value.name
    cloneOption.querySelector('input').value = value.name
    cloneOption.querySelector('label').setAttribute('for', value.name)
    cloneOption.querySelector('label').textContent = value.description
    options.appendChild(cloneOption)
  }
}

const appendVariants = (clone, productInfo) => {
  const templateSelect = document.querySelector('#select')
  const options = clone.querySelector('.customSelect__options')

  const defaultSelect = clone.querySelector('#customSelect__defaultOption')
  // console.log(defaultSelect)
  defaultSelect.setAttribute('data-value', productInfo.variants[0].name)
  defaultSelect.textContent = productInfo.variants[0].name

  for (const [key, value] of Object.entries(productInfo.variants)) {
    const cloneOption = templateSelect.content.cloneNode(true)
    cloneOption.querySelector('span').setAttribute('data-value', value.name)
    cloneOption.querySelector('span').textContent = value.name
    options.appendChild(cloneOption)
  }
}

const createModal = () => {
  const productInfo = {
    images: [productData.product.icon, productData.product.firm.gfx],
    name: productData.product.name,
    sizes: {},
    variants: {}
  }

  fillSizes(productInfo)
  fillVariants(productInfo)

  console.log(productInfo)

  const overlay = document.querySelector('.overlay')
  overlay.style.display = 'initial'

  const template = document.querySelector('#popupBox')
  const clone = template.content.cloneNode(true)

  const customSelect = clone.querySelector('.customSelect')
  customSelect.addEventListener('click', toggleDropdown)

  const productImage = clone.querySelector('#productImage')
  productImage.src = productInfo.images[0]

  const switchArrows = clone.querySelectorAll('.popup__gallery__arrow')
  switchArrows.forEach(element => {
    element.addEventListener('click', (e) => switchImage(productInfo.images, element.id))
  })

  const productName = clone.querySelector('#productName')
  productName.textContent = productData.product.name

  appendSizes(clone, productInfo)
  appendVariants(clone, productInfo)

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
}

window.addEventListener('load', runScript)