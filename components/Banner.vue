<template>
    <section class="flex flex-col lg:flex-row items-center bg-gray-100 p-6 lg:p-12 relative">
      <!-- Testo -->
      <div class="lg:w-1/2 z-10 flex justify-between items-center lg:block">
        <div class="left w-[50%]">
            <p class="newsletter  font-bold mb-4">Iscrivendoti alle nostre newsletter</p>
            <p class="text-[14px]">
            Ricevi notizie su promozioni, nuovi arrivi e ispirazioni di moda.
            </p>
            <div class="block lg:">
            
        </div>
        </div>
        <div class="rigth w-[50%]">
            <form class="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Il tuo indirizzo Email"
                    class="border border-gray-300 rounded-lg p-2"
                />
                <div class="flex justify-between min-w-[158px]">
                    <p class="font-medium">Le tue preferenze<br />Cosa preferisci?</p>
                    <div class="flex flex-col gap-4 mt-2">
                    <label class="flex items-center">
                        <input
                        type="radio"
                        name="preference"
                        value="moda-donna"
                        class="mr-2"
                        />
                        Moda donna
                    </label>
                    <label class="flex items-center">
                        <input
                        type="radio"
                        name="preference"
                        value="moda-uomo"
                        class="mr-2"
                        />
                        Moda uomo
                    </label>
                    </div>
                </div>
                <button
                    type="submit"
                    class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                    Iscriviti
                </button>
            </form>
            <p class="m-[-164px] lg:m-[0px] text-sm mt-4 lg:mt-8 lg:col-span-2 text-left">
               Consulta la nostra <a href="#" class="text-blue-500 underline">politica sulla privacy</a>
            </p>   
        </div>
          
      </div>
       
      
      <!-- Immagini Sovrapposte -->
      <div
        class="hidden lg:flex lg:items-center lg:w-1/2 relative h-[400px] w-full"
      >
        <div class="img flex">
         <!-- Immagine 1 -->
         <img
          src="https://via.placeholder.com/150"
          alt="Image 1"
          class="  top-0 left-12 w-28 h-28 object-cover z-10"
        />
        <!-- Immagine 2 -->
        <img
          src="https://via.placeholder.com/150"
          alt="Image 2"
          class="  top-16 left-32 w-36 h-36 object-cover rotate-12 z-0"
        />
        <!-- Immagine 3 -->
        <img
          src="https://via.placeholder.com/150"
          alt="Image 3"
          class="  top-36 left-8 w-40 h-40 object-cover z-20"
        />
        <!-- Immagine 4 -->
        <img
          src="https://via.placeholder.com/150"
          alt="Image 4"
          class="  top-52 left-40 w-28 h-28 object-cover -rotate-6 z-10"
        />
      </div>
       
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: "NewsletterSection",
  };
  </script>
  <style lang="css" scoped>
    .newsletter{
        font-size: 18px;
        font-weight: bold;
        color: #5D758B;
    }
  </style>