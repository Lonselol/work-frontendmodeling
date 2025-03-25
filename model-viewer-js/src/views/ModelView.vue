<script setup>
import '@google/model-viewer'
import { ref, onMounted } from 'vue'
import { sendRequest } from '../services/api'

const props = defineProps({
  model: String,
  name: String
})

const modelViewerRef = ref(null)
const materials = ref([])
const modelLoaded = ref(false)

const onModelLoad = async () => {
  const modelViewer = modelViewerRef.value
  if (modelViewer && modelViewer.model) {
    materials.value = modelViewer.model.materials
    console.log(materials.value)
    try{
    const materialData = await sendRequest('getModelState')
    console.log(materialData)
    materialData.forEach((item,index) => {
      const materialName = Object.keys(item)[0];
      const material = materials.value.find((m) => m.name === materialName);
      const percent = item[materialName];
      const color = calculateColor(percent);
      console.log(color);
      material.pbrMetallicRoughness.setBaseColorFactor(color);
    });
    } catch (error) {
      console.error('Error fetching material wear data:', error)
    }
  modelLoaded.value = true
  }
}

const toggleVisibility = (index) => {
  const material = materials.value[index]
  material.setAlphaMode("BLEND");
  const currentAlpha = material.pbrMetallicRoughness.baseColorFactor[3]
  const color = material.pbrMetallicRoughness.baseColorFactor
  color[3] = currentAlpha === 1 ? 0 : 1
  material.pbrMetallicRoughness.setBaseColorFactor(color)
  console.log(material.pbrMetallicRoughness.baseColorFactor[3])
}

const getColor = (index) => {
  const material = materials.value[index]
  return material.pbrMetallicRoughness.baseColorFactor
}

const calculateColor = (percent=0, currentAlpha=1) => {
  const red = Math.min(255, (percent * 2.55))
  const green = 255 - red
  const blue = 0
  const alpha = currentAlpha
  return [red / 255, green / 255, blue / 255, alpha]
}
</script>

<template>
  <div class="container">
    <div class="sidebar">
      <div v-if="modelLoaded">
        <h3>Детали модели:</h3>
        <ul>
          <li v-for="(item, index) in materials" :key="item.name">
            <label>
              <input 
                type="checkbox" 
                :checked="item.pbrMetallicRoughness.baseColorFactor[3] === 1" 
                @change="toggleVisibility(index)" 
              />
              {{ item.name }}
            </label>
          </li>
        </ul>
      </div>
    </div>

    <div class="model-container">
      <model-viewer
        ref="modelViewerRef"
        :src="props.model"
        camera-controls="true"
        :alt="props.name"
        interaction-prompt="when-focused"
        style="width: 100%; height: 100%"
        @load="onModelLoad"
      ></model-viewer>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 300px;
  background-color: #2d2d2d;
  color: white;
  padding: 20px;
  overflow-y: auto;
  max-height: 100vh;
}

.model-container {
  flex: 1;
  background-color: #000;
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
}

h3 {
  margin-top: 0;
}

.read-the-docs {
  color: #888;
}
</style>