<script>
  import PermissionLink from '@/lib/components/PermissionLink.svelte';
  import Blob from './Blob.svelte';
</script>

<PermissionLink href="/">
  <div class="flex items-center">
    <div style="width:50px;height:50px;">
      <Blob width="40px" height="40px" />
    </div>
    <div class="-ml-8 text-accents-900 font-extrabold text-2xl">
      State<span class="text-main-400">ly</span>
    </div>
  </div>
</PermissionLink>
