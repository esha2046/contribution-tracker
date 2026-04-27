// Initialize Pinata with environment variables
// Using direct REST API calls instead of SDK due to browser compatibility

/**
 * Generate SHA-256 hash of a file
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - The SHA-256 hash as hex string
 */
export const hashFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hashHex;
};

/**
 * Upload file to Pinata and get IPFS CID
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for upload progress (optional)
 * @returns {Promise<string>} - The IPFS CID
 */
export const uploadToPinata = async (file, onProgress) => {
  const apiKey = process.env.REACT_APP_PINATA_API_KEY;
  const secretKey = process.env.REACT_APP_PINATA_SECRET_KEY;

  console.log('DEBUG - API Key:', apiKey ? 'exists' : 'missing');
  console.log('DEBUG - Secret Key:', secretKey ? 'exists' : 'missing');
  console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('PINATA')));

  if (!apiKey || !secretKey) {
    throw new Error('Pinata API keys not found in environment variables. Check .env file.');
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
        },
      })
    );

    // Upload to Pinata using REST API
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      console.error('Pinata error response:', error);
      console.error('Status code:', response.status);
      throw new Error(`Pinata upload failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.IpfsHash; // This is the CID
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};

/**
 * Upload file and return both IPFS CID and file hash
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - { ipfsCID, fileHash }
 */
export const uploadFileWithHash = async (file, onProgress) => {
  try {
    // Update progress
    if (onProgress) onProgress({ status: 'hashing', progress: 20 });

    // Hash the file
    const fileHash = await hashFile(file);

    // Update progress
    if (onProgress) onProgress({ status: 'uploading', progress: 50 });

    // Upload to Pinata
    const ipfsCID = await uploadToPinata(file, (progress) => {
      if (onProgress) onProgress({ status: 'uploading', progress: 50 + progress * 0.5 });
    });

    // Complete
    if (onProgress) onProgress({ status: 'complete', progress: 100 });

    return {
      ipfsCID,
      fileHash,
    };
  } catch (error) {
    if (onProgress) onProgress({ status: 'error', error: error.message });
    throw error;
  }
};
