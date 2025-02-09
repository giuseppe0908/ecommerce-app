<script setup>
import { ref, computed, watch } from 'vue';
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();
const props = defineProps(['colorPrimary']);
const info = "Se il tuo ordine raggiunge 28,90 €, la tua spedizione è gratuita. Per i membri Plus, è sempre offerta.";
const price_shipping = 4.95;

const addquantity = (item) => {
    cartStore.addtocart(item);
    cartStore.total += item.price;
    localStorage.prezzototal = JSON.stringify(cartStore.total);
};

const removeQuantity = (item) => {
    cartStore.removetocart(item.codeItem);
    cartStore.total -= item.price;
};

const svuota = () => {
    localStorage.removeItem('carrello');
    localStorage.removeItem('prezzototal');
    cartStore.cart.splice(0, cartStore.cart.length);
    cartStore.total = 0;
};
</script>

<template>
    <div v-if="cartStore.flag_cart" class="cart rounded-2xl  fixed top-16 right-0 w-80 h-96 z-20 overflow-y-auto" :style="{ backgroundColor: props.colorPrimary }">
        <h3 class="text-xs font-bold p-2 m-2 text-white ">Aggiunto con successo al tuo carrello</h3>
        <div v-for="(item, index) in cartStore.cart" :key="index" class="item border border-black p-2 m-2">
            <div class="flex">
                <div class="photo w-24 h-40">
                    <img class="w-full h-32 object-cover" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwvYPYCtBxtKnwYC2Maa6PsNpOVmQ6_zjUNULVJl74DA&s" alt="Product Image">
                </div>
                <div class="desc pl-5 text-left">
                    <div class="brand -mt-4">
                        <p class="font-bold  text-black">{{ item.brand.name }}</p>
                    </div>
                    <div class="name -mt-4 text-white">
                        <p>{{ item.name }}</p>
                    </div>
                    <div class="price -mt-4 text-black">
                        {{ item.price.toFixed(2) }} €
                    </div>
                    <div class="color -mt-4 text-white">
                        <p>Colore: {{ item.color || 'N/A' }}</p>
                    </div>
                    <!-- <div class="size">
                        <p>Taglia: {{ item.size || 'N/A' }}</p>
                    </div> -->
                    <div class="quantity flex items-center -mt-4 text-white">
                       <p>Quantità: </p>
                        <div class="circle rounded-full h-[20px] w-[20px] bg-gray-200 flex items-center justify-center ml-2 cursor-pointer" >
                            <p class="text-black" @click="addquantity(item)">+</p>
                        </div>
                        <p class="ml-2">{{ item.quantity }}</p>
                        <div class="circle rounded-full h-[20px] w-[20px] bg-gray-200 flex items-center justify-center ml-2 cursor-pointer">
                            <p class="text-black" @click="removeQuantity(item)">-</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="info-extra p-2">
            <div class="info bg-gray-200 p-2 rounded">
                <p class="text-sm">{{ info }}</p>
            </div>
            <div class="shipping flex justify-between mt-2" v-if="cartStore.total <= 28.89">
                <div class="name">
                    <p>Spedizione</p>
                </div>
                <div class="value">
                    <p>{{ price_shipping.toFixed(2) }} €</p>
                </div>
            </div>
            <div class="shipping flex justify-between mt-2" v-else>
                <div class="name">
                    <p>Spedizione</p>
                </div>
                <div class="value">
                    <p>0.00 €</p>
                </div>
            </div>
            <div class="total mt-2 font-bold">
                Totale: {{ cartStore.total.toFixed(2) }} €
            </div>
            <div class="button mt-4" v-if="cartStore.cart.length > 0">
                <button class="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600">
                    <RouterLink to="/order">Compra</RouterLink>
                </button>
                <button @click="svuota" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Svuota</button>
            </div>
        </div>
    </div>
</template>