export async function prepareFormData(files) {
  const formData = new FormData();
  for (const fileMeta of files) {
    if (fileMeta.id) {
      const response = await fetch(`http://localhost:8000/api/get-file/${fileMeta.id}`);
      const blob = await response.blob();
      const file = new File([blob], fileMeta.name, { type: blob.type });
      formData.append('files', file);
    }
  }
  return formData;
}
