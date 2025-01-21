<script>
  import { DatePicker } from '@svelte-plugins/datepicker';
  import { Calendar, X } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';

  export let isRange = false;
  export let startDate = new Date();
  export let endDate = new Date();
  export let dateFormat = isRange ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: '2-digit', day: '2-digit', year: '2-digit' };

  let isOpen = false;
  let container;

  const formatDate = date => {
    return (date && new Intl.DateTimeFormat('default', dateFormat).format(new Date(date))) || '';
  };

  const onClearDates = e => {
    e.stopPropagation();
    startDate = '';
    endDate = '';
  };

  const toggleDatePicker = () => {
    isOpen = !isOpen;
    if (isOpen) {
      // Check position after datepicker opens
      setTimeout(checkPosition, 0);
    }
  };

  function checkPosition() {
    if (!container) return;
    const calendar = container.querySelector('.calendars-container');
    const input = container.querySelector('.flex.items-center');
    if (!calendar || !input) return;

    const inputRect = input.getBoundingClientRect();
    const calendarRect = calendar.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Position calendar relative to input
    calendar.style.position = 'fixed';
    calendar.style.top = `${inputRect.bottom + 5}px`;

    // Check horizontal positioning
    if (inputRect.left + calendarRect.width > window.innerWidth) {
      calendar.style.left = 'auto';
      calendar.style.right = `${window.innerWidth - inputRect.right}px`;
    } else {
      calendar.style.right = 'auto';
      calendar.style.left = `${inputRect.left}px`;
    }

    // Check vertical positioning
    if (inputRect.bottom + calendarRect.height > viewportHeight) {
      calendar.style.top = 'auto';
      calendar.style.bottom = `${viewportHeight - inputRect.top + 5}px`;
    }
  }

  onMount(() => {
    window.addEventListener('resize', checkPosition);
  });

  onDestroy(() => {
    window.removeEventListener('resize', checkPosition);
  });

  $: formattedStartDate = formatDate(startDate);
  $: formattedEndDate = isRange ? formatDate(endDate) : '';
</script>

{#if isRange}
  <div class="flex flex-row items-center space-x-2 w-full" bind:this={container}>
    <DatePicker theme="custom-datepicker" bind:isOpen bind:startDate bind:endDate {isRange} isMultipane={isRange} enableFutureDates={true} includeFont={false}>
      <div class="flex items-center">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindexsvelte -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="flex items-center px-2 py-1 border rounded border-accents-300 bg-accents-200 w-full cursor-pointer" on:click={toggleDatePicker} class:open={isOpen}>
          <Calendar class="mr-2" />
          <div class="date text-sm w-full">
            {#if startDate}
              {formattedStartDate} - {formattedEndDate}
            {:else}
              Pick a date
            {/if}
          </div>
          {#if startDate}
            <span class="ml-2 text-accents-500 hover:text-accents-800" on:click={onClearDates}>
              <X />
            </span>
          {/if}
        </div>
      </div>
    </DatePicker>
  </div>
{:else}
  <div class="flex flex-row items-center space-x-2 w-full" bind:this={container}>
    <DatePicker theme="custom-datepicker" bind:isOpen bind:startDate {isRange} isMultipane={isRange} enableFutureDates={true} includeFont={false}>
      <div class="flex items-center">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindexsvelte -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="flex items-center px-2 py-1 border rounded border-accents-300 bg-accents-200 w-full cursor-pointer" on:click={toggleDatePicker} class:open={isOpen}>
          <Calendar class="mr-2" />
          <div class="date text-sm w-full">
            {#if startDate}
              {formattedStartDate}
            {:else}
              Pick a date
            {/if}
          </div>
          {#if startDate}
            <span class="ml-2 text-accents-500 hover:text-accents-800" on:click={onClearDates}>
              <X />
            </span>
          {/if}
        </div>
      </div>
    </DatePicker>
  </div>
  <!-- <div bind:this={container}>
    <DatePicker theme="custom-datepicker" bind:isOpen bind:startDate includeFont={false}>
      <input type="text" placeholder="Select date" bind:value={formattedStartDate} on:click={toggleDatePicker} enableFutureDates={true} />
    </DatePicker>
  </div> -->
{/if}

<style lang="postcss">
  :global(.datepicker) {
    @apply w-full;
  }
  :global(.datepicker[data-picker-theme='custom-datepicker']) {
    width: 100%;
    --datepicker-container-background: var(--accents-300);
    --datepicker-container-border: var(--accents-400);

    --datepicker-calendar-day-container-background: var(--accents-300);
    --datepicker-calendar-header-text-color: var(--accents-800);
    --datepicker-calendar-dow-color: var(--accents-800);
    --datepicker-calendar-day-color: var(--accents-800);
    --datepicker-calendar-day-color-disabled: var(--accents-500);
    --datepicker-calendar-range-selected-background: var(--accents-400);

    --datepicker-calendar-header-month-nav-background-hover: var(--main-400);
    --datepicker-calendar-header-month-nav-icon-next-filter: invert(100);
    --datepicker-calendar-header-month-nav-icon-prev-filter: invert(100);
    --datepicker-calendar-header-year-nav-icon-next-filter: invert(100);
    --datepicker-calendar-header-year-nav-icon-prev-filter: invert(100);

    --datepicker-calendar-split-border: var(--accents-700);
  }

  :global(.calendars-container) {
    @apply z-50 transition-[right,left,top,bottom];
  }
</style>
