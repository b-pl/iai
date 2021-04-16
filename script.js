const toggleDropdown = () => {
  const form = document.querySelector('.form__productVariant')
  form.addEventListener('click', () => {
    document.querySelector('.customSelect__options').classList.toggle('customSelect__options--visible')
    document.querySelector('.customSelect--default').classList.toggle('customSelect--default--border')
    document.querySelector('.customSelect__arrow').classList.toggle('customSelect__arrow--rotate')
  })
}

window.addEventListener('load', toggleDropdown)
