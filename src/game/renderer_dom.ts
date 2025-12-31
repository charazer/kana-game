export class DOMRenderer{
  container: HTMLElement
  constructor(container: HTMLElement){
    this.container = container
  }

  createTokenEl(id: string, kana: string){
    const el = document.createElement('div')
    el.className = 'token'
    el.dataset.kanaId = id
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
    el.classList.add(success ? 'token-success' : 'token-miss')
  }

  showFloatingText(x: number, y: number, text: string, type: 'points' | 'combo' | 'life' | 'speed'){
    const floater = document.createElement('div')
    floater.className = `floating-text floating-${type}`
    floater.textContent = text
    floater.style.left = `${x}px`
    floater.style.top = `${y}px`
    this.container.appendChild(floater)
    
    setTimeout(() => floater.remove(), 1000)
  }

  getWidth(){
    return this.container.clientWidth
  }

  getHeight(){
    return this.container.clientHeight
  }
}
