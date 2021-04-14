const toggleDropdown = () => {
  const form = document.querySelector('.form__productVariant')
  const aaa = document.querySelector('.customSelect--default')
  form.addEventListener('click', () => {
    document.querySelector('.customSelect__options').classList.toggle('customSelect__options--visible')
    document.querySelector('.customSelect--default').classList.toggle('customSelect--default--border')
    // console.log('clicked')
  })
}

window.addEventListener('load', toggleDropdown)
