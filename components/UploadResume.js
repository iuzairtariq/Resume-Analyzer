// Frontend code example (React)
const handleUpload = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64File = reader.result.split(',')[1];
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: JSON.stringify({ 
          file: base64File,
          userId: "your_user_id_here" 
        }),
      });
      console.log(await response.json());
    };
  };