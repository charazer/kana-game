<script lang="ts">
  interface Props {
    inputEcho: string
    mobileInputEl?: HTMLInputElement
  }

  let { inputEcho, mobileInputEl = $bindable() }: Props = $props()
</script>

<footer>
  <div id="input-display">
    <label for="input-echo">Your input:</label>
    <input
      bind:this={mobileInputEl}
      id="mobile-input"
      type="text"
      inputmode="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck={false}
      aria-label="Type romaji here"
      tabindex="-1"
    />
    <div id="input-echo" role="status" aria-live="polite">{inputEcho}</div>
  </div>
</footer>
