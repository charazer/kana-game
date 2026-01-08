import {
  type FloatingTextType,
  DATASET_KANA_ID,
  ANIM_DURATION_FLOATING_TEXT
} from '../constants/constants'

export class DOMRenderer{
  container: HTMLElement
  constructor(container: HTMLElement){
    this.container = container
  }

  createTokenEl(id: string, kana: string){
    const el = document.createElement('div')
    el.className = 'token'
    el.dataset[DATASET_KANA_ID] = id
    el.textContent = kana
    // Initialize position custom properties for animation continuity
    el.style.setProperty('--tx', '0px')
    el.style.setProperty('--ty', '0px')
    this.container.appendChild(el)
    return el
  }

  removeTokenEl(el: HTMLElement){
    el.remove()
  }

  setTokenPosition(el: HTMLElement, x:number, y:number){
    // Store position as CSS custom properties for animation continuity
    el.style.setProperty('--tx', `${x}px`)
    el.style.setProperty('--ty', `${y}px`)
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  flashToken(el: HTMLElement, success: boolean){
    const className = success ? 'token-success' : 'token-miss'
    el.classList.add(className)
    
    // Use animation end event for immediate removal
    const animationEndHandler = () => {
      el.remove()
    }
    el.addEventListener('animationend', animationEndHandler, { once: true })
  }

  showFloatingText(x: number, y: number, text: string, type: FloatingTextType){
    const floater = document.createElement('div')
    floater.className = `floating-text floating-${type}`
    floater.textContent = text
    floater.style.left = `${x}px`
    floater.style.top = `${y}px`
    this.container.appendChild(floater)
    
    setTimeout(() => floater.remove(), ANIM_DURATION_FLOATING_TEXT)
  }

  getWidth(){
    return this.container.clientWidth
  }

  getHeight(){
    return this.container.clientHeight
  }
}
