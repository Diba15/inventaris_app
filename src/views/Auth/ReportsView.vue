<script setup>
</script>

<template>
  <div class="flex flex-col m-4 gap-4">
    <div class="bg-white rounded-xl shadow">
      <div
        class="bg-base text-secondary p-4 rounded-t-xl flex justify-between items-center flex-col md:flex-row"
      >
        <h1 class="text-xl font-bold self-start md:self-center">Generate Reports</h1>
      </div>

      <div class="min-h-[250px] p-4">
        <form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="col-span-full ">
            <div class="bg-gray-400 text-white px-4 py-2 rounded-lg min-h-[50px] flex justify-center items-center">
              <p>Isinya untuk generate report</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
