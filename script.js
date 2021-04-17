let productData

// Get data from .json
const fetchData = () => {
  fetch('./data/xbox.json')
  .then(res => res.json())
  .then(res => productData = res)
}

// Add event listener to button
const openModalEventListener = () => {
  const openButton = document.querySelector('#createPopup')
  openButton.addEventListener('click', createModal)
}

const createModal = () => {
  // Fill object with product data
  const productInfo = {
    images: [productData.product.icon, productData.product.firm.gfx],
    name: productData.product.name,
    sizes: {},
    variants: {}
  }
  fillSizes(productInfo)
  fillVariants(productInfo)

  // Overlay background on modalOpen
  const overlay = document.querySelector('.overlay')
  overlay.style.display = 'initial'

  // Clone modal template
  const template = document.querySelector('#popupBox')
  const clone = template.content.cloneNode(true)

  // Add event listener for dropdown
  const customSelect = clone.querySelector('.customSelect--default')
  customSelect.addEventListener('click', toggleDropdown)

  // Set product image source
  const productImage = clone.querySelector('#productImage')
  productImage.src = productInfo.images[0]

  // Add event listener to gallery arrows 
  const switchArrows = clone.querySelectorAll('.arrow')
  switchArrows.forEach(element => {
    element.addEventListener('click', (e) => switchImage(productInfo.images, element.id))
  })

  // Set product name
  const productName = clone.querySelector('#productName')
  productName.textContent = productData.product.name

  // Handle quantity change
  const quantity = clone.querySelectorAll('.quantity__operator')
  quantity.forEach(element => handleQuantityChange(element))

  // Create nodes with size options
  appendSizes(clone, productInfo)

  // Create nodes with variant options
  appendVariants(clone, productInfo)

  const submitButton = clone.querySelector('.addToCartButton')
  submitButton.addEventListener('click', handleSubmit)

  // Destroy modal on close
  const exitButton = clone.querySelector('#exitButton')
  exitButton.addEventListener('click', destroyModal)

  // Append above to body
  document.body.appendChild(clone)
}

// Destroy popup on exit
const destroyModal = () => {
  const overlay = document.querySelector('.overlay')
  overlay.style.display = 'none'

  const modal = document.querySelector('.popup')
  document.body.removeChild(modal)
}

// Switch product images
const switchImage = (images, arrow) => {
  const imageContainer = document.querySelector('#productImage')
  let arrayElement = images.indexOf(imageContainer.getAttribute('src'))
  if (arrow === 'arrowRightContainer') {
    arrayElement = (arrayElement === images.length - 1) ? 0 : arrayElement + 1
    imageContainer.src = images[arrayElement]
  } else {
    arrayElement = (arrayElement === 0) ? images.length - 1 : arrayElement - 1
    imageContainer.src = images[arrayElement]
  }
}

// Fill object with product sizes
const fillSizes = (productInfo) => {
  for (const [key, value] of Object.entries(productData.sizes.items)) {
    productInfo.sizes[key] = {
      name: value.name,
      description: value.description,
      amount: value.amount
    }
  }
}

// Create nodes for product sizes
const appendSizes = (clone, productInfo) => {
  const templateOption = document.querySelector('#option')
  const options = clone.querySelector('.productSize__options')

  let first = true
  for (const [key, value] of Object.entries(productInfo.sizes)) {
    const cloneOption = templateOption.content.cloneNode(true)
    cloneOption.querySelector('input').id = value.name
    cloneOption.querySelector('input').value = value.name
    cloneOption.querySelector('input').setAttribute('data-amount', value.amount)
    cloneOption.querySelector('label').setAttribute('for', value.name)
    cloneOption.querySelector('label').textContent = value.description
    if (first) {
      cloneOption.querySelector('input').checked = true
      cloneOption.querySelector('input').setAttribute('data-selected', true)
    }
    cloneOption.querySelector('input').addEventListener('click', handleSizeChange)
    options.appendChild(cloneOption)
    first = false
  }
}

// Fill object with product variants
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

// Create nodes for dropdown
const appendVariants = (clone, productInfo) => {
  const templateSelect = document.querySelector('#select')
  const options = clone.querySelector('.customSelect__options')

  const defaultSelect = clone.querySelector('#customSelect__defaultOption')
  defaultSelect.setAttribute('data-value', productInfo.variants[0].name)
  defaultSelect.textContent = productInfo.variants[0].name

  for (const [key, value] of Object.entries(productInfo.variants)) {
    const cloneOption = templateSelect.content.cloneNode(true)
    cloneOption.querySelector('span').setAttribute('data-value', value.name)
    cloneOption.querySelector('span').textContent = value.name
    cloneOption.querySelector('span').addEventListener('click', toggleDropdown)
    cloneOption.querySelector('span').addEventListener('click', handleOptionClick)
    options.appendChild(cloneOption)
  }
}

// Handle attributes when changing product size
const handleSizeChange = (e) => {
  const currentSelected = document.querySelector('.option__size[data-selected=true]')
  currentSelected.setAttribute('data-selected', false)

  const target = e.target
  target.setAttribute('data-selected', true)

  const quantity = document.querySelector('#quantity__number')
  quantity.value = 1
}


// Show/hide dropdown
const toggleDropdown = () => {
  document.querySelector('.customSelect__options').classList.toggle('customSelect__options--visible')
  document.querySelector('.customSelect--default').classList.toggle('customSelect--default--border')
  document.querySelector('.customSelect__arrow').classList.toggle('customSelect__arrow--rotate')
}

// Set attributes for selected dropdown option and display it for user
const handleOptionClick = (e) => {
  const selectedOption = e.target.getAttribute('data-value')
  const activeOption = document.querySelector('#customSelect__defaultOption')
  activeOption.setAttribute('data-value', selectedOption)
  activeOption.textContent = selectedOption
}

// Close dropdown when clicked outside of it
const outsideDropdownClick = () => {
  window.addEventListener('click', (e) => {
    const select = document.querySelector('.customSelect')
    if (!select.contains(e.target)) {
      document.querySelector('.customSelect__options').classList.remove('customSelect__options--visible')
      document.querySelector('.customSelect--default').classList.add('customSelect--default--border')
      document.querySelector('.customSelect__arrow').classList.remove('customSelect__arrow--rotate')
    }
  })
}

// Set value of quantity input
const handleQuantityChange = (element) => {
  element.addEventListener('click', (e) => {
    const quantityValue = document.querySelector('#quantity__number')
    
    if (e.target.classList.contains('operatorPlus')) {
      const selectedSize = document.querySelector('.option__size[data-selected=true]')
      const avaiableQuantity = selectedSize.getAttribute('data-amount')

      if (Number(quantityValue.value) < Number(avaiableQuantity)) {
        quantityValue.value = Number(quantityValue.value) + Number(1)
      }
    } else {
      if (quantityValue.value != 1) {
        quantityValue.value = Number(quantityValue.value) - Number(1)        
      }
    }
  })
}

const handleSubmit = (e) => {
  e.preventDefault()
  console.log('click')
}

const runScript = () => {
  fetchData()
  openModalEventListener()
  outsideDropdownClick()
}

window.addEventListener('load', runScript)