<script>
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let image;
  let imageFile;
  let imageUrl;
  let fileInput;
  let id = Math.random().toString(36).substring(7);

  $: imageUrl = image?.url;

  function handleDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      imageFile = files[0];
      updateImagePreview();
      dispatch('fileSelected', imageFile);
    }
  }

  const deleteImage = () => {
    imageUrl = null;
    image = null;
    dispatch('fileSelected', null);
  };

  async function handleFileChange(event) {
    imageFile = event.target.files[0];
    if (imageFile) {
      updateImagePreview();
      dispatch('fileSelected', imageFile);
    }
  }

  function updateImagePreview() {
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }
  }
</script>

<div class="flex items-center justify-center w-full mt-4" on:drop|preventDefault={handleDrop} on:dragover|preventDefault>
  <input {id} type="file" on:change={handleFileChange} hidden bind:this={fileInput} accept="image/*" />
  {#if imageUrl}
    <div class="relative">
      <button on:click={deleteImage} style="background-color:var(--accents-50);opacity:0.8;" type="button" class="rounded-md border-2 border-accents-200 absolute right-3 top-3 text-accents-400 hover:text-red-600">
        <span class="sr-only">Close</span>
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img on:click={() => fileInput.click()} class="cursor-pointer rounded-md" src={imageUrl} alt="Preview" />
    </div>
  {:else}
    <label for={id} class="flex flex-col items-center justify-center w-full h-32 border-2 border-accents-300 border-dashed rounded-lg cursor-pointer bg-accents-50 hover:bg-accents-100">
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <Icon icon="upload" class="h8 w-8 mb-4" />
        <p class="mb-2 text-sm text-accents-700"><span class="font-semibold">Click to upload</span> or drag and drop</p>
        <p class="text-xs text-accents-700">PNG, JPG, HEIC</p>
      </div>
    </label>
  {/if}
</div>
