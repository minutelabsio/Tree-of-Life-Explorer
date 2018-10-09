const docEl = document.documentElement

export const canFullscreen = (function(){
  return docEl.requestFullscreen ||
    docEl.webkitRequestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.msRequestFullscreen
})()

export function requestFullscreen( el ){
  if (el.requestFullscreen) {
    return el.requestFullscreen()
  } else if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen()
  } else if (el.mozRequestFullScreen) {
    return el.mozRequestFullScreen()
  } else if (el.msRequestFullscreen) {
    return el.msRequestFullscreen()
  }
}

export function exitFullscreen(){
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

export function getFullscreenEl(){
  return document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
}
