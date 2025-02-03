import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/download', async (req, res) => {
  try {
    const { url, format } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await ytdl.getInfo(url);
    
    const options = {
      quality: format === 'audio' ? 'highestaudio' : 'highest',
      filter: format === 'audio' ? 'audioonly' : 'videoandaudio'
    };

    const fileName = `${info.videoDetails.title}.${format === 'audio' ? 'mp3' : 'mp4'}`;
    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    res.header('Content-Type', format === 'audio' ? 'audio/mpeg' : 'video/mp4');

    ytdl(url, options).pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});