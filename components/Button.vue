<!-- <script setup>
const props = defineProps(['name', 'bgColor', 'colorText', 'to', 'leftRadius', 'width', 'height', 'ml_25', 'ml_46', 'size_13'])
</script>

<template>
        <div 
            class="btn shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center "
            :class="leftRadius ? '' : ' ml--30'"
            :style="{ backgroundColor: bgColor, width, height }">
            <NuxtLink :to="to" class="no-underline w-full">
            <span class="flex justify-center font-semibold" :style="{ color: colorText }">
                <p :style="{
                        marginLeft: ml_46 ? `${ml_46}` : (ml_25 ? `${ml_25}` : ''),
                        fontSize: size_13 ? `${size_13}` : ''
                    }"
                >
                    {{ name }}
                </p>
            </span>
            </NuxtLink>  
        </div>
</template>

<style scoped>
.btn {
   border-radius: 50px;
}
.ml--30 {
    margin-left: -30px;
}
</style> -->


<script setup>
const props = defineProps({
  name: { type: String, required: true },
  to: { type: String, required: true },
  bgColor: { type: String, default: '#ffffff' },
  textColor: { type: String, default: '#000000' },
  applyNegativeMargin: { type: Boolean, default: false },
  width: { type: String, default: 'auto' },
  height: { type: String, default: 'auto' },
  marginLeft: { type: String, default: '0' },
  fontSize: { type: String, default: '16px' },
  borderRadius: { type: String, default: '50px' },
});
</script>

<template>
  <div 
    class="btn shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-105"
    :class="{ '-ml-[30px]': applyNegativeMargin }"
    :style="{
      backgroundColor: bgColor,
      width,
      height,
      borderRadius: borderRadius
    }"
  >
    <NuxtLink 
      :to="to" 
      class="no-underline w-full h-full flex items-center justify-center"
      :aria-label="name"
    >
      <span 
        class="font-bold text-center"
        :style="{
          color: textColor,
          marginLeft: marginLeft,
          fontSize: fontSize,
          fontWeight: '800' 
        }"
      >
        {{ name }}
      </span>
    </NuxtLink>  
  </div>
</template>