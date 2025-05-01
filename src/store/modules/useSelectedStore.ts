// stores/selectedImages.ts
import { defineStore } from 'pinia'

export const useSelectedStore = defineStore('selectedImages', {
  state: () => ({
    images: [] as any[]
  }),
  actions: {
    setImages(images: any[]) {
      this.images = images
    }
  }
})