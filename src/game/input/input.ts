export class InputManager{
  buffer = ''
  onKey: (buffer: string) => void = ()=>{}
  onCommit: (value: string) => void = ()=>{}

  constructor(){
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Backspace'){
        this.buffer = this.buffer.slice(0,-1)
        this.onKey(this.buffer)
        e.preventDefault()
        return
      }
      if(e.key.length === 1 && !e.ctrlKey && !e.metaKey){
        this.buffer += e.key.toLowerCase()
        this.onKey(this.buffer)
        // Auto-commit after each keystroke
        this.onCommit(this.buffer)
      }
    })
  }
}
