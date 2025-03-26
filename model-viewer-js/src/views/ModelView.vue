<script setup>
import '@google/model-viewer'
import { ref, onMounted, computed } from 'vue'
import { getModelStats } from '../services/params'

const props = defineProps({
  model: String,
  name: String
})

const modelViewerRef = ref(null)
const materials = ref([])
const nodes = ref([])
const modelLoaded = ref(false)

// Получение данных по состоянию деталей
const nodesWithStats = computed(() => {
  if (!nodes.value.length) return []
  return getModelStats().map(item => {
    const nodeName = Object.keys(item)[0]
    return { nodeName, percent: item[nodeName] }
  })
})

// Подгрузка списка деталей и материалов модели
const loadModelData = () => {
  const modelViewer = modelViewerRef.value
  if (!modelViewer?.model) return
  
  materials.value = modelViewer.model.materials
  const hierarchySymbol = Object.getOwnPropertySymbols(modelViewer.model).find(sym => sym.description === 'hierarchy')
  nodes.value = modelViewer.model[hierarchySymbol] || []
}

// Подкраска деталей в зависимости от состояния
const applyColorToNodes = () => {
  nodesWithStats.value.forEach(({ nodeName, percent }) => {
    const currentNode = nodes.value.find(n => n.name === nodeName)
    if (!currentNode?.materials) return
    
    const color = calculateColor(percent)
    currentNode.materials.forEach(material => {
      material.pbrMetallicRoughness?.setBaseColorFactor(color)
    })
  })
}

// После полной загрузки модели
const onModelLoad = async () => {
  loadModelData()
  applyColorToNodes()
  modelLoaded.value = true
}

// Видимость детали
const toggleNodeVisibility = (node) => {
  if (!hasMaterials(node)) return
  node.materials.forEach(material => {
    material.setAlphaMode("BLEND")
    const color = material.pbrMetallicRoughness.baseColorFactor
    color[3] = color[3] === 1 ? 0 : 1
    material.pbrMetallicRoughness.setBaseColorFactor(color)
  })
}

// Рассчёт цвета в зависимости от состояния
const calculateColor = (percent=0, currentAlpha=1) => {
  const red = Math.min(255, percent * 2.55)
  return [red / 255, (255 - red) / 255, 0, currentAlpha]
}

// Есть ли материалы у детали
const hasMaterials = (node) => {
  return node.materials
};

// Отображается ли деталь в данный момент
const isNodeVisible = (node) => {
  if (!hasMaterials(node)) return false;
  return Array.from(node.materials.values()).every(material => {
    return material.pbrMetallicRoughness?.baseColorFactor?.[3] === 1;
  });
};
</script>

<template>
  <div class="model-viewer-container">
    <aside class="model-sidebar">
      <template v-if="modelLoaded">
        <h3 class="sidebar-title">Детали модели:</h3>
        <ul class="nodes-list">
          <li 
            v-for="node in nodes" 
            :key="node.name" 
            class="node-item"
          >
            <template v-if="hasMaterials(node)">
              <label class="node-label">
                <input 
                  type="checkbox" 
                  :checked="isNodeVisible(node)"
                  @change="toggleNodeVisibility(node)" 
                  class="node-checkbox"
                />
                {{ node.name }}
              </label>
            </template>
            <span v-else class="node-no-materials">
              {{ node.name }} (нет материалов)
            </span>
          </li>
        </ul>
      </template>
    </aside>

    <main class="model-display">
      <model-viewer
        ref="modelViewerRef"
        :src="model"
        :alt="name"
        camera-controls
        interaction-prompt="when-focused"
        @load="onModelLoad"
      />
    </main>
  </div>
</template>

<style scoped>
.model-viewer-container {
  display: flex;
  height: 90vh;
  width: 100%;
}

.model-sidebar {
  width: 300px;
  background-color: var(--sidebar-bg, #2d2d2d);
  color: var(--sidebar-text, white);
  padding: 1.25rem;
  overflow-y: auto;
}

.model-display {
  flex: 1;
  background-color: var(--model-bg, #000);
  padding: 1.25rem;
}

.sidebar-title {
  margin-top: 0;
  margin-bottom: 1rem;
}

.nodes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.node-item {
  margin: 0.625rem 0;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.node-checkbox {
  cursor: inherit;
}

.node-no-materials {
  opacity: 0.6;
}

model-viewer {
  width: 100%;
  height: 100%;
}
</style>