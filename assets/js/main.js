// Menu
const menuMobile = document.querySelector('.menu-mobile')
const menuBtn = document.querySelector('.menu-btn')
const menuClose = document.querySelector('.menu-btn_close')
menuClose.addEventListener('click', function(){
  menuMobile.classList.toggle('active')
})
menuBtn.addEventListener('click', function(){
  menuMobile.classList.toggle('active')
})