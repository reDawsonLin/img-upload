<script setup>
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";

// api fetching ----------------
const {
  data: data_gallery,
  error: error_gallery,
  refresh: refreshGallery,
} = await useFetch("/api/imgur");

// file upload ----------------
const src_beforeCropped = ref("");
const data_beforeCropped = ref({});

const onInputChange = (event) => {
  if (!event.target.files.length) return;

  const file = event.target.files[0];
  src_beforeCropped.value = window.URL.createObjectURL(file);
  data_beforeCropped.value = file;
};

// cropper ----------------
const cropper = ref(null);
const src_cropped = ref("");

const cropped = () => {
  src_cropped.value = cropper.value.getCroppedCanvas().toDataURL();
};

const cropped_reset = () => {
  src_cropped.value = "";
  cropper.value.reset();
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("title", data_beforeCropped.value.name);

    if (src_cropped.value) {
      // canvas to file ----------------
      const dataURL = cropper.value
        .getCroppedCanvas({ maxWidth: 4096, maxHeight: 4096 })
        .toDataURL("image/png");
      const blobBin = atob(dataURL.split(",")[1]);
      const array = [];
      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      const file = new Blob([new Uint8Array(array)], { type: "image/png" });
      formData.append("image", file);
    } else {
      formData.append("image", data_beforeCropped.value);
    }

    // post fetching ----------------
    const { data, error } = await $fetch("/api/imgur", {
      method: "POST",
      body: formData,
    });

    if (data) {
      src_beforeCropped.value = "";
      src_cropped.value = "";
      data_beforeCropped.value = {};
      refreshGallery();
    }
  } catch (error) {
    console.log("error :>>", error);
    showError(error);
  }
};

// error modal ----------------
const error_message = ref();
const show_error = ref(false);

const showError = (message) => {
  error_message.value = message;
  show_error.value = true;
};

const closeError = () => {
  message_error.value = "";
  show_error.value = false;
};
</script>

<template>
  <n-modal v-model:show="show_error" preset="dialog" type="warning">
    <template #header>Error</template>

    <p>{{ message_error }}</p>

    <template #action>
      <n-button @click="closeError()">OK</n-button>
    </template>
  </n-modal>

  <div class="grow flex flex-col items-center gap-4 px-4 pb-40 lg:px-8 max-w-[1280px]">
    <h1 class="text-2xl font-bold p-2 pt-4">Imgur Gallery</h1>

    <n-carousel :space-between="20" show-arrow class="bg-slate-500 aspect-[16/9]">
      <template v-for="item in data_gallery" :key="item">
        <img
          :src="item.link"
          alt="carousel img"
          class="w-[100%] h-[100%] object-cover object-center"
        />
      </template>
    </n-carousel>

    <n-button strong secondary type="success" tertiary class="p-0 ml-auto">
      <label class="flex w-full h-full p-3 cursor-pointer" @change="onInputChange">
        <input type="file" class="hidden" accept="image/*" />
        + New Image
      </label>
    </n-button>

    <div
      class="flex justify-between flex-wrap w-full gap-4 sm:flex-nowrap"
      v-if="src_beforeCropped"
    >
      <div class="flex flex-col gap-3 w-full sm:w-[70%] aspect-[16/9]">
        <h2>Origin Image</h2>
        <VueCropper
          ref="cropper"
          :src="src_beforeCropped"
          class="w-full rounded-md overflow-hidden"
          alt="origin image"
        ></VueCropper>

        <div class="flex gap-3 justify-end">
          <n-button tertiary type="primary" @click="cropped()">Crop</n-button>
          <n-button tertiary @click="cropped_reset()">Reset</n-button>
        </div>
      </div>

      <div class="grow shrink-0 flex flex-col gap-3 w-[30%]">
        <h2>Cropped Preview</h2>
        <div
          class="flex justify-center items-center w-full aspect-[16/9] bg-slate-400 rounded-md"
        >
          <img
            v-if="src_cropped"
            :src="src_cropped"
            class="w-full h-full object-cover object-center"
            alt="cropped image"
          />
        </div>
      </div>
    </div>

    <n-button
      v-if="src_beforeCropped"
      type="primary"
      class="ml-auto"
      @click="handleSubmit()"
      >Upload Image</n-button
    >
  </div>
</template>

<style>
#__nuxt {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f9ff;
}

h2 {
  font-size: 1.25rem;
  font-weight: 500;
}
</style>
