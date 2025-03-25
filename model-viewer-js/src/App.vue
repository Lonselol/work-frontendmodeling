<script setup>
import ModelView from './views/ModelView.vue';
import { getModel } from './services/params'

const modelData = getModel();
</script>

<template>
  <ModelView 
    :model="modelData.model" 
    :name="modelData.name"
  />
</template>

<style scoped>
</style>
