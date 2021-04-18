const runScript = async () => {
  const productInfo = await fetchData()
  const openButton = document.querySelector('#createPopup')
  openButton.addEventListener('click', (e) => createModal(productInfo))

  window.addEventListener('click', (e) => {
    const select = document.querySelector('.customSelect')
    if (!select.contains(e.target)) {
      document.querySelector('.customSelect__options').classList.remove('customSelect__options--visible')
      document.querySelector('.customSelect--default').classList.add('customSelect--default--border')
      document.querySelector('.customSelect__arrow').classList.remove('customSelect__arrow--rotate')
    }
  })
}

window.addEventListener('load', runScript)

function parseProductData(productData) {
  // Create productInfo object
  const productInfo = {
    images: [productData.product.icon, productData.product.firm.gfx],
    product_id: productData.product.id,
    name: productData.product.name,
    sizes: {},
    variants: {}
  }

  // Fill sizes
  for (const [key, value] of Object.entries(productData.sizes.items)) {
    productInfo.sizes[key] = {
      name: value.name,
      description: value.description,
      amount: value.amount
    }
  }

  // Fill variants
  for (const [key, value] of Object.entries(productData.multiversions[0].items)) {
    productInfo.variants[key] = {
      product_id: value.products[0].product_id,
      value_id: value.values_id,
      name: {}
    }
    productInfo.variants[key].name = value.values[productInfo.variants[key].value_id].name
  }

  return productInfo
}

// Get data from .json
async function fetchData() {
  const response = await fetch('./data/xbox.json')
  const data = await response.json()

  const parsedData = parseProductData(data)

  return parsedData
}

function createFormData(productInfo) {
  const formData = new FormData()
  formData.set('product_id', productInfo.product_id)
  formData.set('product_name', productInfo.name)
  formData.set('product_quantity', 1)

  return formData
}

function showPageOverlay() {
  const overlay = document.querySelector('.overlay')
  overlay.style.display = 'block'
}

function hidePageOverlay() {
  const overlay = document.querySelector('.overlay')
  overlay.style.display = 'none'
}

function createModal(productInfo) {
  // Create FormData object and set default values
  const formData = createFormData(productInfo)

  showPageOverlay()

  // Clone modal template
  const productModal = document.querySelector('#popupBox').content.cloneNode(true)

  // Add event listener for dropdown
  const customSelect = productModal.querySelector('.customSelect--default')
  customSelect.addEventListener('click', toggleDropdown)

  // Set product image source
  const productImage = productModal.querySelector('#productImage')
  productImage.src = productInfo.images[0]

  // Add event listener to gallery arrows 
  const switchArrows = productModal.querySelectorAll('.arrow')
  switchArrows.forEach(element => {
    element.addEventListener('click', (e) => switchImage(productImage, productInfo.images, element.id))
  })

  // Set product name
  const productName = productModal.querySelector('#productName')
  productName.textContent = productInfo.name

  // Handle quantity PLUS change
  const quantityPlus = productModal.querySelector('.operatorPlus')
  quantityPlus.addEventListener('click', (e) => handleQuantityPlus(formData))

  // Handle quantity MINUS change
  const quantityMinus = productModal.querySelector('.operatorMinus')
  quantityMinus.addEventListener('click', (e) => handleQuantityMinus(formData))

  // Create nodes with size options
  appendSizesToProductModal(productModal, productInfo, formData)

  // Create nodes with variant options
  appendVariantsToProductModal(productModal, productInfo, formData)

  const submitButton = productModal.querySelector('.addToCartButton')
  submitButton.addEventListener('click', (e) => handleSubmit(e, formData))

  // Destroy modal on close
  const exitButton = productModal.querySelector('#exitButton')
  exitButton.addEventListener('click', destroyModal)
  const mobileExitButton = productModal.querySelector('#mobileExitButton')
  mobileExitButton.addEventListener('click', destroyModal)

  // Append above to body
  document.body.appendChild(productModal)
}

// Destroy popup on exit
function destroyModal() {
  hidePageOverlay()

  const modal = document.querySelector('.popup')
  document.body.removeChild(modal)
}

// Switch product images
function switchImage(imageContainer, images, arrow) {
  let arrayElement = images.indexOf(imageContainer.getAttribute('src'))
  if (arrow === 'rightArrow') {
    arrayElement = (arrayElement === images.length - 1) ? 0 : arrayElement + 1
    imageContainer.src = images[arrayElement]
    imageContainer.classList.toggle('gallery__animation-2')
    imageContainer.classList.toggle('gallery__animation-1')

  } else {
    arrayElement = (arrayElement === 0) ? images.length - 1 : arrayElement - 1
    imageContainer.src = images[arrayElement]
    imageContainer.classList.toggle('gallery__animation-2')
    imageContainer.classList.toggle('gallery__animation-1')
  }
}

// Create nodes for product sizes
function appendSizesToProductModal(clone, productInfo, formData) {
  const templateOption = document.querySelector('#option')
  const options = clone.querySelector('.productSize__options')

  let first = true
  for (const [key, value] of Object.entries(productInfo.sizes)) {
    const cloneOption = templateOption.content.cloneNode(true)
    const cloneInput = cloneOption.querySelector('input')
    const cloneLabel = cloneOption.querySelector('label')
    
    cloneInput.id = value.name
    cloneInput.value = value.name
    cloneInput.setAttribute('data-amount', value.amount)
    cloneLabel.setAttribute('for', value.name)
    cloneLabel.textContent = value.description
    if (first) {
      cloneInput.checked = true
      options.setAttribute('data-selected', value.name)
      formData.set('product_size', value.name)
    }
    cloneInput.addEventListener('click', (e) => handleSizeChange(e, formData))
    options.appendChild(cloneOption)
    first = false
  }
}

// Create nodes for dropdown
function appendVariantsToProductModal(clone, productInfo, formData) {
  const templateSelect = document.querySelector('#select')
  const options = clone.querySelector('.customSelect__options')

  const defaultSelect = clone.querySelector('#customSelect__defaultOption')
  defaultSelect.setAttribute('data-value', productInfo.variants[0].name)
  defaultSelect.textContent = productInfo.variants[0].name
  formData.set('product_variant', productInfo.variants[0].name) 

  for (const [key, value] of Object.entries(productInfo.variants)) {
    const cloneOption = templateSelect.content.cloneNode(true)
    const cloneSpan = cloneOption.querySelector('span')

    cloneSpan.setAttribute('data-value', value.name)
    cloneSpan.textContent = value.name
    cloneSpan.addEventListener('click', (e) => toggleDropdown(options))
    cloneSpan.addEventListener('click', (e) => handleOptionClick(e, formData))
    options.appendChild(cloneOption)
  }
}

// Handle attributes when changing product size
function handleSizeChange(e, formData) {
  const target = e.target

  const currentSelected = target.parentNode.parentElement.setAttribute('data-selected', target.id)

  formData.set('product_size', currentSelected)

  const quantity = document.querySelector('#quantity__number')
  quantity.value = 1
}


// Show/hide dropdown
function toggleDropdown(options) {
  document.querySelector('.customSelect__options').classList.toggle('customSelect__options--visible')
  // options.classList.toggle('customSelect__options--visible')
  document.querySelector('.customSelect--default').classList.toggle('customSelect--default--border')
  document.querySelector('.customSelect__arrow').classList.toggle('customSelect__arrow--rotate')
}

// Set attributes for selected dropdown option and display it for user
function handleOptionClick(e, formData) {
  const selectedOption = e.target.getAttribute('data-value')
  const activeOption = document.querySelector('#customSelect__defaultOption')
  activeOption.setAttribute('data-value', selectedOption)
  activeOption.textContent = selectedOption

  formData.set('product_variant', activeOption.getAttribute('data-value'))
}

// Set value of quantity input - PLUS operator
function handleQuantityPlus(formData) {
  const quantityValue = document.querySelector('#quantity__number')
  const selectedSize = document.querySelector('.option__size[data-selected=true]')
  const avaiableQuantity = selectedSize.getAttribute('data-amount')

  if (Number(quantityValue.value) < Number(avaiableQuantity)) {
    quantityValue.value = Number(quantityValue.value) + Number(1)
  }

  formData.set('product_quantity', quantityValue.value)
}

// Set value of quantity input - MINUS operator
function handleQuantityMinus(formData) {
  const quantityValue = document.querySelector('#quantity__number')
  const selectedSize = document.querySelector('.option__size[data-selected=true]')
  const avaiableQuantity = selectedSize.getAttribute('data-amount')

  if (quantityValue.value != 1) {
    quantityValue.value = Number(quantityValue.value) - Number(1)
  }

  formData.set('product_quantity', quantityValue.value)
}

function showSuccessBox() {
  // Close popup
  destroyModal()

  const template = document.querySelector('#infoBox-template')
  const clone = template.content.cloneNode(true)

  const infoBox = clone.querySelector('.infoBox')
  infoBox.classList.add('successBox')
  infoBox.textContent = 'Produkt dodano do koszyka.'
  document.body.appendChild(clone)

  // Wait before animation-out
  setTimeout(function() {
    infoBox.classList.remove('successBox')
  }, 5000);

  // Destroy div
  infoBox.remove()
}

function showFailureBox() {
  // Close popup
  destroyModal()

  const template = document.querySelector('#infoBox-template')
  const clone = template.content.cloneNode(true)

  const infoBox = clone.querySelector('.infoBox')
  infoBox.classList.add('failureBox')
  infoBox.textContent = 'Coś poszło nie tak. Spróbuj ponownie.'
  document.body.appendChild(clone)

  // Wait before animation-out
  setTimeout(function() {
    infoBox.classList.remove('failureBox')
  }, 5000);

  // Destroy div
  infoBox.remove()
}

function handleSubmit(e, formData) {
  e.preventDefault()
  
  // POST formData
  // fetch('/api/postForm', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(formData)
  // })
  // .then(res => res.json())
  // .then(showSuccessBox())
  // .catch((error) => {
  //   showFailureBox()
  // })
}
