export default defineEventHandler(async (event) => {
  try {
    const body = await readFormData(event);

    const res = await $fetch("https://api.imgur.com/3/image", {
      method: "POST",
      body: body,
      onRequest({ request, options }) {
        options.headers = options.headers || {};
        options.headers.authorization = `Bearer 8a425fdbfeb86c37f0bc97238bb2f7069b834767`;
      },
    });
    return res;
  } catch (error) {
    return error;
  }
});
