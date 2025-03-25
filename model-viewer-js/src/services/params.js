//имя меша: процент 0-100
const getModelStats =() => {
  return [{"m100%_r83%":0}]
};

//файл модели
const getModel = () => {
  return {
    model: "models/viewmodel/MetalRoughSpheresNoTextures.glb",
    name: "Имя модели"
  };
};
  
export { getModelStats, getModel };
