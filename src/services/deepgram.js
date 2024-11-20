// import axios from 'axios';

// const DEEPGRAM_API_KEY = '3a830be24b630286896d15c4e2b37655541ac526'; // Replace with your Deepgram API key

// export const transcribeAudio = async (audioBlob) => {
//   const audioBuffer = await audioBlob.arrayBuffer();

//   try {
//     // Create a new FormData object to send the audio file
//     const formData = new FormData();
//     formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }));

//     // Send a POST request to Deepgram's transcription endpoint
//     const response = await axios.post(
//       'https://api.deepgram.com/v1/listen',
//       formData,
//       {
//         headers: {
//           'Authorization': `Bearer ${DEEPGRAM_API_KEY}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );

//     // Check the response structure and ensure you're accessing the correct transcription field
//     if (response.data && response.data.results && response.data.results.channels) {
//       const transcript = response.data.results.channels[0].alternatives[0].transcript;
//       return transcript; // Return the transcription text
//     } else {
//       throw new Error('Invalid response format');
//     }
//   } catch (error) {
//     console.error('Error transcribing audio:', error);
//     throw error;
//   }
// };
export const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
  
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        Authorization: '3a830be24b630286896d15c4e2b37655541ac526', // Replace with your Deepgram API key
      },
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }
  
    const result = await response.json();
    return result.results.channels[0].alternatives[0].transcript;
  };
  