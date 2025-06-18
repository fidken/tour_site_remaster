
        document.getElementById('download-btn').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/download-images', { method: 'GET' });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'images.zip';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                } else {
                    console.error('Failed to download images');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });