<script setup>
import '@google/model-viewer'
import { ref, onMounted } from 'vue'
import { getModelStats } from '../services/params'

const props = defineProps({
  model: String,
  name: String
})

const modelViewerRef = ref(null)
const materials = ref([])
const nodes = ref([])
const modelLoaded = ref(false)

const onModelLoad = async () => {
  const modelViewer = modelViewerRef.value
  if (modelViewer && modelViewer.model) {
    materials.value = modelViewer.model.materials
    nodes.value = modelViewer.model[Object.getOwnPropertySymbols(modelViewer.model).find(sym => sym.description === 'hierarchy')];
    const nodesData = getModelStats()
    nodesData.forEach((item,index) => {
      
      const nodeName = Object.keys(item)[0];

      const currentNode = nodes.value.find((n) => n.name === nodeName);

      const percent = item[nodeName];

      const color = calculateColor(percent);

      const currentNodeMaterials = currentNode.materials

      currentNodeMaterials.forEach((currentMaterial, key) => {
        currentMaterial.pbrMetallicRoughness.setBaseColorFactor(color);
      });

    });
  modelLoaded.value = true
  }
}

const toggleVisibility = (nodeName) => {
  const currentNode = nodes.value.find((n) => n.name === nodeName);
  const currentNodeMaterials = currentNode.materials
  if (currentNodeMaterials) {
    currentNodeMaterials.forEach(currentNodeMaterial => {
    currentNodeMaterial.setAlphaMode("BLEND");
    const currentAlpha = currentNodeMaterial.pbrMetallicRoughness.baseColorFactor[3]
    const color = currentNodeMaterial.pbrMetallicRoughness.baseColorFactor
    color[3] = currentAlpha === 1 ? 0 : 1
    currentNodeMaterial.pbrMetallicRoughness.setBaseColorFactor(color)
  });
  }
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

const hasMaterials = (node) => {
  const materials = node.materials
  return node.materials;
};

const isNodeVisible = (node) => {
  if (!hasMaterials(node)) return false;
  return Array.from(node.materials.values()).every(material => {
    return material.pbrMetallicRoughness?.baseColorFactor?.[3] === 1;
  });
};
</script>

<template>
  <div class="container">
    <div class="sidebar">
      <div v-if="modelLoaded">
        <h3>Детали модели:</h3>
        <ul>
          <li v-for="(item, index) in nodes" :key="item.name">
            <template v-if="hasMaterials(item)">
              <label>
                <input 
                  type="checkbox" 
                  :checked="isNodeVisible(item)"
                  @change="toggleVisibility(item.name)" 
                />
                {{ item.name }}
              </label>
            </template>
            <template v-else>
              <span class="no-materials">{{ item.name }} (нет материалов)</span>
            </template>
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