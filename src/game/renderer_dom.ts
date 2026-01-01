import {
  type FloatingTextType,
  CSS_CLASS_TOKEN,
  CSS_CLASS_TOKEN_SUCCESS,
  CSS_CLASS_TOKEN_MISS,
  CSS_CLASS_FLOATING_TEXT,
  DATASET_KANA_ID,
  ANIM_DURATION_FLOATING_TEXT
} from './constants'

export class DOMRenderer{
  container: HTMLElement
  constructor(container: HTMLElement){
    this.container = container
  }

  createTokenEl(id: string, kana: string){
    const el = document.createElement('div')
    el.className = CSS_CLASS_TOKEN
    el.dataset[DATASET_KANA_ID] = id
    el.textContent = kana
    this.container.appendChild(el)
    return el
  }

  removeTokenEl(el: HTMLElement){
    el.remove()
  }

  setTokenPosition(el: HTMLElement, x:number, y:number){
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  flashToken(el: HTMLElement, success: boolean){
    el.classList.add(success ? CSS_CLASS_TOKEN_SUCCESS : CSS_CLASS_TOKEN_MISS)
  }

  showFloatingText(x: number, y: number, text: string, type: FloatingTextType){
    const floater = document.createElement('div')
    floater.className = `${CSS_CLASS_FLOATING_TEXT} floating-${type}`
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
