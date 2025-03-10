export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && setProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    } catch (error) {
      reject(error);
    }
  });
}
