export default defineEventHandler(async (event) => {
  try {
    const { data } = await $fetch(
      "https://api.imgur.com/3/account/NiuNiu2024/images",
      {
        onRequest({ request, options }) {
          options.headers = options.headers || {};
          options.headers.authorization = `Bearer 8a425fdbfeb86c37f0bc97238bb2f7069b834767`;
        },
      }
    );

    return data;
  } catch (error) {
    return error;
  }
});
