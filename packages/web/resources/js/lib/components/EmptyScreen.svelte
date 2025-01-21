<script>
  export let iconName = 'new-document';
  export let title = 'No Surveys';
  export let description = 'Get started by creating a new survey.';
  export let fullScreen = false;
  import Icon from '@/lib/components/Icon.svelte';
</script>

<div class={`flex justify-center items-center ${fullScreen ? 'h-screen' : 'h-full flex-grow'}`}>
  <div class="text-center flex-1">
    <div class="flex mb-3 h-12 mx-auto w-full justify-center">
      <Icon class="flex h-12 w-12" icon={iconName} />
    </div>
    <h3 class="mt-2 text-2xl font-semibold text-accents-800">{title}</h3>
    <p class="mt-1 text-accents-700">{description}</p>
    <div class="mt-6">
      <slot name="action"></slot>
    </div>
  </div>
</div>
