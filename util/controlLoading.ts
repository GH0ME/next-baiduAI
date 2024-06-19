const startLoading = ()=>{
  const loadElement = document.getElementsByClassName('loading')[0]
  loadElement.classList.add('hidden-loading')
}

const stopLoading = ()=>{
  const darkTheme = localStorage.getItem('theme')==='dark'
  const mainBox = document.getElementsByTagName('main')[0]
  const loadElement = document.getElementsByClassName('loading')[0]
  loadElement.classList.remove('hidden-loading')
  mainBox.style.backgroundColor = darkTheme?"#6b6b6b":"#ffffff"
}

export {startLoading,stopLoading}