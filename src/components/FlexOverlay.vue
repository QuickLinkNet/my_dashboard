<template>
  <div class="overlay" v-if="props.isOpen">
    <div class="modal-content" @click.stop>
      <slot></slot>
      <button @click="$emit('close')">Schließen</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  isOpen: Boolean
});
</script>

<style lang="scss">

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($text-color, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background-color: $background;
    padding: 20px;
    border-radius: 5px;
    width: 80%;
    max-width: 600px;
    box-shadow: 0 4px 6px rgba($text-color, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;

    textarea {
      width: 100%;
      height: 200px;
      margin-bottom: 20px;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid darken($background, 10%);
      resize: none;
    }

    button {
      width: auto;
      padding: 10px 20px;
      margin: 0 5px;
    }
  }
}

</style>
