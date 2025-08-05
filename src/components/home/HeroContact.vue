<script setup></script>

<template>
  <main
    class="flex flex-col md:flex-row p-8 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-xl justify-around items-baseline md:items-center"
  >
    <div class="flex flex-col flex-1/2">
      <h1 class="text-white font-bold text-4xl">Ready to take control of your inventory?</h1>
      <p class="text-gray-200 mt-2">Join us today and take control of your inventory management.</p>
      <p class="text-gray-200 mt-1">Contact us for more information or to sign up.</p>
    </div>
    <div id="form-contact" class="flex-1/4">
      <form action="">
        <div class="flex flex-col">
          <label for="name">Name</label>
          <input type="text" name="name" id="name" placeholder="Enter your name" class="p-2" />
          <label for="email" class="mt-2">Email</label>
          <input type="email" name="email" id="email" placeholder="Enter your email" class="p-2"/>
          <label for="message" class="mt-2">Message</label>
          <textarea
            name="message"
            id="message"
            rows="4"
            placeholder="Enter your message"
            class="p-2"
          ></textarea>
          <button
            type="submit"
            class="mt-4 bg-white text-yellow-500 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
