const startLoading = ()=>{
  const loadElement = document.getElementsByClassName('loading')[0]
  loadElement.classList.add('hidden-loading')
  console.log('Routing');
}

const stopLoading = ()=>{
  const loadElement = document.getElementsByClassName('loading')[0]
  loadElement.classList.remove('hidden-loading')
  console.log('Routing completed');
}

export {startLoading,stopLoading}