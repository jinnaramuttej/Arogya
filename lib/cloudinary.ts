export async function uploadToCloudinary(base64Image: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'oqens-arogya';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  const formData = new FormData();
  formData.append('file', base64Image);
  // Defaulting to typical unauthenticated preset conventions. 
  // If the user's bucket refuses this, they will be notified to map an 'arogya_preset' inside Cloudinary.
  formData.append('upload_preset', 'arogya_preset');

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    
    if (data.secure_url) {
      return data.secure_url;
    }
    
    // Fallback if 'arogya_preset' is not configured natively but 'ml_default' is.
    if (data.error && data.error.message.includes("upload preset")) {
        console.warn("Cloudinary: 'arogya_preset' not found. Attempting 'ml_default'...");
        const fallbackData = new FormData();
        fallbackData.append('file', base64Image);
        fallbackData.append('upload_preset', 'ml_default');
        
        const retryRes = await fetch(url, { method: 'POST', body: fallbackData });
        const retryData = await retryRes.json();
        
        if (retryData.secure_url) return retryData.secure_url;
        throw new Error(retryData.error?.message || 'Cloudinary upload completely failed.');
    }

    throw new Error(data.error?.message || 'Upload failed');
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
}
