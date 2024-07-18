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


// open for business
const circleWrapper = document.querySelector('#circle-wrapper');

window.addEventListener("DOMContentLoaded", function(){
  circleWrapper?.classList.add('active');
})

window.addEventListener('scroll', function() {
  let scrollTop = window.scrollY || document.documentElement.scrollTop;
  
  if (scrollTop > 500) {
    circleWrapper?.classList.remove('active');
  }

  if (scrollTop <= 10) {
    circleWrapper?.classList.add('active');
  }
});