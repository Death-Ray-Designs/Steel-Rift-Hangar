<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import ArmyPrintRefContent from './ArmyPrintRefContent.vue';

let style: HTMLStyleElement;

onMounted(() => {
  style = document.createElement('style');
  style.textContent = `
  @page {
  size: portrait;
  margin: 0.5in;
  padding: 0.5in;
}

@media print {
  html body {
    width: auto !important;
    height: auto !important;
  }

  .page-army-reference {
    padding: 0 !important;
    width: auto;
  }

  .page-preview.page-letter-width {
    width: auto !important;
  }
}
`;
  document.head.appendChild(style);
});

onUnmounted(() => {
  if (style) {
    style.remove();
  }
});
</script>
<template>

  <div class="page-preview page-letter-width"
       style="background-color:white">
    <ArmyPrintRefContent />
  </div>

</template>
